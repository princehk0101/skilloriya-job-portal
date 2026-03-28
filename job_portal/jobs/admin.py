from django.contrib import admin

from .models import Job, JobCategory


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.action(description="Mark selected jobs as active")
def make_jobs_active(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description="Mark selected jobs as inactive")
def make_jobs_inactive(modeladmin, request, queryset):
    queryset.update(is_active=False)


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "employer",
        "category",
        "location",
        "job_type",
        "salary",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "job_type", "category", "created_at")
    search_fields = ("title", "employer__email", "employer__company_name", "location", "description")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("employer", "category")
    actions = (make_jobs_active, make_jobs_inactive)

    fieldsets = (
        ("Job Info", {"fields": ("title", "description", "category", "employer")}),
        ("Details", {"fields": ("location", "job_type", "salary", "experience_required", "is_active")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
