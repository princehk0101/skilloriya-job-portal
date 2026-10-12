from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_otp_email(email, otp):
    """Send an OTP with branded HTML format and development debug fallback."""
    subject = f"Your Skilloriya Verification Code: {otp}"
    message = f"Your Skilloriya verification code is {otp}. This code is valid for 10 minutes."
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Skilloriya Verification</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Skilloriya</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Skill-Based Career & Recruitment Platform</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Verify your email address</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for registering on Skilloriya. Please enter the following 6-digit verification code to activate your account:
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px 28px; border-radius: 12px;">
              {otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            If you did not sign up for Skilloriya, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    """

    from_email = getattr(settings, 'EMAIL_HOST_USER', None) or getattr(settings, 'DEFAULT_FROM_EMAIL', None)

    if settings.DEBUG:
        print(f"\n[Skilloriya OTP] ==> Email: {email} | OTP: {otp}\n")

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False
        )
        return True
    except Exception:
        logger.exception("Failed to send OTP email to %s.", email)
        return False

