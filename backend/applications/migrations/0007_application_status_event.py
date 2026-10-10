from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def create_tracking_baselines(apps, schema_editor):
    Application = apps.get_model('applications', 'Application')
    ApplicationStatusEvent = apps.get_model('applications', 'ApplicationStatusEvent')
    events = []
    for application in Application.objects.all().iterator(chunk_size=500):
        events.append(ApplicationStatusEvent(
            application_id=application.id,
            from_status='',
            to_status=application.status,
            is_baseline=True,
            created_at=timezone.now(),
        ))
        if len(events) == 500:
            ApplicationStatusEvent.objects.bulk_create(events, batch_size=500)
            events = []
    if events:
        ApplicationStatusEvent.objects.bulk_create(events, batch_size=500)


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0006_videointerview'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ApplicationStatusEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_status', models.CharField(blank=True, max_length=20)),
                ('to_status', models.CharField(choices=[('applied', 'Applied'), ('waitlist', 'Waitlist'), ('screening', 'Screening'), ('interview', 'Interview'), ('offer', 'Offer'), ('shortlisted', 'Shortlisted'), ('rejected', 'Rejected'), ('accepted', 'Accepted')], max_length=20)),
                ('is_baseline', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='applications.application')),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='application_status_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_at', 'id'],
            },
        ),
        migrations.RunPython(create_tracking_baselines, migrations.RunPython.noop),
    ]
