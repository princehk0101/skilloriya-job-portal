from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0005_seed_job_categories'),
        ('users', '0005_user_resume'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='jobs.job')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_jobs', to='users.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='JobAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('keyword', models.CharField(blank=True, max_length=255)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('job_type', models.CharField(blank=True, choices=[('remote', 'Remote'), ('onsite', 'Onsite'), ('hybrid', 'Hybrid')], max_length=20)),
                ('min_salary', models.PositiveIntegerField(blank=True, null=True)),
                ('max_salary', models.PositiveIntegerField(blank=True, null=True)),
                ('experience_required', models.PositiveIntegerField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job_alerts', to='users.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='savedjob',
            constraint=models.UniqueConstraint(fields=('user', 'job'), name='unique_saved_job'),
        ),
    ]