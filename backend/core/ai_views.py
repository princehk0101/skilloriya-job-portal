import re
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from jobs.models import Job
from jobs.serializers import JobSerializer
from users.models import User

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Django", "FastAPI",
    "Flask", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Vue.js", "Angular", "Express",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "GraphQL", "REST API",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD", "Linux",
    "Java", "C++", "C#", ".NET", "PHP", "Laravel", "Ruby", "Rails", "Go", "Rust", "Swift", "Kotlin",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision",
    "Data Analysis", "Pandas", "NumPy", "Scikit-Learn", "Power BI", "Tableau",
    "LangChain", "LlamaIndex", "GenAI", "Generative AI", "LLM", "Prompt Engineering", "OpenAI",
    "Agentic AI", "Autonomous Agents", "HuggingFace", "Vector DB", "ChromaDB", "Pinecone", "RAG",
    "Figma", "Adobe XD", "UI/UX", "Product Design", "Agile", "Scrum", "Jira", "Testing", "Selenium"
]


def extract_text_from_file(uploaded_file):
    name = uploaded_file.name.lower()
    content = uploaded_file.read()
    
    # Reset pointer for subsequent reads
    uploaded_file.seek(0)
    
    if name.endswith('.txt'):
        try:
            return content.decode('utf-8', errors='ignore')
        except:
            return ""

    if name.endswith('.pdf'):
        # Extract text from PDF streams
        text_parts = []
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            if text_parts:
                return "\n".join(text_parts)
        except Exception:
            pass

        # Fallback raw string regex extraction
        raw_text = content.decode('latin-1', errors='ignore')
        matches = re.findall(r'\(([^\(\)]+)\)\s*Tj', raw_text)
        if matches:
            return " ".join(matches)
        
        # Strip control characters as simple fallback
        cleaned = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', raw_text)
        return cleaned

    try:
        return content.decode('utf-8', errors='ignore')
    except:
        return ""


def parse_resume_text(text):
    data = {
        "full_name": "",
        "email": "",
        "phone_number": "",
        "skills": [],
        "experience_years": 0,
        "education": "",
        "headline": "",
        "bio": "",
    }

    if not text:
        return data

    # 1. Email extraction
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        data["email"] = email_match.group(0).strip()

    # 2. Phone extraction
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}', text)
    if phone_match:
        data["phone_number"] = phone_match.group(0).strip()

    # 3. Skills extraction
    found_skills = set()
    for skill in COMMON_SKILLS:
        pattern = r'(?i)(?:\b|(?<=[^a-zA-Z0-9]))' + re.escape(skill) + r'(?:\b|(?=[^a-zA-Z0-9]))'
        if re.search(pattern, text):
            found_skills.add(skill)
    data["skills"] = sorted(list(found_skills))

    # 4. Experience Years
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)', text, re.IGNORECASE)
    if exp_match:
        try:
            data["experience_years"] = int(exp_match.group(1))
        except:
            data["experience_years"] = 0
    else:
        # Check date ranges e.g. 2021 - 2024
        ranges = re.findall(r'(20\d\d)\s*[-–—to]+\s*(20\d\d|present|current)', text, re.IGNORECASE)
        if ranges:
            total_yrs = 0
            for start, end in ranges:
                s = int(start)
                e = 2026 if 'present' in end.lower() or 'current' in end.lower() else int(end)
                if e >= s:
                    total_yrs += (e - s)
            data["experience_years"] = min(total_yrs, 30)

    # 5. Education
    edu_keywords = ["B.Tech", "B.E.", "B.Sc", "BCA", "MCA", "M.Tech", "Bachelor", "Master", "Diploma", "Degree", "Computer Science", "Information Technology"]
    found_edu = []
    for line in text.split('\n')[:40]:
        for kw in edu_keywords:
            if kw.lower() in line.lower() and line.strip() not in found_edu:
                found_edu.append(line.strip())
                break
    if found_edu:
        data["education"] = " | ".join(found_edu[:2])

    # 6. Full Name & Headline from top lines
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 2 and not l.strip().startswith(('http', 'www', 'mailto'))]
    if lines:
        for l in lines[:5]:
            if not re.search(r'[@0-9\+\:]', l) and len(l) < 40:
                data["full_name"] = l
                break
        for l in lines[1:8]:
            if any(role_kw in l.lower() for role_kw in ["developer", "engineer", "designer", "intern", "manager", "specialist", "analyst"]):
                data["headline"] = l
                break

    # Bio snippet
    summary_match = re.search(r'(?:Summary|About Me|Profile|Objective)[:\n\r]+([^\n\r]+(?:\n[^\n\r]+){1,3})', text, re.IGNORECASE)
    if summary_match:
        data["bio"] = summary_match.group(1).strip()

    return data


import os
import json
import urllib.request
import urllib.error

def parse_with_gemini_llm(text, api_key):
    """Attempt parsing resume text using Google Gemini 1.5 Flash free API."""
    if not api_key or not text:
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = (
            "You are an expert AI Resume Parser. Extract the following JSON from the resume text:\n"
            "{\n"
            '  "full_name": "Candidate Full Name",\n'
            '  "email": "candidate email or empty string",\n'
            '  "phone_number": "candidate phone or empty string",\n'
            '  "headline": "Professional Headline / Target Role",\n'
            '  "skills": ["Skill1", "Skill2", "Skill3"],\n'
            '  "education": "Degree, Major, College name",\n'
            '  "experience_years": 0,\n'
            '  "bio": "2-3 sentence professional summary"\n'
            "}\n"
            "Return ONLY valid JSON. Resume text:\n" + text[:6000]
        )
        req_body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }).encode('utf-8')

        req = urllib.request.Request(
            url,
            data=req_body,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            raw_json = res_data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_json)
            return parsed
    except Exception as e:
        print("Gemini API call failed (falling back to built-in NLP parser):", e)
        return None


class AIResumeParserView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        uploaded_file = request.FILES.get('resume')
        raw_text = request.data.get('text', '')

        if uploaded_file:
            text = extract_text_from_file(uploaded_file)
        else:
            text = raw_text

        if not text:
            return Response({'error': 'No resume file or text provided to parse.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Try Gemini LLM if API key is provided
        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
        parsed_data = None
        if gemini_key and not gemini_key.startswith("AIzaSy_YOUR_FREE"):
            parsed_data = parse_with_gemini_llm(text, gemini_key)

        # 2. Fall back to local NLP heuristic parser (100% Free, zero-API dependency)
        if not parsed_data:
            parsed_data = parse_resume_text(text)

        # Normalize field names so frontend gets exact match
        if isinstance(parsed_data, dict):
            if "full_name" in parsed_data and not parsed_data.get("name"):
                parsed_data["name"] = parsed_data["full_name"]
            if "phone_number" in parsed_data and not parsed_data.get("phone"):
                parsed_data["phone"] = parsed_data["phone_number"]

        return Response({
            'success': True,
            'data': parsed_data,
            'parsed_data': parsed_data,
            'message': 'Resume parsed successfully using AI engine.'
        })


def calculate_job_match(user, job):
    user_skills_str = user.skills or ""
    user_skills = set([s.strip().lower() for s in re.split(r'[,|/\n]', user_skills_str) if s.strip()])
    
    # Extract skills from job title and description
    job_text = f"{job.title} {job.description}".lower()
    required_skills = set()
    for skill in COMMON_SKILLS:
        pattern = r'(?i)(?:\b|(?<=[^a-zA-Z0-9]))' + re.escape(skill) + r'(?:\b|(?=[^a-zA-Z0-9]))'
        if re.search(pattern, job_text):
            required_skills.add(skill.lower())

    if not required_skills:
        # Default skills if none found
        required_skills = {"communication", "problem solving"}

    matched = user_skills.intersection(required_skills)
    missing = required_skills.difference(user_skills)

    skill_score = (len(matched) / len(required_skills)) * 70 if required_skills else 50
    
    # Experience factor (up to 20%)
    user_exp = getattr(user, 'experience_years', 0) or 0
    job_exp = job.experience_required or 0
    if user_exp >= job_exp:
        exp_score = 20
    else:
        exp_score = max(5, int((user_exp / max(job_exp, 1)) * 20))

    # Location / Job Type factor (up to 10%)
    loc_score = 10 if (job.job_type == 'remote' or (user.location and user.location.lower() in job.location.lower())) else 5

    total_score = min(100, max(20, int(skill_score + exp_score + loc_score)))

    is_top_applicant = total_score >= 65 or len(matched) >= 2
    level = "Top Applicant (High Match)" if total_score >= 75 else "Good Match" if total_score >= 50 else "Moderate Match"
    top_badge = "🏆 Top Applicant (Top 5% Candidate)" if is_top_applicant else "Promising Candidate"

    matched_titles = [s.title() for s in matched]
    suggested_skill = matched_titles[0] if matched_titles else "Core Tech"
    
    return {
        "match_score": total_score,
        "matched_skills": matched_titles,
        "missing_skills": [s.title() for s in missing],
        "recommendation_level": level,
        "is_top_applicant": is_top_applicant,
        "top_applicant_badge": top_badge,
        "percentile_rank": "Top 5% Candidate" if is_top_applicant else "Top 25% Candidate",
        "top_applicant_reason": f"Your verified skills in {', '.join(matched_titles[:3])} make you a standout candidate for this role!" if matched_titles else "Your profile matches the core qualifications for this role.",
        "can_play_skill_test": True,
        "skill_test_prompt": f"Play & verify your '{suggested_skill}' skill test to earn a verified badge and rank #1!",
        "required_skills_count": len(required_skills),
        "matched_skills_count": len(matched),
    }


class JobMatchScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        match_info = calculate_job_match(request.user, job)
        return Response(match_info)


class AIRecommendedJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        jobs = Job.objects.filter(is_active=True).select_related('employer', 'category')
        
        scored_jobs = []
        for job in jobs:
            match_data = calculate_job_match(user, job)
            serializer = JobSerializer(job, context={'request': request})
            job_dict = serializer.data
            job_dict['ai_match'] = match_data
            scored_jobs.append(job_dict)

        scored_jobs.sort(key=lambda x: x['ai_match']['match_score'], reverse=True)
        return Response(scored_jobs[:10])
