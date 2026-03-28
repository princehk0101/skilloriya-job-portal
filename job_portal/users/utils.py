from django.core.mail import send_mail
from django.conf import settings


def send_otp_email(email, otp):
    send_mail(
        subject="Your OTP Verification Code",
        message=f"Your OTP verification code is {otp}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
    )