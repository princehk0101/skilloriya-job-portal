from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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
    ResumeVersionSerializer,
)
from .models import User, EmailOTP, ResumeVersion
from .utils import send_otp_email
import random
import logging


logger = logging.getLogger(__name__)


def issue_login_otp(user):
    otp_code = str(random.randint(100000, 999999))
    otp_record = EmailOTP.objects.create(user=user, otp=otp_code, purpose='login')
    if not send_otp_email(user.email, otp_code):
        otp_record.delete()
        return False
    return True


def issue_verification_otp(user):
    EmailOTP.objects.filter(user=user, purpose='verification').delete()
    otp_code = str(random.randint(100000, 999999))
    otp_record = EmailOTP.objects.create(user=user, otp=otp_code, purpose='verification')
    if not send_otp_email(user.email, otp_code):
        otp_record.delete()
        return False
    return True


# REGISTER 
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_register'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_verified = True
        user.save(update_fields=['is_verified'])

        # Optional background notification / OTP record
        try:
            otp_code = str(random.randint(100000, 999999))
            EmailOTP.objects.create(user=user, otp=otp_code, purpose='verification')
            send_otp_email(user.email, otp_code)
        except Exception:
            logger.warning("Could not send welcome OTP email for %s", user.email)

        # Issue JWT tokens directly so user is immediately logged in
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "User registered successfully.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "company_name": getattr(user, 'company_name', '') or "",
                "is_verified": user.is_verified,
            }
        }, status=status.HTTP_201_CREATED)


# VERIFY OTP 
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_otp_verify'

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp, purpose='verification').last()

            if not otp_obj or otp_obj.is_expired:
                if otp_obj:
                    otp_obj.delete()
                return Response({"error": "Invalid OTP"}, status=400)

            user.is_verified = True
            user.save(update_fields=['is_verified'])
            otp_obj.delete()

            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Email verified successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "company_name": getattr(user, 'company_name', '') or "",
                    "is_verified": user.is_verified,
                }
            })

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)


class ResendVerificationOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_otp_request'

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'No account needs verification for this email. Check the address or create an account.'}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified or user.is_staff or user.is_superuser:
            return Response({'message': 'This email is already verified. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)

        EmailOTP.objects.filter(user=user, purpose='verification').delete()
        if not issue_verification_otp(user):
            return Response({'message': 'We could not send the verification email. Please try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'message': 'Verification OTP sent. Check your inbox and spam folder.', 'email': user.email})


# LOGIN 
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_login'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        if not user.is_verified and not (user.is_staff or user.is_superuser):
            if not issue_verification_otp(user):
                return Response(
                    {'message': 'This account needs email verification, but we could not send the verification email. Please try again later.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response({
                'message': 'We sent a one-time verification code. Enter it once to activate your account.',
                'email': user.email,
                'verification_required': True,
            }, status=status.HTTP_200_OK)
        return Response({
            "message": "Login successful",
            **serializer.validated_data,
        }, status=status.HTTP_200_OK)


# FORGOT PASSWORD 
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_password_reset'

    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))

            EmailOTP.objects.create(user=user, otp=otp, purpose='password_reset')
            try:
                if not send_otp_email(user.email, otp):
                    raise RuntimeError('Password reset OTP email could not be sent.')
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_otp_request'

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not serializer.user.is_verified and not (serializer.user.is_staff or serializer.user.is_superuser):
            if not issue_verification_otp(serializer.user):
                return Response({'message': 'We could not send the verification email. Please try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({
                'message': 'This account needs email verification first. We sent a verification OTP.',
                'email': serializer.user.email,
                'verification_required': True,
            }, status=status.HTTP_200_OK)

        if not issue_login_otp(serializer.user):
            return Response(
                {"message": "We could not send the OTP email right now. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"message": "Login OTP sent to email", "email": serializer.user.email, "otp_required": True})


class LoginWithOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_otp_verify'

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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_password_reset'

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp, purpose='password_reset').last()

            if not otp_obj or otp_obj.is_expired:
                if otp_obj:
                    otp_obj.delete()
                return Response({"error": "Invalid OTP"}, status=400)

            if not new_password:
                return Response({"error": "A new password is required."}, status=400)

            try:
                validate_password(new_password, user=user)
            except DjangoValidationError as error:
                return Response({"error": error.messages}, status=400)

            user.password = make_password(new_password)
            user.save()
            otp_obj.delete()

            return Response({"message": "Password reset successful"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=400)


# = GOOGLE LOGIN 
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_login'

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
            if not email or not idinfo.get('email_verified'):
                return Response({"error": "A Google-verified email is required."}, status=status.HTTP_400_BAD_REQUEST)

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
        except Exception as e:
            logger.exception("Google login verification failed: %s", str(e))
            return Response({"error": "Google sign-in token is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Google login successful",
            "user": {"id": user.id, "email": user.email, "role": user.role},
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_new_user": created,
        }, status=status.HTTP_200_OK)


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


class ResumeVersionListCreateView(ListCreateAPIView):
    serializer_class = ResumeVersionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return ResumeVersion.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeVersionDeleteView(DestroyAPIView):
    serializer_class = ResumeVersionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResumeVersion.objects.filter(user=self.request.user)


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
            "Planned: enhanced resume parsing",
            "Planned: premium candidate profile badge",
            "Planned: recruiter messaging tools",
            "Planned: premium applicant insights"
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
            "Planned: expanded job posting limits",
            "Planned: featured job listings",
            "Planned: advanced applicant pipeline",
            "Planned: interview scheduling tools",
            "Planned: candidate messaging tools"
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
            "Planned: all Recruiter Pro features",
            "Planned: verified employer profile",
            "Planned: expanded featured listings",
            "Planned: enhanced company visibility",
            "Planned: team hiring tools"
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

        if plan_id != 'free':
            return Response(
                {'error': 'Paid checkout is not configured yet. No payment or upgrade was made.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        expires = None
        
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

