from django.contrib import admin
from django.db import transaction

from .models import Application, ApplicationStatusEvent


def bulk_change_status(request, queryset, target_status):
    with transaction.atomic():
        for application in queryset.select_related('job', 'applicant').iterator():
            previous_status = application.status
            if previous_status == target_status:
                continue
            application.status = target_status
            application.save(update_fields=['status'])
            ApplicationStatusEvent.objects.create(
                application=application,
                from_status=previous_status,
                to_status=target_status,
                changed_by=request.user,
            )


@admin.action(description="Mark selected applications as shortlisted")
def mark_shortlisted(modeladmin, request, queryset):
    bulk_change_status(request, queryset, Application.Status.SHORTLISTED)


@admin.action(description="Mark selected applications as accepted")
def mark_accepted(modeladmin, request, queryset):
    bulk_change_status(request, queryset, Application.Status.ACCEPTED)


@admin.action(description="Mark selected applications as rejected")
def mark_rejected(modeladmin, request, queryset):
    bulk_change_status(request, queryset, Application.Status.REJECTED)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "applicant",
        "job",
        "status",
        "phone_number",
        "applied_at",
    )
    list_filter = ("status", "applied_at", "job__job_type")
    search_fields = (
        "full_name",
        "applicant__email",
        "job__title",
        "college_name",
        "phone_number",
        "skills",
    )
    readonly_fields = ("applied_at",)
    autocomplete_fields = ("applicant", "job")
    actions = (mark_shortlisted, mark_accepted, mark_rejected)

    fieldsets = (
        ("Applicant", {"fields": ("applicant", "full_name", "college_name", "phone_number")}),
        ("Application", {"fields": ("job", "resume", "cover_letter", "skills", "status")}),
        ("Timestamp", {"fields": ("applied_at",)}),
    )
