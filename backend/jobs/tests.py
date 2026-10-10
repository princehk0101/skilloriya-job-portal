import tempfile
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.core.management import call_command
from rest_framework.test import APIClient
from io import StringIO

from users.models import User
from .alerts import alert_matches_job, notify_matching_job_alerts
from .models import Job, JobAlert
from applications.models import Application


class JobAlertTests(TestCase):
	def setUp(self):
		self.employer = User.objects.create_user(email='employer@example.com', password='StrongPass123!', role='employer')
		self.seeker = User.objects.create_user(email='seeker@example.com', password='StrongPass123!', role='seeker')
		self.job = Job.objects.create(
			employer=self.employer, title='Python Backend Engineer',
			description='Build Django APIs with PostgreSQL', location='Remote - India',
			salary=120000, job_type='remote', experience_required=3,
		)

	def test_alert_matches_keyword_skill_location_salary_and_experience(self):
		alert = JobAlert.objects.create(
			user=self.seeker, name='Remote Python', keyword='engineer', skills='Python, React',
			location='India', job_type='remote', min_salary=100000,
			max_salary=150000, experience_required=4,
		)
		self.assertTrue(alert_matches_job(alert, self.job))
		alert.location = 'London'
		self.assertFalse(alert_matches_job(alert, self.job))

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='jobs@example.com')
	def test_matching_alert_sends_email(self):
		JobAlert.objects.create(user=self.seeker, name='Python jobs', skills='Python')
		notify_matching_job_alerts(self.job)
		self.assertEqual(len(mail.outbox), 1)
		self.assertEqual(mail.outbox[0].to, [self.seeker.email])
		self.assertIn(self.job.title, mail.outbox[0].subject)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='jobs@example.com')
	def test_new_vacancy_emails_candidate_with_matching_applied_role(self):
		applied_job = Job.objects.create(
			employer=self.employer, title='Python Backend Engineer', description='Build APIs',
			location='Remote - India', salary=100000, job_type='remote', experience_required=1,
		)
		Application.objects.create(
			applicant=self.seeker, job=applied_job, full_name='Candidate', college_name='College',
			phone_number='9999999999', skills='Python, Django',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		new_job = Job.objects.create(
			employer=self.employer, title='Junior Python Backend Developer', description='Create backend services',
			location='Bengaluru', salary=80000, job_type='hybrid', experience_required=0,
		)

		notify_matching_job_alerts(new_job)

		self.assertEqual(len(mail.outbox), 1)
		self.assertEqual(mail.outbox[0].to, [self.seeker.email])
		self.assertIn(new_job.title, mail.outbox[0].subject)
		self.assertIn(f'/jobs/{new_job.id}', mail.outbox[0].body)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='jobs@example.com')
	def test_candidate_can_turn_off_new_vacancy_emails(self):
		self.seeker.job_email_alerts = False
		self.seeker.save(update_fields=['job_email_alerts'])
		applied_job = Job.objects.create(
			employer=self.employer, title='Python Backend Engineer', description='Build APIs',
			location='Remote - India', salary=100000, job_type='remote', experience_required=1,
		)
		Application.objects.create(
			applicant=self.seeker, job=applied_job, full_name='Candidate', college_name='College',
			phone_number='9999999999', skills='Python, Django',
			resume=SimpleUploadedFile('resume.pdf', b'%PDF resume'),
		)
		new_job = Job.objects.create(
			employer=self.employer, title='Junior Python Backend Developer', description='Create backend services',
			location='Bengaluru', salary=80000, job_type='hybrid', experience_required=0,
		)

		notify_matching_job_alerts(new_job)

		self.assertEqual(len(mail.outbox), 0)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', EMAIL_HOST_USER='jobs@example.com')
	def test_profile_skill_can_match_new_vacancy_before_first_application(self):
		self.seeker.skills = 'Python, Django'
		self.seeker.save(update_fields=['skills'])
		new_job = Job.objects.create(
			employer=self.employer, title='Python API Developer', description='Build services',
			required_skills=['Python', 'Django'], location='Remote', salary=80000,
			job_type='remote', experience_required=0,
		)

		notify_matching_job_alerts(new_job)

		self.assertEqual(len(mail.outbox), 1)
		self.assertEqual(mail.outbox[0].to, [self.seeker.email])


class DemoJobSeedTests(TestCase):
	def test_demo_seed_is_repeatable_and_creates_six_listings(self):
		call_command('seed_demo_jobs', stdout=StringIO())
		call_command('seed_demo_jobs', stdout=StringIO())
		demo_jobs = Job.objects.filter(description__startswith='DEMO LISTING -')
		self.assertEqual(demo_jobs.count(), 10)
		self.assertFalse(demo_jobs.filter(employer__company__is_verified=True).exists())
		for category_name in ['Design', 'Development', 'Marketing', 'Finance', 'Management', 'Sales', 'Customer Support', 'Human Resource', 'Data Analytics']:
			self.assertTrue(Job.objects.filter(category__name=category_name, is_active=True).exists(), category_name)

	@override_settings(MEDIA_ROOT=tempfile.mkdtemp(prefix='skilloriya-demo-test-'))
	def test_demo_applications_seed_three_profiles_per_demo_job_without_duplicates(self):
		call_command('seed_demo_jobs', stdout=StringIO())
		call_command('seed_demo_applications', stdout=StringIO())
		call_command('seed_demo_applications', stdout=StringIO())

		demo_jobs = Job.objects.filter(description__startswith='DEMO LISTING -')
		self.assertEqual(demo_jobs.count(), 10)
		self.assertEqual(Application.objects.filter(job__in=demo_jobs).count(), 30)
		self.assertTrue(all(job.applications.count() == 3 for job in demo_jobs))
		self.assertTrue(Application.objects.filter(job__in=demo_jobs, resume__endswith='.pdf').exists())
		self.assertTrue(demo_jobs.first().applications.first().status_history.exists())

		job = demo_jobs.first()
		client = APIClient()
		client.force_authenticate(job.employer)
		applicants_response = client.get(f'/api/applications/job/{job.id}/applicants/')
		self.assertEqual(applicants_response.status_code, 200)
		self.assertEqual(applicants_response.data['count'], 3)
		dashboard_response = client.get('/api/applications/employer/dashboard/')
		self.assertEqual(dashboard_response.data['total_applications'], 3)
