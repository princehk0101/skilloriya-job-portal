from django.contrib import admin

from .models import Company
from .models import Microtask


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "location", "website", "created_at")
    list_filter = ("created_at", "location")
    search_fields = ("name", "owner__email", "location", "description", "website")
    readonly_fields = ("created_at",)
    autocomplete_fields = ("owner",)


@admin.register(Microtask)
class MicrotaskAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "reward", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "company__name", "description")
    readonly_fields = ("created_at",)
    autocomplete_fields = ("company",)
