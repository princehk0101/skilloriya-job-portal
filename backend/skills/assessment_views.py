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
        user = request.user
        
        # Check how many times user attempted this test
        attempts_count = UserAssessmentResult.objects.filter(user=user, assessment=assessment).count()

        # Check existing questions
        db_questions = list(assessment.questions.all().order_by('order', 'id'))
        
        # If user retakes the test (attempts > 0) OR dynamic param is passed, generate fresh AI questions!
        # This guarantees questions change every time!
        from core.ai_service import call_llm
        import random
        import json
        import re

        TARGET_QUESTIONS = 20
        use_ai_dynamic = (attempts_count > 0 or len(db_questions) < TARGET_QUESTIONS or request.query_params.get('dynamic') == 'true')

        if use_ai_dynamic:
            try:
                # Ask LLM to generate fresh, original multiple-choice questions for this specific assessment
                prompt = f"""
You are creating an official technical certification assessment for: "{assessment.title}" (Level: {assessment.level}).
Candidate Attempt Number: {attempts_count + 1}
Generate up to 10 original, rigorous, and thought-provoking multiple choice questions.
Do NOT repeat basic generic questions. Focus on practical real-world scenarios, debugging, and architectural principles.

Return ONLY a valid JSON array of objects matching this exact schema:
[
  {{
    "question_text": "Practical question scenario...",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "B",
    "explanation": "Clear explanation of why option B is correct and why other choices fail."
  }}
]
"""
                raw_llm = call_llm(prompt, system_instruction="You are an expert technical test designer. Return ONLY valid JSON array.", json_mode=True)
                if raw_llm:
                    clean_json = re.sub(r'^```json\s*|\s*```$', '', raw_llm.strip(), flags=re.MULTILINE)
                    gen_data = json.loads(clean_json)
                    if isinstance(gen_data, dict) and "questions" in gen_data:
                        gen_data = gen_data["questions"]

                    if isinstance(gen_data, list) and len(gen_data) >= 2:
                        start_order = assessment.questions.count() + 1
                        for idx, q_item in enumerate(gen_data):
                            new_q = AssessmentQuestion.objects.create(
                                assessment=assessment,
                                question_text=q_item.get("question_text", "Technical question"),
                                option_a=q_item.get("option_a", "Option A"),
                                option_b=q_item.get("option_b", "Option B"),
                                option_c=q_item.get("option_c", "Option C"),
                                option_d=q_item.get("option_d", "Option D"),
                                correct_option=q_item.get("correct_option", "A").upper().strip(),
                                explanation=q_item.get("explanation", "Correct solution."),
                                order=start_order + idx
                            )
                            db_questions.append(new_q)
            except Exception as e:
                print("Failed to generate dynamic assessment questions with LLM:", e)

        # Shuffle and sample exactly 20 questions (or all if slightly less)
        # Seed with user ID + attempt count so retakes always get a fresh combination
        random.seed(f"{user.id}-{attempts_count}-{pk}")
        if len(db_questions) >= TARGET_QUESTIONS:
            db_questions = random.sample(db_questions, TARGET_QUESTIONS)
        else:
            random.shuffle(db_questions)

        assessment_data = AssessmentListSerializer(assessment, context={'request': request}).data
        questions_data = AssessmentQuestionPublicSerializer(db_questions, many=True).data

        return Response({
            'assessment': assessment_data,
            'questions': questions_data,
            'attempt_number': attempts_count + 1,
            'is_dynamic': True,
        })


class SubmitAssessmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        answers = request.data.get('answers', {})  # Dict mapping question_id -> 'A'/'B'/'C'/'D'

        # Fetch questions answered by candidate
        q_ids = [int(qid) for qid in answers.keys() if str(qid).isdigit()]
        if q_ids:
            questions = list(AssessmentQuestion.objects.filter(assessment=assessment, id__in=q_ids))
        else:
            questions = list(assessment.questions.all()[:5])

        total_questions = len(questions)

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
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
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
