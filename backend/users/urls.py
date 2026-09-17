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
from .views import (
    WorkCreateView,
    PublicWorkListView,
    UserWorkListView,
    WorkDetailView,
    WorkUpdateView,
    WorkDeleteView,
    SubscriptionPlanView,
    ActivateSubscriptionView,
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
    # User works (portfolio)
    path('works/', PublicWorkListView.as_view()),
    path('works/my/', UserWorkListView.as_view()),
    path('works/create/', WorkCreateView.as_view()),
    path('works/<int:pk>/', WorkDetailView.as_view()),
    path('works/<int:pk>/update/', WorkUpdateView.as_view()),
    path('works/<int:pk>/delete/', WorkDeleteView.as_view()),
    # Subscriptions
    path('subscriptions/', SubscriptionPlanView.as_view()),
    path('subscriptions/activate/', ActivateSubscriptionView.as_view()),
]
