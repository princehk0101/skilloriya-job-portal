from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_email(email, otp):
    """Send OTP email. On failure log and print OTP so registration doesn't fail when SMTP is not configured.

    Returns True if email was (likely) sent or logged, False otherwise.
    """
    subject = "Your OTP Verification Code"
    message = f"Your OTP verification code is {otp}"
    from_email = getattr(settings, 'EMAIL_HOST_USER', None) or getattr(settings, 'DEFAULT_FROM_EMAIL', None)

    try:
        send_mail(subject=subject, message=message, from_email=from_email, recipient_list=[email])
        return True
    except Exception:
        logger.exception("Failed to send OTP email to %s; falling back to logging the OTP.", email)
        # As a fallback, log the OTP so developers/admins can retrieve it.
        logger.info("Fallback OTP for %s: %s", email, otp)
        # Also print to stdout to make it visible in many hosting logs.
        try:
            print(f"OTP for {email}: {otp}")
        except Exception:
            pass
        return False