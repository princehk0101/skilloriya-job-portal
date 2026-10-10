import os
import json
import PyPDF2
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import google.generativeai as genai

# Configure Gemini
if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class ResumeParseView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if not hasattr(settings, 'GEMINI_API_KEY') or not settings.GEMINI_API_KEY:
            return Response({"error": "AI parsing is not configured (GEMINI_API_KEY missing)."}, status=500)

        if 'resume' not in request.FILES:
            return Response({"error": "Please provide a 'resume' file."}, status=400)

        resume_file = request.FILES['resume']
        
        if not resume_file.name.lower().endswith('.pdf'):
            return Response({"error": "Currently only PDF files are supported for AI parsing."}, status=400)

        text = ""
        try:
            reader = PyPDF2.PdfReader(resume_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            return Response({"error": f"Could not read PDF: {str(e)}"}, status=400)

        if not text.strip():
            return Response({"error": "No text found in the provided PDF."}, status=400)

        text = text[:10000]

        prompt = f"""
You are an expert ATS (Applicant Tracking System) parser. I am providing you with the text extracted from a user's resume.
Extract the following information and return it strictly as a JSON object, without any markdown formatting, backticks, or extra text.

Required JSON Structure:
{{
  "headline": "A short professional headline based on their most recent role or summary",
  "bio": "A 2-3 sentence professional summary extracted or summarized from the resume.",
  "skills": "A comma-separated string of their top technical and soft skills (e.g., 'Python, Django, React, SQL'). Max 20 skills.",
  "education": "The highest degree and institution name",
  "experience_years": An integer representing the total years of professional experience (e.g., 2), or 0 if a fresher or not specified.
}}

Resume Text:
\"\"\"
{text}
\"\"\"
"""

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]

            data = json.loads(response_text.strip())
            
            user = request.user
            user.resume = resume_file
            
            if 'headline' in data and data['headline']:
                user.headline = data['headline']
            if 'bio' in data and data['bio']:
                user.bio = data['bio']
            if 'skills' in data and data['skills']:
                user.skills = data['skills']
            if 'education' in data and data['education']:
                user.education = data['education']
            if 'experience_years' in data and isinstance(data['experience_years'], int):
                user.experience_years = data['experience_years']
                
            user.save()

            return Response({
                "message": "Resume parsed and profile updated successfully.",
                "parsed_data": data
            })
            
        except Exception as e:
            return Response({"error": f"Failed to parse resume with AI: {str(e)}"}, status=500)
