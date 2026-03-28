from django.urls import path
from .views import (
    RegisterView,
    VerifyOTPView,
    LoginView,
    ForgotPasswordView,
    SendLoginOTPView,
    LoginWithOTPView,
    ResetPasswordView,
    GoogleLoginView,
    ProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('login/', LoginView.as_view()),
    path('login-otp/request/', SendLoginOTPView.as_view()),
    path('login-otp/verify/', LoginWithOTPView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('google-login/', GoogleLoginView.as_view()),
    path('profile/', ProfileView.as_view()),
]
