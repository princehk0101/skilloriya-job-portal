import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import User

email = "admin@skilloriya.com"
password = "AdminPassword@123!"

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email, password)
    print("Superuser created successfully.")
else:
    user = User.objects.get(email=email)
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_verified = True
    user.save()
    print("Superuser updated successfully.")
