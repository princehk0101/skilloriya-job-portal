from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from applications.models import Application, ApplicationStatusEvent
from jobs.models import Job


User = get_user_model()
DEMO_NAME_PARTS = [
	("Aarav", "Mehta", "Python, Django, REST APIs, Git"),
	("Diya", "Sharma", "React, JavaScript, CSS, Git"),
	("Kabir", "Patel", "SQL, Excel, Python, communication"),
]
DEMO_STATUSES = [
	Application.Status.APPLIED,
	Application.Status.SHORTLISTED,
	Application.Status.INTERVIEW,
]


def build_demo_resume(candidate_name, job_title):
	def pdf_escape(value):
		return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

	stream = (
		"BT /F1 18 Tf 72 720 Td (SKILLORIYA DEMO RESUME) Tj "
		f"/F1 12 Tf 0 -36 Td ({pdf_escape(candidate_name)}) Tj "
		f"0 -24 Td (Sample applicant for {pdf_escape(job_title)}) Tj "
		"0 -36 Td (Fictional profile for product demonstration only.) Tj ET"
	).encode("ascii", errors="replace")
	objects = [
		b"<< /Type /Catalog /Pages 2 0 R >>",
		b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
		b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
		b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
		b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n"
		+ stream + b"\nendstream",
	]
	pdf = bytearray(b"%PDF-1.4\n")
	offsets = [0]
	for index, obj in enumerate(objects, start=1):
		offsets.append(len(pdf))
		pdf.extend(f"{index} 0 obj\n".encode("ascii") + obj + b"\nendobj\n")
	xref_offset = len(pdf)
	pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
	pdf.extend(b"0000000000 65535 f \n")
	for offset in offsets[1:]:
		pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
	pdf.extend(
		f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
		f"startxref\n{xref_offset}\n%%EOF\n".encode("ascii")
	)
	return bytes(pdf)


class Command(BaseCommand):
	help = "Add fictional candidate profiles and application history to each demo job"

	@transaction.atomic
	def handle(self, *args, **options):
		jobs = list(Job.objects.filter(description__startswith="DEMO LISTING -").order_by("id"))
		if not jobs:
			raise CommandError("No demo jobs found. Run `python manage.py seed_demo_jobs` first.")

		created_count = 0
		for job in jobs:
			for index, (first_name, last_name, skills) in enumerate(DEMO_NAME_PARTS):
				email = f"demo.candidate.{job.pk}.{index + 1}@skilloriya.local"
				candidate, created = User.objects.get_or_create(
					email=email,
					defaults={
						"role": "seeker",
						"is_verified": True,
						"first_name": first_name,
						"last_name": last_name,
						"headline": f"Demo applicant for {job.title}",
						"location": job.location,
						"skills": skills,
						"experience_years": min(index, job.experience_required),
						"education": "Skilloriya Demo Institute",
					},
				)
				if created:
					candidate.set_unusable_password()
					candidate.save(update_fields=["password"])

				application, app_created = Application.objects.get_or_create(
					applicant=candidate,
					job=job,
					defaults={
						"full_name": f"{first_name} {last_name}",
						"college_name": "Skilloriya Demo Institute",
						"phone_number": f"00000000{job.pk:02d}{index + 1}",
						"cover_letter": f"DEMO APPLICATION - Fictional sample for the {job.title} listing.",
						"skills": skills,
						"status": Application.Status.APPLIED,
					},
				)
				if not app_created:
					continue

				application.resume.save(
					f"demo_resume_job_{job.pk}_candidate_{index + 1}.pdf",
					ContentFile(build_demo_resume(application.full_name, job.title)),
					save=False,
				)
				application.save()
				ApplicationStatusEvent.objects.get_or_create(
					application=application,
					to_status=Application.Status.APPLIED,
					defaults={"from_status": "", "changed_by": candidate},
				)
				target_status = DEMO_STATUSES[index]
				if target_status != Application.Status.APPLIED:
					application.status = target_status
					application.save(update_fields=["status"])
					ApplicationStatusEvent.objects.get_or_create(
						application=application,
						to_status=target_status,
						defaults={
							"from_status": Application.Status.APPLIED,
							"changed_by": job.employer,
						},
					)
				created_count += 1

		self.stdout.write(self.style.SUCCESS(
			f"Demo applications ready for {len(jobs)} demo jobs; {created_count} newly added."
		))
