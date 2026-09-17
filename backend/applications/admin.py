from django.contrib import admin

from .models import Application


@admin.action(description="Mark selected applications as shortlisted")
def mark_shortlisted(modeladmin, request, queryset):
    queryset.update(status=Application.Status.SHORTLISTED)


@admin.action(description="Mark selected applications as accepted")
def mark_accepted(modeladmin, request, queryset):
    queryset.update(status=Application.Status.ACCEPTED)


@admin.action(description="Mark selected applications as rejected")
def mark_rejected(modeladmin, request, queryset):
    queryset.update(status=Application.Status.REJECTED)


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
