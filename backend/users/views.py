from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import os

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    OTPRequestSerializer,
    OTPLoginVerifySerializer,
    ProfileSerializer,
)
from .models import User, EmailOTP
from .utils import send_otp_email
import random
import logging


logger = logging.getLogger(__name__)


# REGISTER 
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp_code = str(random.randint(100000, 999999))
        otp_record = EmailOTP.objects.create(user=user, otp=otp_code)

        try:
            send_otp_email(user.email, otp_code)
        except Exception:
            logger.exception("Failed to send signup OTP email for %s", user.email)
            otp_record.delete()
            user.delete()
            return Response(
                {"message": "We could not send the OTP email right now. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({
            "message": "User registered successfully. OTP sent to email."
        }, status=status.HTTP_201_CREATED)


# VERIFY OTP 
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp).last()

            if not otp_obj:
                return Response({"error": "Invalid OTP"}, status=400)

            user.is_verified = True
            user.save()
            otp_obj.delete()

            return Response({"message": "Email verified successfully"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)


# LOGIN 
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            "message": "Login successful",
            **serializer.validated_data
        }, status=status.HTTP_200_OK)


# FORGOT PASSWORD 
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))

            EmailOTP.objects.create(user=user, otp=otp)
            try:
                send_otp_email(user.email, otp)
            except Exception:
                logger.exception("Failed to send forgot-password OTP email for %s", user.email)
                return Response(
                    {"message": "We could not send the OTP email right now. Please try again later."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            return Response({"message": "OTP sent to email"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)


class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp = str(random.randint(100000, 999999))
        EmailOTP.objects.create(user=serializer.user, otp=otp)
        try:
            send_otp_email(serializer.user.email, otp)
        except Exception:
            logger.exception("Failed to send login OTP email for %s", serializer.user.email)
            return Response(
                {"message": "We could not send the OTP email right now. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"message": "Login OTP sent to email"})


class LoginWithOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPLoginVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.otp_obj.delete()

        return Response({
            "message": "OTP login successful",
            **serializer.validated_data["tokens"],
        }, status=status.HTTP_200_OK)


#  RESET PASSWORD 
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp).last()

            if not otp_obj:
                return Response({"error": "Invalid OTP"}, status=400)

            user.password = make_password(new_password)
            user.save()
            otp_obj.delete()

            return Response({"message": "Password reset successful"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)


# = GOOGLE LOGIN 
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        requested_role = request.data.get("role") or "seeker"
        if requested_role not in ("seeker", "employer"):
            requested_role = "seeker"

        if not token:
            return Response({"error": "Google token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = getattr(settings, "GOOGLE_CLIENT_ID", None) or os.getenv("GOOGLE_CLIENT_ID")
            if not client_id:
                return Response({"error": "Google client ID is not configured on the backend."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                client_id
            )

            email = idinfo.get("email")
            if not email:
                return Response({"error": "Email not found in Google token."}, status=status.HTTP_400_BAD_REQUEST)

            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": requested_role,
                    "is_verified": True,
                    "first_name": first_name,
                    "last_name": last_name,
                }
            )

            if created:
                user.role = requested_role
            elif not user.role or user.role not in ("seeker", "employer"):
                user.role = requested_role

            if not user.is_verified:
                user.is_verified = True

            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name

            user.save(update_fields=["role", "is_verified", "first_name", "last_name"])

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Google login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })

        except Exception as e:
            logger.exception("Google login verification failed: %s", str(e))
            return Response({"error": f"Invalid Google token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self.patch(request)


# --- Work endpoints (user-posted work / portfolio) ---
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
)

from .serializers import WorkSerializer
from .models import Work


class WorkCreateView(CreateAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PublicWorkListView(ListAPIView):
    queryset = Work.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = WorkSerializer
    permission_classes = [AllowAny]


class UserWorkListView(ListAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Work.objects.filter(owner=self.request.user).order_by('-created_at')


class WorkDetailView(RetrieveAPIView):
    queryset = Work.objects.all()
    serializer_class = WorkSerializer
    permission_classes = [AllowAny]


class WorkUpdateView(UpdateAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Work.objects.filter(owner=self.request.user)


class WorkDeleteView(DestroyAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Work.objects.filter(owner=self.request.user)


from .models import UserSubscription
from datetime import timedelta
from django.utils import timezone


PLANS_CATALOG = [
    {
        "id": "free",
        "name": "Free Starter",
        "price": 0,
        "billing": "Forever free",
        "role_target": "both",
        "popular": False,
        "features": [
            "Search and apply to unlimited standard jobs",
            "Basic profile with portfolio & resume upload",
            "Take skill assessments and earn badges",
            "Basic job alerts and notification bell"
        ]
    },
    {
        "id": "pro_seeker",
        "name": "Pro Seeker",
        "price": 499,
        "billing": "per month",
        "role_target": "seeker",
        "popular": True,
        "features": [
            "AI Resume Parser & Auto Profile Enhancer",
            "Real-time AI Match Score on every job",
            "Highlighted Gold Candidate badge on applications",
            "Direct in-app messaging with recruiters",
            "Priority applicant ranking in recruiter lists"
        ]
    },
    {
        "id": "recruiter_pro",
        "name": "Recruiter Pro",
        "price": 1999,
        "billing": "per month",
        "role_target": "employer",
        "popular": True,
        "features": [
            "Post unlimited active job listings",
            "3 Featured / Boosted job listings included",
            "Interactive Kanban applicant pipeline",
            "Built-in WebRTC Video Interview Scheduler",
            "Direct chat with candidates"
        ]
    },
    {
        "id": "enterprise",
        "name": "Enterprise Unlimited",
        "price": 4999,
        "billing": "per month",
        "role_target": "employer",
        "popular": False,
        "features": [
            "All Recruiter Pro features included",
            "Verified Employer Blue Badge",
            "Unlimited Boosted job listings",
            "Top search visibility across categories",
            "Dedicated hiring manager support"
        ]
    }
]


class SubscriptionPlanView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_plan = "free"
        if request.user.is_authenticated:
            sub = UserSubscription.objects.filter(user=request.user, is_active=True).first()
            if sub:
                user_plan = sub.plan
        return Response({
            "plans": PLANS_CATALOG,
            "current_plan": user_plan
        })


class ActivateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id', 'free')
        valid_plans = [p['id'] for p in PLANS_CATALOG]
        if plan_id not in valid_plans:
            return Response({'error': 'Invalid plan selected.'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulate checkout / activation
        expires = timezone.now() + timedelta(days=30) if plan_id != 'free' else None
        
        sub, created = UserSubscription.objects.update_or_create(
            user=request.user,
            defaults={
                'plan': plan_id,
                'is_active': True,
                'expires_at': expires,
            }
        )

        return Response({
            'success': True,
            'plan': sub.plan,
            'expires_at': sub.expires_at,
            'message': f"Successfully upgraded to {sub.get_plan_display()} plan!"
        })

