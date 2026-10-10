from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from unittest.mock import patch
from rest_framework.test import APIClient

from .models import EmailOTP, ResumeVersion, User
from .serializers import OTPLoginVerifySerializer


class ResumeVersionTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(email='candidate@example.com', password='StrongPass123!', role='seeker')
		self.other = User.objects.create_user(email='other@example.com', password='StrongPass123!', role='seeker')

	def test_resume_versions_are_owner_scoped_and_deletable(self):
		self.client.force_authenticate(self.user)
		response = self.client.post('/api/users/resume-versions/', {
			'name': 'Backend CV', 'file': SimpleUploadedFile('backend.pdf', b'%PDF resume'),
		}, format='multipart')
		self.assertEqual(response.status_code, 201)
		resume_id = response.data['id']
		self.assertEqual(ResumeVersion.objects.get().user, self.user)

		self.client.force_authenticate(self.other)
		self.assertEqual(self.client.get('/api/users/resume-versions/').data['results'], [])
		self.assertEqual(self.client.delete(f'/api/users/resume-versions/{resume_id}/').status_code, 404)
		self.assertTrue(ResumeVersion.objects.filter(pk=resume_id).exists())

	def test_resume_version_rejects_unsupported_file(self):
		self.client.force_authenticate(self.user)
		response = self.client.post('/api/users/resume-versions/', {
			'name': 'Executable', 'file': SimpleUploadedFile('resume.exe', b'not a resume'),
		}, format='multipart')
		self.assertEqual(response.status_code, 400)


class EmailOtpTests(TestCase):
	def test_login_otp_must_have_login_purpose_and_be_unexpired(self):
		user = User.objects.create_user(email='otp@example.com', password='StrongPass123!', role='seeker', is_verified=True)
		verification_code = EmailOTP.objects.create(user=user, otp='111111', purpose='verification')
		self.assertFalse(OTPLoginVerifySerializer(data={'email': user.email, 'otp': '111111'}).is_valid())
		verification_code.delete()

		otp = EmailOTP.objects.create(user=user, otp='222222', purpose='login')
		EmailOTP.objects.filter(pk=otp.pk).update(created_at=timezone.now() - timedelta(minutes=11))
		serializer = OTPLoginVerifySerializer(data={'email': user.email, 'otp': '222222'})
		self.assertFalse(serializer.is_valid())
		self.assertFalse(EmailOTP.objects.filter(pk=otp.pk).exists())

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='auth@example.com')
	def test_password_login_returns_session_without_requiring_a_second_otp(self):
		user = User.objects.create_user(
			email='password-login@example.com', password='StrongPass123!', role='seeker', is_verified=True,
		)

		login_response = self.client.post('/api/users/login/', {'email': user.email, 'password': 'StrongPass123!'})

		self.assertEqual(login_response.status_code, 200)
		self.assertIn('access', login_response.data)
		self.assertEqual(len(mail.outbox), 0)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='auth@example.com', GOOGLE_CLIENT_ID='test-client')
	@patch('users.views.id_token.verify_oauth2_token')
	def test_google_login_returns_session_after_google_verifies_email(self, verify_google_token):
		verify_google_token.return_value = {
			'email': 'google-login@example.com', 'email_verified': True,
			'given_name': 'Google', 'family_name': 'Candidate',
		}

		login_response = self.client.post('/api/users/google-login/', {'token': 'valid-google-token', 'role': 'seeker'})

		self.assertEqual(login_response.status_code, 200)
		self.assertIn('access', login_response.data)
		user = User.objects.get(email='google-login@example.com')
		self.assertTrue(user.is_verified)
		self.assertFalse(EmailOTP.objects.filter(user=user, purpose='login').exists())

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='auth@example.com')
	def test_existing_unverified_account_gets_one_verification_step_then_normal_login(self):
		user = User.objects.create_user(
			email='unverified-login@example.com', password='StrongPass123!', role='seeker', is_verified=False,
		)
		client = APIClient()

		response = client.post('/api/users/login/', {'email': user.email, 'password': 'StrongPass123!'})

		self.assertEqual(response.status_code, 200)
		self.assertTrue(response.data['verification_required'])
		self.assertNotIn('access', response.data)
		otp = EmailOTP.objects.get(user=user, purpose='verification')
		verify_response = client.post('/api/users/verify-otp/', {'email': user.email, 'otp': otp.otp})
		self.assertEqual(verify_response.status_code, 200)
		login_response = client.post('/api/users/login/', {'email': user.email, 'password': 'StrongPass123!'})
		self.assertIn('access', login_response.data)
		user.refresh_from_db()
		self.assertTrue(user.is_verified)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='auth@example.com')
	def test_duplicate_signup_can_resend_verification_for_existing_account(self):
		user = User.objects.create_user(
			email='pending-signup@example.com', password='StrongPass123!', role='seeker', is_verified=False,
		)
		client = APIClient()
		duplicate = client.post('/api/users/register/', {
			'email': user.email, 'password': 'StrongPass123!', 'role': 'seeker',
		})
		self.assertEqual(duplicate.status_code, 400)
		self.assertIn('already exists', str(duplicate.data).lower())

		resend = client.post('/api/users/resend-verification-otp/', {'email': user.email})

		self.assertEqual(resend.status_code, 200)
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn('OTP', mail.outbox[0].body)
		self.assertEqual(EmailOTP.objects.filter(user=user, purpose='verification').count(), 1)

	@patch('users.views.send_otp_email', return_value=False)
	def test_signup_keeps_account_when_verification_email_cannot_be_sent(self, send_otp):
		client = APIClient()
		response = client.post('/api/users/register/', {
			'email': 'mail-down@example.com', 'password': 'StrongPass123!', 'role': 'seeker',
		})

		self.assertEqual(response.status_code, 201)
		self.assertFalse(response.data['verification_email_sent'])
		user = User.objects.get(email='mail-down@example.com')
		self.assertFalse(user.is_verified)
		login_response = client.post('/api/users/login/', {
			'email': user.email, 'password': 'StrongPass123!',
		})
		self.assertEqual(login_response.status_code, 503)
		self.assertFalse(login_response.data.get('access'))
