from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Assessment, AssessmentQuestion, UserAssessmentResult
from .assessment_serializers import (
    AssessmentListSerializer,
    AssessmentQuestionPublicSerializer,
    UserAssessmentResultSerializer,
)


class AssessmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        assessments = Assessment.objects.filter(is_active=True).prefetch_related('questions')
        serializer = AssessmentListSerializer(assessments, many=True, context={'request': request})
        return Response(serializer.data)


class AssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk, is_active=True)
        questions = assessment.questions.all().order_by('order', 'id')
        
        assessment_data = AssessmentListSerializer(assessment, context={'request': request}).data
        questions_data = AssessmentQuestionPublicSerializer(questions, many=True).data

        return Response({
            'assessment': assessment_data,
            'questions': questions_data,
        })


class SubmitAssessmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        answers = request.data.get('answers', {})  # Dict mapping question_id -> 'A'/'B'/'C'/'D'

        questions = assessment.questions.all()
        total_questions = questions.count()

        if total_questions == 0:
            return Response({'error': 'No questions found for this assessment.'}, status=status.HTTP_400_BAD_REQUEST)

        correct_count = 0
        detailed_feedback = []

        for q in questions:
            user_choice = str(answers.get(str(q.id), '')).upper().strip()
            is_correct = (user_choice == q.correct_option)
            if is_correct:
                correct_count += 1
            detailed_feedback.append({
                'question_id': q.id,
                'question_text': q.question_text,
                'user_answer': user_choice,
                'correct_answer': q.correct_option,
                'is_correct': is_correct,
                'explanation': q.explanation,
            })

        score_percentage = int((correct_count / total_questions) * 100)
        passed = score_percentage >= assessment.passing_score
        badge_title = f"{assessment.title} Certified" if passed else ""

        result = UserAssessmentResult.objects.create(
            user=request.user,
            assessment=assessment,
            score_percentage=score_percentage,
            total_questions=total_questions,
            correct_answers=correct_count,
            passed=passed,
            badge_title=badge_title,
        )

        return Response({
            'score_percentage': score_percentage,
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'passed': passed,
            'passing_score': assessment.passing_score,
            'badge_title': badge_title,
            'feedback': detailed_feedback,
        })


class UserBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        results = UserAssessmentResult.objects.filter(
            user=request.user, passed=True
        ).select_related('assessment')
        serializer = UserAssessmentResultSerializer(results, many=True)
        return Response(serializer.data)
