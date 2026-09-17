from rest_framework import serializers
from .models import Assessment, AssessmentQuestion, UserAssessmentResult


class AssessmentListSerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'time_minutes',
            'passing_score',
            'level',
            'icon_name',
            'description',
            'questions_count',
            'user_status',
        ]

    def get_user_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        last_result = UserAssessmentResult.objects.filter(user=request.user, assessment=obj).order_by('-score_percentage').first()
        if last_result:
            return {
                'passed': last_result.passed,
                'best_score': last_result.score_percentage,
                'completed_at': last_result.completed_at,
            }
        return None


class AssessmentQuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'order',
        ]


class UserAssessmentResultSerializer(serializers.ModelSerializer):
    assessment_title = serializers.ReadOnlyField(source='assessment.title')
    assessment_category = serializers.ReadOnlyField(source='assessment.category')

    class Meta:
        model = UserAssessmentResult
        fields = [
            'id',
            'assessment',
            'assessment_title',
            'assessment_category',
            'score_percentage',
            'total_questions',
            'correct_answers',
            'passed',
            'badge_title',
            'completed_at',
        ]
