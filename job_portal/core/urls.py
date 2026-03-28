from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Apps
    path('api/admin/', include('core.admin_urls')),
    path('api/users/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/companies/', include('companies.urls')),

    #  JWT LOGIN ROUTES
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media in local/dev even when DEBUG is false.
if not settings.DEBUG:
    urlpatterns += [
        path("media/<path:path>", serve, {"document_root": settings.MEDIA_ROOT}),
    ]
