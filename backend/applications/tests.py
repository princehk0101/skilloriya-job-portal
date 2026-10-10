from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from unittest.mock import patch
from rest_framework.test import APIClient

from jobs.models import Job
from companies.models import Company
from users.models import User
from .models import Application, ApplicationStatusEvent, InterviewFeedback, VideoInterview, SkillProof
from users.models import ResumeVersion


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
		Company.objects.create(
			owner=self.employer,
			name='Acme Studio',
			description='Test employer company',
			location='Remote',
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

	def test_candidate_can_submit_skill_proof_and_job_challenge(self):
		self.job.required_skills = ['React', 'REST APIs']
		self.job.practical_challenge = 'Share a project demonstrating API integration.'
		self.job.save()
		self.seeker.resume = SimpleUploadedFile('resume.pdf', b'%PDF resume')
		self.seeker.save()
		self.client.force_authenticate(self.seeker)
		response = self.client.post(f'/api/applications/apply/{self.job.id}/', {
			'full_name': 'Job Seeker', 'college_name': 'Skilloria University', 'phone_number': '9999999999',
			'proof_skills': 'React, REST APIs', 'proof_url': 'https://github.com/example/demo',
			'proof_explanation': 'Built a small React client that consumes a REST API.',
		})
		self.assertEqual(response.status_code, 201)
		proof = SkillProof.objects.get(application__applicant=self.seeker)
		self.assertEqual(proof.status, SkillProof.Status.SUBMITTED)
		self.assertEqual(response.data['skill_proof']['artifact_url'], 'https://github.com/example/demo')

	def test_only_job_owner_can_review_skill_proof(self):
		application = Application.objects.create(
			applicant=self.seeker, job=self.job, full_name='Job Seeker', college_name='Skilloria University',
			phone_number='9999999999', resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		SkillProof.objects.create(application=application, skills_demonstrated='Django', explanation='Built an API.')
		self.client.force_authenticate(self.employer)
		response = self.client.patch(f'/api/applications/applications/{application.id}/skill-proof/review/', {
			'status': 'verified', 'review_note': 'Clear and relevant work sample.',
		})
		self.assertEqual(response.status_code, 200)
		proof = SkillProof.objects.get(application=application)
		self.assertEqual(proof.status, SkillProof.Status.VERIFIED)
		self.assertEqual(proof.reviewed_by, self.employer)
		self.assertEqual(response.data['skill_proof']['review_note'], 'Clear and relevant work sample.')

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
		self.assertEqual(application.status_history.count(), 1)
		self.assertEqual(application.status_history.first().to_status, Application.Status.APPLIED)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='jobs@example.com')
	def test_successful_application_sends_confirmation_to_candidate(self):
		self.seeker.resume = SimpleUploadedFile('resume.pdf', b'%PDF resume')
		self.seeker.save()
		self.client.force_authenticate(self.seeker)

		with self.captureOnCommitCallbacks(execute=True):
			response = self.client.post(
				f'/api/applications/apply/{self.job.id}/',
				{
					'full_name': 'Job Seeker <Candidate>',
					'college_name': 'Skilloria University',
					'phone_number': '9999999999',
				},
			)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(len(mail.outbox), 1)
		self.assertEqual(mail.outbox[0].to, [self.seeker.email])
		self.assertIn(self.job.title, mail.outbox[0].subject)
		self.assertIn('Acme Studio', mail.outbox[0].subject)
		self.assertIn('Acme Studio via Skilloriya', mail.outbox[0].from_email)
		self.assertEqual(mail.outbox[0].reply_to, [self.employer.email])
		self.assertIn('received successfully', mail.outbox[0].body)
		self.assertTrue(response.data['confirmation_email_sent'])
		self.assertEqual(len(mail.outbox[0].alternatives), 1)
		html_body, content_type = mail.outbox[0].alternatives[0]
		self.assertEqual(content_type, 'text/html')
		self.assertIn('Application received!', html_body)
		self.assertIn('Job Seeker &lt;Candidate&gt;', html_body)
		self.assertNotIn('<Candidate>', html_body)

	@patch('applications.views.send_application_confirmation', return_value=False)
	def test_apply_response_reports_confirmation_email_failure(self, send_confirmation):
		self.seeker.resume = SimpleUploadedFile('resume.pdf', b'%PDF resume')
		self.seeker.save()
		self.client.force_authenticate(self.seeker)

		with self.captureOnCommitCallbacks(execute=True):
			response = self.client.post(
				f'/api/applications/apply/{self.job.id}/',
				{
					'full_name': 'Job Seeker',
					'college_name': 'Skilloria University',
					'phone_number': '9999999999',
				},
			)

		self.assertEqual(response.status_code, 201)
		self.assertFalse(response.data['confirmation_email_sent'])
		self.assertIn('could not be sent', response.data['message'])
		send_confirmation.assert_called_once()

	def test_selected_resume_version_is_copied_to_application(self):
		version = ResumeVersion.objects.create(
			user=self.seeker,
			name='Backend role resume',
			file=SimpleUploadedFile('backend.pdf', b'%PDF backend resume'),
		)
		self.client.force_authenticate(self.seeker)

		response = self.client.post(
			f'/api/applications/apply/{self.job.id}/',
			{
				'full_name': 'Job Seeker',
				'college_name': 'Skilloria University',
				'phone_number': '9999999999',
				'resume_version_id': str(version.id),
			},
		)

		self.assertEqual(response.status_code, 201)
		application = Application.objects.get()
		self.assertEqual(application.resume_version, version)
		application.resume.open('rb')
		try:
			self.assertEqual(application.resume.read(), b'%PDF backend resume')
		finally:
			application.resume.close()

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
		event = application.status_history.latest('created_at')
		self.assertEqual(event.from_status, Application.Status.APPLIED)
		self.assertEqual(event.to_status, Application.Status.SHORTLISTED)

	def test_employer_dashboard_returns_job_application_analytics(self):
		Application.objects.create(
			applicant=self.seeker,
			job=self.job,
			full_name='Job Seeker',
			college_name='Skilloria University',
			phone_number='9999999999',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		self.client.force_authenticate(self.employer)

		response = self.client.get('/api/applications/employer/dashboard/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['total_applications'], 1)
		self.assertEqual(response.data['applications_per_job'][0]['job_id'], self.job.id)

	def test_interview_feedback_is_hidden_until_interviewer_approves_it(self):
		application = Application.objects.create(
			applicant=self.seeker,
			job=self.job,
			full_name='Job Seeker',
			college_name='Skilloria University',
			phone_number='9999999999',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		interview = VideoInterview.objects.create(
			application=application,
			employer=self.employer,
			candidate=self.seeker,
			room_id='skilloria-test-room',
			scheduled_at=timezone.now(),
			notes='Private interviewer notes',
		)
		InterviewFeedback.objects.create(
			interview=interview,
			interviewer=self.employer,
			rating=4,
			feedback='Strong technical reasoning and clear communication.',
		)
		self.client.force_authenticate(self.seeker)

		candidate_response = self.client.get(f'/api/applications/interviews/{interview.room_id}/')

		self.assertEqual(candidate_response.status_code, 200)
		self.assertIsNone(candidate_response.data['feedback'])
		self.assertEqual(candidate_response.data['notes'], '')

		self.client.force_authenticate(self.employer)
		approve_response = self.client.patch(
			f'/api/applications/interviews/{interview.id}/feedback/',
			{'approve': True},
			format='json',
		)
		self.assertEqual(approve_response.status_code, 200)

		self.client.force_authenticate(self.seeker)
		approved_response = self.client.get(f'/api/applications/interviews/{interview.room_id}/')
		self.assertTrue(approved_response.data['feedback']['is_approved'])
