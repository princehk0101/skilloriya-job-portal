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

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = idinfo["email"]

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": "seeker",
                    "is_verified": True
                }
            )

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

        except Exception:
            return Response({"error": "Invalid Google token"}, status=400)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


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
