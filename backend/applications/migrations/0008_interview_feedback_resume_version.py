from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0007_application_status_event'),
        ('users', '0007_resume_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='resume_version',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='applications', to='users.resumeversion'),
        ),
        migrations.CreateModel(
            name='InterviewFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()),
                ('feedback', models.TextField()),
                ('is_approved', models.BooleanField(default=False)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('interview', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='feedback_record', to='applications.videointerview')),
                ('interviewer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='interview_feedback_given', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
    ]
