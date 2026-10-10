from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from companies.models import Company
from jobs.models import Job, JobCategory


User = get_user_model()

DEMO_JOBS = [
	{
		"company": "PixelForge Studio",
		"email": "demo-pixelforge@skilloriya.local",
		"location": "Bengaluru",
		"category": "Development",
		"title": "Junior React Developer",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nHelp build accessible dashboards and responsive product pages with React.\n\nSkills: React, JavaScript, HTML, CSS, REST APIs, Git. Candidates should share a small project or portfolio.",
		"salary": 600000,
		"job_type": "hybrid",
		"experience": 1,
	},
	{
		"company": "Nirmaan Cloud Systems",
		"email": "demo-nirmaan@skilloriya.local",
		"location": "Remote - India",
		"category": "Development",
		"title": "Python Django Backend Developer",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nBuild and maintain REST APIs for a cloud workflow product. Work with the team on database design, code reviews, and deployment.\n\nSkills: Python, Django, Django REST Framework, PostgreSQL, Git, testing. Familiarity with Docker is useful.",
		"salary": 900000,
		"job_type": "remote",
		"experience": 2,
	},
	{
		"company": "MetricLeaf Analytics",
		"email": "demo-metricleaf@skilloriya.local",
		"location": "Pune",
		"category": "Data Analytics",
		"title": "Entry-Level Data Analyst",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nTurn product and customer data into clear reports that help teams make decisions. Prepare dashboards and explain trends to non-technical stakeholders.\n\nSkills: SQL, Excel, Python, data visualization, communication. Power BI experience is a plus.",
		"salary": 650000,
		"job_type": "onsite",
		"experience": 0,
	},
	{
		"company": "NeatCanvas Design Co.",
		"email": "demo-neatcanvas@skilloriya.local",
		"location": "Remote - India",
		"category": "Design",
		"title": "UI/UX Designer",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nCreate simple, accessible flows for web products. Collaborate with developers and product teammates from early sketches through handoff.\n\nSkills: Figma, wireframing, prototyping, user research, visual design, accessibility. A portfolio is required.",
		"salary": 550000,
		"job_type": "remote",
		"experience": 1,
	},
	{
		"company": "Banyan Growth Works",
		"email": "demo-banyan@skilloriya.local",
		"location": "Hyderabad",
		"category": "Marketing",
		"title": "Digital Marketing Associate",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nSupport campaign planning, write useful content, and report on audience growth across digital channels.\n\nSkills: SEO, content marketing, social media, Google Analytics, copywriting, communication. Basic design skills are welcome.",
		"salary": 500000,
		"job_type": "hybrid",
		"experience": 1,
	},
	{
		"company": "HelpNest Software",
		"email": "demo-helpnest@skilloriya.local",
		"location": "Chennai",
		"category": "Customer Support",
		"title": "Customer Success Associate",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nHelp customers get started with a SaaS product, answer product questions, and share recurring issues with the product team.\n\nSkills: customer support, communication, problem solving, documentation, CRM tools. Fresh graduates may apply.",
		"salary": 420000,
		"job_type": "onsite",
		"experience": 0,
	},
	{
		"company": "Finlytica Services",
		"email": "demo-finlytica@skilloriya.local",
		"location": "Mumbai",
		"category": "Finance",
		"title": "Financial Operations Analyst",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nSupport monthly reporting, reconcile routine transactions, and help the finance team improve spreadsheet-based workflows.\n\nSkills: Excel, financial analysis, accounting basics, attention to detail, communication. Familiarity with SQL is a plus.",
		"salary": 650000,
		"job_type": "hybrid",
		"experience": 1,
	},
	{
		"company": "Orbit PeopleTech",
		"email": "demo-orbitpeople@skilloriya.local",
		"location": "Hyderabad",
		"category": "Management",
		"title": "Project Coordinator",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nCoordinate project plans, capture decisions, follow up on milestones, and keep cross-functional teammates aligned.\n\nSkills: project management, planning, documentation, communication, spreadsheets. Familiarity with Agile is helpful.",
		"salary": 720000,
		"job_type": "onsite",
		"experience": 1,
	},
	{
		"company": "Northstar Sales Labs",
		"email": "demo-northstar@skilloriya.local",
		"location": "Gurugram",
		"category": "Sales",
		"title": "Sales Development Representative",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nConnect with prospective customers, understand their needs, and help the account team build a healthy sales pipeline.\n\nSkills: sales, lead generation, customer communication, negotiation, CRM tools. Fresh graduates may apply.",
		"salary": 550000,
		"job_type": "hybrid",
		"experience": 0,
	},
	{
		"company": "PeopleSpring Talent",
		"email": "demo-peoplespring@skilloriya.local",
		"location": "Remote - India",
		"category": "Human Resource",
		"title": "Human Resources Coordinator",
		"description": "DEMO LISTING - Fictional role for showcasing Skilloriya.\n\nHelp coordinate interview schedules, maintain onboarding records, and answer routine employee questions with care and confidentiality.\n\nSkills: human resources, recruitment, communication, organization, documentation. HR internship experience is useful.",
		"salary": 500000,
		"job_type": "remote",
		"experience": 1,
	},
]


class Command(BaseCommand):
	help = "Create clearly labelled fictional job listings across the default categories for local product demos"

	def handle(self, *args, **options):
		created_count = 0
		for item in DEMO_JOBS:
			user, user_created = User.objects.get_or_create(
				email=item["email"],
				defaults={
					"role": "employer",
					"is_verified": True,
					"first_name": item["company"],
					"company_name": item["company"],
					"location": item["location"],
				},
			)
			if user_created:
				user.set_unusable_password()
				user.save(update_fields=["password"])

			Company.objects.get_or_create(
				owner=user,
				defaults={
					"name": item["company"],
					"description": "Fictional demo company used to showcase the Skilloriya job portal. This is not a real employer.",
					"location": item["location"],
					"is_verified": False,
				},
			)
			category, _ = JobCategory.objects.get_or_create(
				name=item["category"],
				defaults={"slug": item["category"].lower().replace(" ", "-")},
			)
			_, created = Job.objects.get_or_create(
				employer=user,
				title=item["title"],
				defaults={
					"category": category,
					"description": item["description"],
					"location": item["location"],
					"salary": item["salary"],
					"job_type": item["job_type"],
					"experience_required": item["experience"],
					"is_active": True,
					"is_featured": False,
				},
			)
			created_count += int(created)

		self.stdout.write(self.style.SUCCESS(
			f"Demo job seed complete: {len(DEMO_JOBS)} listings available; {created_count} newly added."
		))
