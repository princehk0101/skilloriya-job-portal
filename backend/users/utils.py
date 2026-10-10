from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_email(email, otp):
    """Send an OTP without exposing the code in application logs on failure."""
    subject = "Your OTP Verification Code"
    message = f"Your OTP verification code is {otp}"
    from_email = getattr(settings, 'EMAIL_HOST_USER', None) or getattr(settings, 'DEFAULT_FROM_EMAIL', None)

    try:
        send_mail(subject=subject, message=message, from_email=from_email, recipient_list=[email])
        return True
    except Exception:
        logger.exception("Failed to send OTP email to %s.", email)
        return False
