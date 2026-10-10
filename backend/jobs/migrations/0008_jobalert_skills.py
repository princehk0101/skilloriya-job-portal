from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0007_job_is_featured'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobalert',
            name='skills',
            field=models.TextField(blank=True, help_text='Comma-separated skills; an alert matches any listed skill'),
        ),
    ]
