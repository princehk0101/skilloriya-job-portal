from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from jobs.models import Job
from users.models import User
from .models import Application


class ApplicationApiTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.seeker = User.objects.create_user(
			email='seeker@example.com',
			password='StrongPass123!',
			role='seeker',
			is_verified=True,
		)
		self.employer = User.objects.create_user(
			email='employer@example.com',
			password='StrongPass123!',
			role='employer',
			is_verified=True,
		)
		self.job = Job.objects.create(
			employer=self.employer,
			title='Backend Engineer',
			description='Build APIs',
			location='Remote',
			salary=100000,
			job_type='remote',
			experience_required=2,
		)

	def test_saved_resume_is_used_when_applying(self):
		self.seeker.resume = SimpleUploadedFile('resume.pdf', b'%PDF resume')
		self.seeker.save()
		self.client.force_authenticate(self.seeker)

		response = self.client.post(
			f'/api/applications/apply/{self.job.id}/',
			{
				'full_name': 'Job Seeker',
				'college_name': 'Skilloria University',
				'phone_number': '9999999999',
			},
		)

		self.assertEqual(response.status_code, 201)
		application = Application.objects.get()
		self.assertEqual(application.status, Application.Status.APPLIED)
		self.assertTrue(application.resume.name)

	def test_duplicate_application_is_rejected(self):
		Application.objects.create(
			applicant=self.seeker,
			job=self.job,
			full_name='Job Seeker',
			college_name='Skilloria University',
			phone_number='9999999999',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		self.client.force_authenticate(self.seeker)

		response = self.client.post(f'/api/applications/apply/{self.job.id}/', {})

		self.assertEqual(response.status_code, 400)

	def test_employer_can_update_application_status(self):
		application = Application.objects.create(
			applicant=self.seeker,
			job=self.job,
			full_name='Job Seeker',
			college_name='Skilloria University',
			phone_number='9999999999',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		self.client.force_authenticate(self.employer)

		response = self.client.patch(
			f'/api/applications/applications/{application.id}/status/',
			{'status': Application.Status.SHORTLISTED},
		)

		self.assertEqual(response.status_code, 200)
		application.refresh_from_db()
		self.assertEqual(application.status, Application.Status.SHORTLISTED)
