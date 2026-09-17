from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0004_application_skills'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('applied', 'Applied'),
                    ('waitlist', 'Waitlist'),
                    ('screening', 'Screening'),
                    ('interview', 'Interview'),
                    ('offer', 'Offer'),
                    ('shortlisted', 'Shortlisted'),
                    ('rejected', 'Rejected'),
                    ('accepted', 'Accepted'),
                ],
                default='applied',
                max_length=20,
            ),
        ),
    ]