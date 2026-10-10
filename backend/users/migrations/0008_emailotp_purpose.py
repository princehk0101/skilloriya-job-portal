from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_resume_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='emailotp',
            name='purpose',
            field=models.CharField(choices=[('verification', 'Email verification'), ('login', 'Login'), ('password_reset', 'Password reset')], default='login', max_length=20),
        ),
    ]
