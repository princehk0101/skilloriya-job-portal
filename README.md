# Skilloriya — Skill-Based Job Portal & Recruitment Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Backend-Django%206%20%2B%20DRF-092E20?logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-336791?logo=postgresql)](https://neon.tech/)
[![Cloud Storage](https://img.shields.io/badge/Storage-ImageKit.io%20CDN-FF6B6B)](https://imagekit.io/)
[![Docker](https://img.shields.io/badge/Container-Docker%20%2B%20Compose-2496ED?logo=docker)](https://www.docker.com/)

**Skilloriya** is a production-grade, skill-oriented job portal and recruitment management platform. Traditional recruitment platforms often rely exclusively on static keyword searches and unverified resumes. Skilloriya introduces a competency-first hiring pipeline with automated ATS resume parsing, interactive 7-track skill assessments, seamless direct auto-login on signup, and a centralized recruiter Applicant Tracking System (ATS).

---

## 🌟 Key Features

- **Direct Auto-Login on Registration:** Stateless SimpleJWT token pair issued immediately upon candidate or recruiter signup — zero redundant login prompts.
- **Automated ATS Resume Parsing:** Dual-engine parsing using **PyPDF**, **Google Gemini 1.5 Flash**, and an offline heuristic regex NLP engine to auto-extract name, email, phone, skills, experience, and education.
- **Cloud CDN Document & Media Storage:** All profile photos, company logos, and candidate PDF resumes are offloaded to **ImageKit.io Cloud CDN** with fast global delivery.
- **Interactive Skill Assessment Engine:** 7 pre-built assessment tracks (React, Django, Full-Stack, ML/GenAI, DevOps, TypeScript, SQL) with 140+ curated questions, timed test runs, auto-grading, and profile score badges.
- **Recruiter ATS Hiring Funnel:** Recruiters review candidate profiles, inspect cloud PDF resumes, and transition applicants across hiring stages: `Applied` ➔ `Screening` ➔ `Interview` ➔ `Offered` ➔ `Rejected`.
- **Multi-Parametric Job Search:** Real-time filtering by keyword, location, employment type (Full-Time, Part-Time, Remote, Internship), salary range, and company category.
- **Candidate Workspace & Copilot:** Saved jobs, application progress tracking, and AI career guidance.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18, Vite 5, Tailwind CSS 4 | Single-page UI with fast HMR and responsive dark/light styling |
| **UI Components** | Lucide React, Framer Motion, GSAP | Clean modern iconography and smooth page transitions |
| **HTTP Client** | Axios | REST communication with Bearer JWT interceptors |
| **Backend API** | Python 3.12, Django 6.0, Django REST Framework | Scalable RESTful endpoints, serializers, and business logic |
| **Authentication** | SimpleJWT (`djangorestframework_simplejwt`) | Stateless JWT access/refresh token authentication with auto-login |
| **Cloud Database** | Neon Serverless PostgreSQL | Managed cloud relational database with SSL connection pooling |
| **Cloud Storage** | ImageKit.io CDN (`imagekitio`) | Global CDN hosting for avatars, logos, and PDF resumes |
| **PDF & AI Parser** | PyPDF + Google Gemini 1.5 Flash | Document text extraction and generative entity parsing |
| **Web Server / WSGI** | Gunicorn + WhiteNoise | Production WSGI HTTP server with compressed static asset serving |
| **DevOps** | Docker, Docker Compose | Multi-container local and production deployment |

---

## 🚀 Complete Production Hosting Guide

Skilloriya is designed to be hosted with zero server-management overhead using modern cloud platforms:
- **Backend API:** [Render](https://render.com/) or [Railway](https://railway.app/)
- **Frontend SPA:** [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
- **Database:** [Neon.tech](https://neon.tech/) (Serverless PostgreSQL)
- **File & Resume CDN:** [ImageKit.io](https://imagekit.io/)

---

### Step 1: Set Up Cloud Database (Neon PostgreSQL)

1. Sign up for free at [neon.tech](https://neon.tech/).
2. Create a new project (e.g., `skilloriya-db`) in your preferred region (e.g., `AWS US East 2`).
3. Under **Dashboard ➔ Connection Details**, choose **Pooled connection** and copy the connection string:
   ```text
   postgresql://<user>:<password>@<pooler-host>/neondb?sslmode=require
   ```
4. This URL will be used as `DATABASE_URL` in your backend environment settings.

---

### Step 2: Set Up Cloud CDN Storage (ImageKit.io)

1. Sign up for free at [imagekit.io](https://imagekit.io/) (includes 20 GB free bandwidth monthly).
2. Go to **Developer Options ➔ API Keys**.
3. Note your three credentials:
   - **Public Key** (e.g., `public_xxxxxx`)
   - **Private Key** (e.g., `private_xxxxxx`)
   - **URL Endpoint** (e.g., `https://ik.imagekit.io/your_id/`)
4. ImageKit will handle all candidate PDF resumes and profile pictures automatically via the integrated `storage_service.py`.

---

### Step 3: Deploy Backend on Render (or Railway)

1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/) and click **New ➔ Web Service**.
3. Connect your GitHub repository (`skilloriya-job-portal`).
4. Configure the service settings:
   - **Name:** `skilloriya-backend`
   - **Region:** US East (matching your database region)
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command:**
     ```bash
     gunicorn core.wsgi:application
     ```
5. In the **Environment Variables** tab, add the following variables:

| Environment Variable | Value / Description | Required? |
| :--- | :--- | :--- |
| `SECRET_KEY` | Long random secret string (e.g., `django-insecure-xxx...`) | **Yes** |
| `DEBUG` | `False` | **Yes** |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost,.onrender.com` *(or your custom domain)* | **Yes** |
| `USE_SQLITE` | `False` | **Yes** |
| `DATABASE_URL` | Your Neon pooled PostgreSQL URL | **Yes** |
| `IMAGEKIT_PUBLIC_KEY` | Your ImageKit Public Key | **Yes** |
| `IMAGEKIT_PRIVATE_KEY` | Your ImageKit Private Key | **Yes** |
| `IMAGEKIT_URL_ENDPOINT` | Your ImageKit URL Endpoint | **Yes** |
| `FRONTEND_URL` | Your deployed frontend URL (e.g., `https://skilloriya.vercel.app`) | **Yes** |
| `GEMINI_API_KEY` | Google Gemini API key for AI resume parsing & copilot | Optional |
| `EMAIL_HOST_USER` | Gmail address for OTP and alert emails | Optional |
| `EMAIL_HOST_PASSWORD` | Google App Password (16-char) | Optional |

6. Click **Create Web Service**. Render will install dependencies, collect static files, run database migrations, and launch Gunicorn.
7. Note your public backend URL (e.g., `https://skilloriya-backend.onrender.com`).

---

### Step 4: Deploy Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
2. Import your GitHub repository (`skilloriya-job-portal`).
3. In the project setup screen, configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** Your Render backend URL (e.g., `https://skilloriya-backend.onrender.com` — *without trailing slash*)
5. Click **Deploy**.
   > *Note:* Client-side routing is automatically handled by the pre-configured `frontend/vercel.json` SPA rewrite rule.

---

### Step 5: Seed Cloud Database & Create Admin Account

Once the backend is live, open the **Render Shell** (or run locally pointed to the Neon `DATABASE_URL`):

```bash
# 1. Seed 7 assessment tracks with 140+ real MCQ questions
python manage.py seed_assessments

# 2. Seed default categories, companies, and vacancies
python manage.py seed_genai_companies
python manage.py seed_demo_jobs

# 3. Create administrator account
python manage.py createsuperuser
```

---

## 💻 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/princehk0101/skilloriya-job-portal.git
cd skilloriya-job-portal
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate on Windows PowerShell:
.venv\Scripts\Activate.ps1
# Or on macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `backend/.env` file:

```env
SECRET_KEY=local-dev-secret-key-skilloriya-2026
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
USE_SQLITE=True

# Neon Cloud PostgreSQL (Optional locally, required for cloud):
# USE_SQLITE=False
# DATABASE_URL=postgresql://neondb_owner:password@pooler-host/neondb?sslmode=require

# ImageKit Cloud Storage:
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint/

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Optional: Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py seed_assessments
python manage.py runserver
```
Backend API will be running at `http://127.0.0.1:8000/`.

### 3. Frontend Setup

Open another terminal in `frontend/`:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the Vite development server:

```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🐳 Alternative: Full-Stack Docker Deployment

You can run the entire platform with PostgreSQL and Redis using Docker Compose:

```bash
# Build and run all services
docker compose up --build

# Run in background
docker compose up -d

# Stop all services
docker compose down
```

---

## 🔌 API Endpoints Reference

| Prefix / Path | HTTP Methods | Description |
| :--- | :--- | :--- |
| `/api/users/register/` | `POST` | User registration with direct auto-login JWT issuance |
| `/api/users/login/` | `POST` | User login returning JWT access and refresh tokens |
| `/api/users/profile/` | `GET`, `PUT`, `PATCH` | Candidate and recruiter profile management |
| `/api/users/parse-resume/` | `POST` | Dual-engine ATS resume parsing (PDF/DOCX) |
| `/api/storage/upload-image/` | `POST` | Upload avatar/logo to ImageKit Cloud CDN |
| `/api/storage/upload-pdf/` | `POST` | Upload candidate resume PDF to ImageKit Cloud CDN |
| `/api/jobs/` | `GET`, `POST` | List and search active jobs with multi-parameter filtering |
| `/api/jobs/<id>/` | `GET`, `PUT`, `DELETE` | Job details and recruiter updates |
| `/api/applications/` | `GET`, `POST` | Candidate applications and recruiter ATS pipeline |
| `/api/skills/tracks/` | `GET` | List 7 technical assessment tracks |
| `/api/skills/submit-assessment/`| `POST` | Submit timed test answers, compute score, and award badge |
| `/api/chat/` | `GET`, `POST` | Direct messaging between candidates and employers |
| `/admin/` | `GET`, `POST` | Django administrative interface |

---

## 📁 Repository Structure

```text
skilloriya-job-portal/
├── backend/                  # Django REST Framework Backend
│   ├── core/                 # Project settings, WSGI, storage services
│   ├── users/                # User model, SimpleJWT auth, ATS parsing
│   ├── jobs/                 # Jobs, companies, categories, filters
│   ├── applications/         # Job applications & recruiter ATS stages
│   ├── skills/               # Assessment tracks, question bank, grading
│   ├── media/                # Local asset fallback directory
│   ├── requirements.txt      # Python dependencies (PyPDF, ImageKit, psycopg2)
│   ├── Dockerfile            # Container definition for backend
│   └── manage.py
├── frontend/                 # React 18 + Vite Frontend SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components & navigation
│   │   ├── pages/            # Application routes (Jobs, ATS, Assessments)
│   │   └── api/              # Axios HTTP client configuration
│   ├── package.json          # Node dependencies (Tailwind, Lucide, Framer)
│   ├── vercel.json           # Vercel SPA routing rewrite rules
│   └── vite.config.js
├── docker-compose.yml        # Multi-service local/production container setup
├── render.yaml               # Infrastructure-as-code for Render deployment
├── SYNOPSIS_OF_PROJECT.pdf   # 5-Page Academic Project Synopsis
├── synopsis.md               # Project synopsis in markdown format
└── README.md                 # Complete documentation and deployment guide
```

---

## 👥 Contributors

- **Sudhanshu Yadav** — Frontend & UI Engineering
- **Prince Kumar** — Backend Architecture, APIs & Cloud Integration

---

## 📄 License

This project is licensed under the MIT License.
