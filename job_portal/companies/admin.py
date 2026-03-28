from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "location", "website", "created_at")
    list_filter = ("created_at", "location")
    search_fields = ("name", "owner__email", "location", "description", "website")
    readonly_fields = ("created_at",)
    autocomplete_fields = ("owner",)
