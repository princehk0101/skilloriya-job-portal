# Skilloriya — Job & Career Platform

Skilloriya is a full-stack job portal that helps candidates find jobs and manage their applications, while employers can publish openings and review applicants. It combines a React interface with a Django REST API.

## What it includes

- Job listings with search, filters, categories, saved jobs, and job alerts
- Dedicated job discovery page with title/company/skill, location, work style, annual salary, and sort filters
- Candidate and employer accounts, profiles, and dashboards
- Email OTP registration, OTP login, password reset, and Google sign-in
- Resume upload and resume parsing, with an optional Gemini-powered parser
- Job applications, application status tracking, and employer applicant management
- Company profiles, reviews, and portfolio entries
- Company ratings based on real submitted reviews (unreviewed companies are marked clearly)
- Skill assessments, results, and badges
- Skill-based job match scores and recommended jobs
- Match score explanations showing skill, experience, and location contributions
- A printable Skill Fit Passport with assessment badges and top job matches
- Candidate-managed resume versions, selectable for each application
- Smart job alerts with matching-job emails (SMTP configuration required)
- Employer analytics for application stages and applications per job
- Candidate–employer messaging and interview scheduling with video interview rooms
- Interview feedback that employers can approve before sharing with candidates
- Private interviewer notes saved per interview
- Purpose-specific, expiring OTPs with throttling on authentication endpoints
- Admin dashboard for managing users, jobs, companies, and applications

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Backend | Python, Django 6, Django REST Framework |
| Authentication | JWT, email OTP, Google sign-in |
| Database | SQLite for local development; PostgreSQL configuration for deployment |
| Deployment configuration | Render for the backend; Vercel rewrite configuration for the frontend |

## Repository layout

```text
skilloriya/
├── backend/       # Django project and API apps
├── frontend/      # React and Vite application
├── render.yaml    # Render backend and PostgreSQL configuration
└── README.md
```

## Run locally

You need Python and Node.js installed.

### 1. Get the project

```bash
git clone https://github.com/princehk0101/skilloriya-job-portal.git
cd skilloriya-job-portal
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create `backend/.env` with local settings:

```env
SECRET_KEY=replace-with-a-long-random-secret
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
USE_SQLITE=True

# Needed for OTP, password reset, and application confirmation emails
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:5173

# Optional: enable Gemini-assisted resume parsing
GEMINI_API_KEY=
```

Apply migrations and launch Django:

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

To add clearly labelled fictional vacancies across the default categories for a local demo, run this from `backend/`:

```bash
python manage.py seed_demo_jobs
```

The command seeds 10 sample roles. It is safe to rerun and does not duplicate listings. These are fictional demo vacancies, not real openings.

To add three fictional candidate applications to every demo vacancy, run:

```bash
python manage.py seed_demo_applications
```

This creates sample candidate profiles, downloadable demo resumes, and application status history (Applied, Shortlisted, and Interview). These accounts cannot log in, and rerunning the command does not create duplicate applications.

### 3. Start the frontend

Open another terminal from the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env` if you want to set the API or Google OAuth client explicitly:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Run Vite:

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser. For OTP email flows, configure valid SMTP credentials in the backend environment. Google sign-in also requires a matching OAuth client ID.

## API areas

The Django API is organized under these prefixes:

| Prefix | Purpose |
| --- | --- |
| `/api/users/` | Registration, login, profiles, and account features |
| `/api/jobs/` | Job listings, saved jobs, and alerts |
| `/api/applications/` | Applications, employer review, and interviews |
| `/api/companies/` | Company profiles, reviews, and microtasks |
| `/api/skills/` | Skills and assessments |
| `/api/ai/` | Resume parsing and job recommendations/match scores |
| `/api/chat/` | Conversations and messages |
| `/api/token/` | JWT token endpoint |

## Deployment

The repository includes a `render.yaml` describing a Django backend and PostgreSQL database for Render. On startup, Render seeds fictional demo vacancies and sample applications; the commands are safe to rerun. Set production secrets, email/Google credentials, and `FRONTEND_URL` (your public frontend URL) in the hosting provider's environment settings. The frontend contains a `vercel.json` rewrite for client-side routes; deploy `frontend/` as the Vercel project root and point `VITE_API_BASE_URL` at the deployed API.

## Contributors

- **[princehk0101](https://github.com/princehk0101)** — backend and project integration
- **[Sudhanshuyadav767](https://github.com/Sudhanshuyadav767)** — frontend

## Project status

Skilloriya is an active project. Some features depend on correctly configured external credentials such as SMTP, Google OAuth, and (optionally) Gemini.
