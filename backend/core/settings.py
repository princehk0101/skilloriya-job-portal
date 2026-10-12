from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

# ================= BASE DIR =================
BASE_DIR = Path(__file__).resolve().parent.parent

# ================= LOAD ENV =================
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ================= SECURITY =================
SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "127.0.0.1,localhost,.onrender.com"
).split(",")

# ================= APPLICATIONS =================
INSTALLED_APPS = [

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third Party
    "rest_framework",
    "django_filters",
    "corsheaders",
    "rest_framework_simplejwt",

    # Local Apps
    "applications",
    "jobs",
    "skills",
    "users",
    "companies",
]

# ================= MIDDLEWARE =================
MIDDLEWARE = [

    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

# ================= TEMPLATES =================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ================= DATABASE =================
USE_SQLITE = os.getenv("USE_SQLITE", "False") == "True"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    from urllib.parse import urlparse, unquote
    parsed_db = urlparse(DATABASE_URL)
    is_neon_or_ssl = "neon.tech" in (parsed_db.hostname or "") or "sslmode=require" in DATABASE_URL
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed_db.path.lstrip("/")),
            "USER": unquote(parsed_db.username or ""),
            "PASSWORD": unquote(parsed_db.password or ""),
            "HOST": parsed_db.hostname,
            "PORT": parsed_db.port or 5432,
            "OPTIONS": {"sslmode": "require"} if is_neon_or_ssl else {},
        }
    }
elif USE_SQLITE:
    if os.getenv("RENDER") == "true":
        db_path = "/opt/render/project/src/job_portal/media/db.sqlite3"
        try:
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        except Exception:
            pass
    else:
        db_path = BASE_DIR / "db.sqlite3"

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": db_path,
        }
    }
else:
    db_host = os.getenv("DB_HOST", "")
    is_neon_host = "neon.tech" in db_host or os.getenv("DB_SSL", "False") == "True"
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": db_host,
            "PORT": os.getenv("DB_PORT", "5432"),
            "OPTIONS": {"sslmode": "require"} if is_neon_host else {},
        }
    }

# ================= CUSTOM USER =================
AUTH_USER_MODEL = "users.User"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# ================= EMAIL CONFIG =================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = "smtp.gmail.com"

EMAIL_PORT = 587

EMAIL_USE_TLS = True

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")

EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
EMAIL_TIMEOUT = 10

# ================= PASSWORD VALIDATION =================
AUTH_PASSWORD_VALIDATORS = [

    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},

    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},

    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},

    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ================= INTERNATIONAL =================
LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True

# ================= STATIC =================
STATIC_URL = "/static/"

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ================= MEDIA =================
MEDIA_URL = "/media/"

MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# ================= CLOUD STORAGE (ImageKit & Supabase) =================
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT", "")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "resumes")

# ================= REST FRAMEWORK =================
REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": (

        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (

        "rest_framework.permissions.IsAuthenticated",
    ),

    "DEFAULT_FILTER_BACKENDS": [

        "django_filters.rest_framework.DjangoFilterBackend",

        "rest_framework.filters.SearchFilter",

        "rest_framework.filters.OrderingFilter",
    ],

    "DEFAULT_PAGINATION_CLASS":
    "rest_framework.pagination.PageNumberPagination",

    "PAGE_SIZE": 10,
    "DEFAULT_THROTTLE_RATES": {
        "auth_register": "20/hour",
        "auth_login": "10/minute",
        "auth_otp_request": "3/minute",
        "auth_otp_verify": "10/minute",
        "auth_password_reset": "5/hour",
    },
}

# ================= JWT SETTINGS =================
SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),

    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ================= GOOGLE LOGIN =================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ================= CORS =================
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

# ================= DEFAULT PRIMARY KEY =================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ================= CELERY & REDIS =================
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

# ================= EMAIL CONFIGURATION =================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "coder.hk07@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER or "Skilloriya <noreply@skilloriya.com>"

