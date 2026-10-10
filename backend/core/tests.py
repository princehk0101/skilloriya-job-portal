from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from jobs.models import Job
from users.models import User, ResumeVersion
from .ai_views import calculate_job_match


class JobMatchExplanationTests(TestCase):
	def test_match_explains_skills_and_score_components(self):
		user = User.objects.create_user(
			email='candidate@example.com', password='StrongPass123!', role='seeker',
			skills='Python, Django', experience_years=2, location='India',
		)
		employer = User.objects.create_user(email='employer@example.com', password='StrongPass123!', role='employer')
		job = Job.objects.create(
			employer=employer, title='Python Developer', description='Django and PostgreSQL experience required',
			location='India', salary=100000, job_type='onsite', experience_required=3,
		)

		result = calculate_job_match(user, job)

		self.assertIn('Python', result['matched_skills'])
		self.assertIn('Postgresql', result['missing_skills'])
		self.assertEqual(result['score_breakdown']['skills']['out_of'], 70)
		self.assertEqual(result['match_score'], sum(part['score'] for part in result['score_breakdown'].values()))

	def test_resume_upload_recommendations_use_the_selected_resume_skills(self):
		candidate = User.objects.create_user(email='resume-match@example.com', password='StrongPass123!', role='seeker')
		employer = User.objects.create_user(email='resume-employer@example.com', password='StrongPass123!', role='employer')
		resume = ResumeVersion.objects.create(
			user=candidate,
			name='Backend CV',
			file=SimpleUploadedFile('backend.pdf', b'%PDF-1.4\n(Python Django 2 years experience) Tj'),
		)
		job = Job.objects.create(
			employer=employer,
			title='Django Backend Developer',
			description='Build Python APIs',
			required_skills=['Python', 'Django'],
			location='India',
			salary=100000,
			job_type='remote',
			experience_required=1,
		)
		client = APIClient()
		client.force_authenticate(candidate)

		response = client.get(f'/api/ai/recommended-jobs/?resume_id={resume.id}')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data[0]['id'], job.id)
		self.assertEqual(response.data[0]['ai_match']['matching_basis'], 'resume')
		self.assertIn('Python', response.data[0]['ai_match']['matched_skills'])
		self.assertIn('Django', response.data[0]['ai_match']['matched_skills'])
