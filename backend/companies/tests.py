from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User
from .models import Company, CompanyReview


class CompanyPublicProfileTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.owner = User.objects.create_user(
			email='company@example.com', password='StrongPass123!', role='employer'
		)
		self.reviewer = User.objects.create_user(
			email='reviewer@example.com', password='StrongPass123!', role='seeker'
		)
		self.company = Company.objects.create(
			owner=self.owner,
			name='Sample Studio',
			description='A sample company profile',
			location='Remote',
		)

	def test_company_without_reviews_does_not_show_a_fake_rating(self):
		response = self.client.get('/api/companies/')
		self.assertEqual(response.status_code, 200)
		company = response.data['results'][0]
		self.assertIsNone(company['average_rating'])
		self.assertEqual(company['reviews_count'], 0)

	def test_company_rating_is_calculated_from_published_reviews(self):
		CompanyReview.objects.create(
			company=self.company,
			reviewer=self.reviewer,
			rating=4,
			title='Good collaboration',
			review='Helpful teammates and clear goals.',
		)
		response = self.client.get('/api/companies/')
		company = response.data['results'][0]
		self.assertEqual(company['average_rating'], 4.0)
		self.assertEqual(company['reviews_count'], 1)
