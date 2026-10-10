import logging
import os
from email.utils import formataddr

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.template.loader import render_to_string


logger = logging.getLogger(__name__)


def send_application_confirmation(*, recipient, candidate_name, job_title, job_id, application_id):
	frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
	job = None
	try:
		from jobs.models import Job
		job = Job.objects.select_related('employer').get(pk=job_id)
	except Job.DoesNotExist:
		pass

	company = getattr(getattr(job, 'employer', None), 'company', None)
	company_name = (
		getattr(company, 'name', None)
		or getattr(getattr(job, 'employer', None), 'company_name', None)
		or 'Hiring team'
	)
	employer_email = getattr(getattr(job, 'employer', None), 'email', '')
	reply_to = []
	if employer_email and not employer_email.casefold().endswith(('.local', '.test', '.invalid')):
		try:
			validate_email(employer_email)
			reply_to = [employer_email]
		except ValidationError:
			pass
	location = getattr(job, 'location', '') or 'Location not specified'
	salary = getattr(job, 'salary', None)
	salary_display = f"₹{salary:,.0f} per year" if salary else 'As listed in the job post'
	job_url = f'{frontend_url}/jobs/{job_id}'
	dashboard_url = f'{frontend_url}/dashboard'

	message = (
		f"Hi {candidate_name},\n\n"
		f"Your application for {job_title} has been received successfully.\n\n"
		f"Company: {company_name}\n"
		f"Location: {location}\n"
		f"Salary: {salary_display}\n"
		f"Application reference: #{application_id}\n"
		f"Track your application status: {dashboard_url}\n"
		f"Job details: {job_url}\n\n"
		"Thank you for applying through Skilloriya. You will be notified when the employer updates your application status.\n\n"
		+ (
			"Reply to this email to contact the hiring team."
			if reply_to else "This is an automated message; please do not reply."
		)
	)
	html_message = render_to_string('emails/application_confirmation.html', {
		'candidate_name': candidate_name,
		'job_title': job_title,
		'company_name': company_name,
		'location': location,
		'salary_display': salary_display,
		'application_id': application_id,
		'dashboard_url': dashboard_url,
		'job_url': job_url,
		'can_reply_to_employer': bool(reply_to),
	})

	try:
		email = EmailMultiAlternatives(
			subject=f"{company_name} received your application: {job_title}",
			body=message,
			from_email=formataddr((f'{company_name} via Skilloriya', settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL)),
			to=[recipient],
			reply_to=reply_to,
		)
		email.attach_alternative(html_message, 'text/html')
		return email.send(fail_silently=False) == 1
	except Exception:
		logger.exception(
			"Unable to send application confirmation for application %s to %s",
			application_id,
			recipient,
		)
		return False
