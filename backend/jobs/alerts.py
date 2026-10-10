import logging
import os
import re

from django.conf import settings
from django.core.mail import send_mail

from .models import JobAlert


logger = logging.getLogger(__name__)


def alert_matches_job(alert, job):
    text = f'{job.title} {job.description} {" ".join(job.required_skills or [])}'.casefold()
    if alert.keyword and alert.keyword.casefold() not in text:
        return False
    if alert.location and alert.location.casefold() not in job.location.casefold():
        return False
    if alert.job_type and alert.job_type != job.job_type:
        return False
    if alert.min_salary is not None and job.salary < alert.min_salary:
        return False
    if alert.max_salary is not None and job.salary > alert.max_salary:
        return False
    if alert.experience_required is not None and job.experience_required > alert.experience_required:
        return False

    skills = [skill.strip().casefold() for skill in alert.skills.split(',') if skill.strip()]
    return not skills or any(skill in text for skill in skills)


ROLE_STOP_WORDS = {
    'junior', 'senior', 'lead', 'staff', 'principal', 'intern', 'internship',
    'developer', 'engineer', 'specialist', 'associate', 'manager', 'job', 'role',
}


def _tokens(value):
    return {word for word in re.findall(r'[a-z0-9+#.]+', (value or '').casefold()) if len(word) > 1}


def _candidate_matches_job(candidate, job, applications):
    new_job_skills = {skill.strip().casefold() for skill in (job.required_skills or []) if skill.strip()}
    candidate_skills = {skill.strip().casefold() for skill in re.split(r'[,|/\n]', candidate.skills or '') if skill.strip()}
    previous_roles = []
    for application in applications:
        previous_roles.append(application.job)
        candidate_skills.update(
            skill.strip().casefold()
            for skill in re.split(r'[,|/\n]', application.skills or '')
            if skill.strip()
        )

    job_text = f'{job.title} {job.description} {" ".join(job.required_skills or [])}'.casefold()
    if candidate_skills.intersection(new_job_skills) or any(
        re.search(r'(?<![a-z0-9])' + re.escape(skill) + r'(?![a-z0-9])', job_text)
        for skill in candidate_skills
    ):
        return True

    new_role_terms = _tokens(job.title) - ROLE_STOP_WORDS
    for applied_job in previous_roles:
        if job.category_id and applied_job.category_id == job.category_id:
            return True
        previous_terms = _tokens(applied_job.title) - ROLE_STOP_WORDS
        if new_role_terms and len(new_role_terms.intersection(previous_terms)) >= min(2, len(new_role_terms)):
            return True
    return False


def notify_candidates_for_new_job(job, excluded_user_ids=None):
    from users.models import User

    excluded_user_ids = excluded_user_ids or set()
    candidates = User.objects.filter(
        role='seeker', is_active=True, job_email_alerts=True,
    ).exclude(id__in=excluded_user_ids).prefetch_related('applications__job')
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    for candidate in candidates.iterator(chunk_size=100):
        applications = list(candidate.applications.all())
        if not _candidate_matches_job(candidate, job, applications):
            continue
        try:
            send_mail(
                subject=f'New vacancy matching your job interests: {job.title}',
                message=(
                    f"Hi {candidate.first_name or 'there'},\n\n"
                    f'A new opening matches a role you applied for or skills in your profile.\n\n'
                    f'{job.title}\n{job.location} · {job.get_job_type_display()}\n'
                    f'Annual salary: {job.salary}\n\n'
                    f'View details and apply: {frontend_url}/jobs/{job.pk}\n\n'
                    f'Manage job email alerts: {frontend_url}/settings'
                ),
                from_email=settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL,
                recipient_list=[candidate.email],
                fail_silently=True,
            )
        except Exception:
            logger.exception('Unable to send new job recommendation email to user %s', candidate.pk)


def notify_matching_job_alerts(job):
    alerts = JobAlert.objects.filter(user__is_active=True, is_active=True).select_related('user')
    notified_user_ids = set()
    for alert in alerts.iterator():
        if not alert.user.job_email_alerts:
            continue
        if not alert_matches_job(alert, job):
            continue
        try:
            send_mail(
                subject=f'New job matching your alert: {job.title}',
                message=(
                    f'A new job matches your "{alert.name}" alert.\n\n'
                    f'{job.title}\n{job.location} · {job.get_job_type_display()}\n'
                    f'Salary: {job.salary}\n\n'
                    f'View this job: {os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")}/jobs/{job.pk}'
                ),
                from_email=settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL,
                recipient_list=[alert.user.email],
                fail_silently=True,
            )
            notified_user_ids.add(alert.user_id)
        except Exception:
            logger.exception('Unable to send matching job alert email for alert %s', alert.pk)
    notify_candidates_for_new_job(job, excluded_user_ids=notified_user_ids)
