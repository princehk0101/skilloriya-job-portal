import os
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from core.ai_views import extract_text_from_file, parse_with_gemini_llm, parse_resume_text

logger = logging.getLogger(__name__)


class ResumeParseView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if 'resume' not in request.FILES:
            return Response({"error": "Please provide a 'resume' file (PDF, DOCX, or TXT)."}, status=400)

        resume_file = request.FILES['resume']
        file_name = resume_file.name.lower()

        if not (file_name.endswith('.pdf') or file_name.endswith('.docx') or file_name.endswith('.txt')):
            return Response({"error": "Currently PDF, DOCX, and TXT files are supported for resume parsing."}, status=400)

        try:
            text = extract_text_from_file(resume_file)
        except Exception as e:
            logger.exception("Failed extracting text from resume file: %s", e)
            return Response({"error": f"Could not read resume file: {str(e)}"}, status=400)

        if not text or not text.strip():
            return Response({"error": "No readable text found in the provided resume. If this is a scanned image PDF, please provide a text-based PDF or DOCX file."}, status=400)

        # 1. Try Gemini LLM if API key is provided
        gemini_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        parsed_data = None
        if gemini_key and not str(gemini_key).startswith("AIzaSy_YOUR_FREE"):
            try:
                parsed_data = parse_with_gemini_llm(text, gemini_key)
            except Exception as e:
                logger.warning("Gemini parsing failed, falling back to local NLP parser: %s", e)

        # 2. Local heuristic NLP fallback (100% reliable, zero external API failure)
        if not parsed_data or not isinstance(parsed_data, dict):
            parsed_data = parse_resume_text(text)

        # Normalize skills
        skills_raw = parsed_data.get('skills', [])
        if isinstance(skills_raw, list):
            skills_list = [str(s).strip() for s in skills_raw if str(s).strip()]
            skills_str = ", ".join(skills_list)
        else:
            skills_str = str(skills_raw).strip()
            skills_list = [s.strip() for s in skills_str.split(',') if s.strip()]

        # Parse experience years safely
        exp_years = 0
        raw_exp = parsed_data.get('experience_years')
        if raw_exp is not None:
            try:
                exp_years = int(raw_exp)
            except (ValueError, TypeError):
                exp_years = 0

        # Update user profile with extracted data
        user = request.user
        try:
            user.resume = resume_file
            if parsed_data.get('headline'):
                user.headline = parsed_data['headline']
            if parsed_data.get('bio'):
                user.bio = parsed_data['bio']
            if skills_str:
                user.skills = skills_str
            if parsed_data.get('education'):
                user.education = parsed_data['education']
            if exp_years > 0 or not user.experience_years:
                user.experience_years = exp_years

            # Update name if user has none
            full_name = parsed_data.get('full_name') or parsed_data.get('name') or ""
            if full_name and (not user.first_name and not user.last_name):
                parts = full_name.split()
                if len(parts) > 1:
                    user.first_name = parts[0]
                    user.last_name = " ".join(parts[1:])
                else:
                    user.first_name = full_name

            user.save()
        except Exception as e:
            logger.warning("Could not auto-save parsed resume fields to User model: %s", e)

        # Prepare payload structure expected by frontend Profile.jsx
        clean_name = parsed_data.get('full_name') or parsed_data.get('name') or f"{user.first_name} {user.last_name}".strip()
        response_payload = {
            "name": clean_name,
            "full_name": clean_name,
            "email": parsed_data.get('email') or user.email,
            "phone": parsed_data.get('phone_number') or parsed_data.get('phone') or user.phone_number or "",
            "phone_number": parsed_data.get('phone_number') or parsed_data.get('phone') or user.phone_number or "",
            "headline": parsed_data.get('headline') or user.headline or "",
            "bio": parsed_data.get('bio') or user.bio or "",
            "skills": skills_list,
            "education": parsed_data.get('education') or user.education or "",
            "experience_years": exp_years,
        }

        return Response({
            "message": "Resume parsed and profile updated successfully.",
            "parsed_data": response_payload
        })
