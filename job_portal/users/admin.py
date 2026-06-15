from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, EmailOTP
from .models import Work


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-date_joined",)
    list_display = (
        "email",
        "role",
        "is_verified",
        "is_staff",
        "is_superuser",
        "date_joined",
    )
    list_filter = ("role", "is_verified", "is_staff", "is_superuser", "is_active")
    search_fields = ("email", "first_name", "last_name", "phone_number", "company_name")
    readonly_fields = ("last_login", "date_joined")

    fieldsets = (
        ("Account", {"fields": ("email", "password", "role", "is_verified")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone_number", "location", "headline", "bio")}),
        ("Professional Info", {"fields": ("skills", "experience_years", "education", "designation", "company_name")}),
        ("Links", {"fields": ("website", "linkedin_url", "github_url", "profile_image")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "role", "password1", "password2", "is_verified", "is_staff", "is_superuser"),
            },
        ),
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "otp", "created_at")
    search_fields = ("user__email", "otp")
    readonly_fields = ("created_at",)
    list_select_related = ("user",)


@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "is_public", "created_at")
    list_filter = ("is_public", "created_at")
    search_fields = ("title", "owner__email", "description")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("owner",)
