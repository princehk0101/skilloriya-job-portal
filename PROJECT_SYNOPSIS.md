# PROJECT SYNOPSIS

## 1. Project Title
**SKILLORIYA – AI-Powered Next-Gen Job Discovery, Talent Acquisition & Skill Assessment Platform**

---

## 2. Project Abstract
**Skilloriya** is a full-stack, enterprise-grade recruitment and career development platform that modernizes hiring workflows. Unlike conventional job portals that rely on static keyword matching and unverified resumes, Skilloriya unifies **AI-driven Resume Parsing**, **Verified Skill Proofs**, **Standardized Technical Assessments**, **Recruiter Application Pipelines**, and **Real-Time Candidate-Recruiter Communication & Video Interviews** under a single digital ecosystem.

Built with a decoupled architecture utilizing **React (Vite)** on the frontend, **Django REST Framework** on the backend, and **Neon Serverless Cloud PostgreSQL** coupled with **ImageKit Global CDN** for media delivery, the system provides sub-second search speeds, secure JWT authentication with instant onboarding, and automated talent-matching algorithms.

---

## 3. Problem Statement
The modern recruitment lifecycle faces significant friction:
1. **High Screening Overhead for Recruiters**: Over 70% of received resumes do not meet core requirements, forcing HR teams to spend hours manually screening candidates.
2. **The "Resume Black Hole" for Candidates**: Job seekers receive no actionable feedback when their applications are rejected by legacy Applicant Tracking Systems (ATS).
3. **Lack of Verifiable Skill Proofs**: Resumes often inflate qualifications without tangible proof of capability before the interview stage.
4. **Fragmented Hiring Tools**: Companies currently juggle multiple disparate software tools (e.g., Job Board + Email + Google Forms/Quiz + Slack/WhatsApp + Zoom/Google Meet), leading to dropped communication and prolonged time-to-hire.

---

## 4. Objectives of the Project
* **Automate Candidate Screening**: Implement a dual-layer AI and Heuristic NLP resume parsing engine to extract skills, experience, and education from PDF/DOCX resumes in milliseconds.
* **Skill-First Hiring**: Allow candidates to take standardized skill assessments across multiple disciplines (Python, React, Java, SQL, GenAI, DevOps) and attach real artifacts/proof of work with job applications.
* **Streamline the Recruiter Workflow**: Build an end-to-end Recruiter Suite featuring stage-by-stage applicant tracking (*Applied ➔ Reviewing ➔ Shortlisted ➔ Interview Scheduled ➔ Hired / Rejected*), applicant notes, and rating matrices.
* **Unified Communication**: Eliminate external third-party software by embedding real-time candidate messaging and WebRTC video meeting scheduling directly inside the platform.
* **Enterprise Security & Cloud Scalability**: Deliver a production-ready application utilizing stateless JWT authentication, scoped rate limiting, cloud serverless database auto-scaling, and global media CDN delivery.

---

## 5. Technology Stack

### Frontend Architecture
* **Core Framework**: React 18 with Vite (Ultra-fast build tooling and HMR)
* **Styling & Design System**: TailwindCSS with bespoke glassmorphic components, micro-animations, and responsive layouts
* **State & Routing**: React Router v6, URL Search Parameters state management
* **Icons & Animation**: Lucide React, Framer Motion
* **Networking**: Axios with centralized HTTP interceptors for automatic Bearer token injection

### Backend Architecture
* **Language & Framework**: Python 3.13, Django 6.0, Django REST Framework (DRF)
* **Authentication**: Django REST Framework SimpleJWT (Access & Refresh token rotation), Google OAuth2 OpenID integration
* **Throttling & Security**: Scoped Rate Limiting (`auth_register`, `auth_login`, `auth_otp_verify`), CORS Headers, CSRF protection, Django Password Validators

### Database & Storage
* **Primary Database**: Neon.tech Serverless PostgreSQL 16 (SSL enabled, auto-scaling compute, connection pooling)
* **Development Database**: SQLite3 (Local offline development fallback)
* **Cloud Object Storage & CDN**: ImageKit (Profile avatars, employer logos, and resume PDFs with global CDN delivery)

### AI & Media Integration
* **AI Processing**: Google Gemini 1.5 Flash API + Fallback Built-in Python NLP Heuristic Engine
* **PDF / Document Extraction**: `pypdf` for binary PDF text stream parsing, XML parsing for DOCX
* **Virtual Interviews**: WebRTC Video Meeting Integration (Jitsi Meet server)

---

## 6. System Architecture & Workflow

```
[ Client Layer (React / Vite) ]
        │  ▲
        │  │ REST APIs (JSON / Multipart)
        ▼  │
[ API & Security Gateway (DRF + SimpleJWT) ]
        │  ▲
        │  │ Authenticated Query & Business Logic
        ▼  │
[ Service & Processing Layer ]
 ├─ AI & NLP Parser (Gemini API + pypdf)
 ├─ Assessment & Evaluation Engine
 ├─ Application Tracking & Status State Machine
 └─ Cloud Storage Gateway (ImageKit API)
        │  ▲
        │  │ Data Persistence & Assets
        ▼  │
[ Cloud Infrastructure ]
 ├─ Neon Serverless PostgreSQL (Structured Tables)
 └─ ImageKit Global CDN (Binary Assets / Media)
```

---

## 7. Key Modules & Functional Description

### Module 1: Authentication & Role-Based Access Control (RBAC)
* **Three Distinct Roles**: Job Seeker (`seeker`), Recruiter (`employer`), and Platform Administrator (`admin`).
* **Direct Frictionless Onboarding**: Candidates and recruiters are immediately authenticated and assigned JWT sessions upon signup without redundant second logins.
* **Google One-Tap Social Login**: Seamless OAuth authentication for fast account creation.
* **Email OTP Verification**: Optional two-factor verification and self-serve password recovery via SMTP.

### Module 2: Job Discovery & Multi-Facet Filtering Engine
* **Interactive Filtering**: Real-time faceted search by category, experience level (Entry, Mid, Senior), work arrangement (Remote, Hybrid, On-site), and salary ranges.
* **Smart Location Matching**: Intelligent matching across tech hubs (Delhi NCR, Bangalore, Hyderabad, Mumbai & Pune, Uttar Pradesh, Remote) with toggleable selection.
* **Bookmarks & Application Tracking**: Candidates can bookmark positions and view live application status badges directly on job cards.

### Module 3: AI Candidate Workspace & Resume Parsing
* **Dual-Engine Resume Parser**: Reads PDF/DOCX resumes, automatically populating full names, emails, phone numbers, tech skills, and career summaries.
* **AI Career Toolkit**:
  * **AI Resume Optimizer**: Analyzes resumes against target roles to recommend missing keywords.
  * **FAANG Coding Practice & Prep**: Interactive technical challenge bank.
  * **Aptitude & Behavioral Preparation**: Prep modules for initial screening rounds.
  * **Skill Gap Roadmap**: Generates personalized learning paths based on candidate profile.

### Module 4: Standardized Skill Assessment Engine
* **7 Comprehensive Technical Tracks**:
  1. Backend Development & Python
  2. React & Modern Frontend Architecture
  3. Java & Spring Boot Enterprise Architecture
  4. Database Management & SQL
  5. Generative AI & Agentic Systems
  6. Frontend Development Essentials
  7. Cloud, DevOps & Docker / Kubernetes
* **Real-Time Evaluation**: Timed assessments with automated scoring, detailed answer explanations, and skill verification records.

### Module 5: Recruiter & Employer Suite
* **Modern Recruiter Dashboard**: Dedicated corporate panel with key hiring metrics (active jobs, total candidates, scheduled interviews).
* **Job Posting & Management**: Form for publishing new positions with required skills and practical challenges.
* **Kanban-Style Application Pipeline**: Track candidates across stages: *Applied ➔ Reviewing ➔ Shortlisted ➔ Interview Scheduled ➔ Hired / Rejected*.
* **Integrated Candidate Communication**: Candidate messaging and virtual interview scheduling with meeting links.

### Module 6: Platform Administration & Compliance
* **Enterprise Admin Portal**: Real-time platform statistics (verified companies, active job openings, registered candidates).
* **Recruiter Verification**: Manual moderation and approval workflows for employer accounts.
* **Audit Trails & Status Events**: Every state change in job applications is permanently logged with timestamps and user IDs.

---

## 8. Database Design (Key Tables)

| Entity | Primary Key | Key Attributes | Relationships |
| :--- | :--- | :--- | :--- |
| **User** | `id` | `email`, `role`, `first_name`, `last_name`, `skills`, `experience_years`, `profile_image`, `resume` | Central User entity |
| **JobCategory** | `id` | `name`, `slug` | One-to-Many with `Job` |
| **Job** | `id` | `title`, `description`, `location`, `salary`, `job_type`, `experience_required`, `is_active` | Foreign Key to `User` (Employer) & `JobCategory` |
| **Application** | `id` | `status`, `cover_letter`, `applied_at` | FK to `User` (Applicant) & `Job` |
| **SkillProof** | `id` | `skills_demonstrated`, `artifact_url`, `explanation` | One-to-One with `Application` |
| **Assessment** | `id` | `title`, `slug`, `category`, `time_minutes`, `passing_score` | One-to-Many with `AssessmentQuestion` |
| **AssessmentQuestion** | `id` | `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation` | FK to `Assessment` |
| **ChatMessage** | `id` | `sender`, `recipient`, `message`, `timestamp`, `is_read` | FK to `User` (Sender & Receiver) |
| **VideoInterview** | `id` | `room_name`, `scheduled_at`, `status` | FK to `Application` |

---

## 9. Security & Production Readiness
1. **Stateless JWT Security**: Passwords salted and hashed with PBKDF2/SHA256; tokens rotated periodically.
2. **Encrypted Cloud Transport**: All database queries enforce TLS/SSL encryption via `sslmode=require` to Neon.
3. **DDoS & Abuse Protection**: Scoped rate-limiting throttles suspicious authentication and registration attempts.
4. **CORS & CSP Safeguards**: Only whitelisted client origins can execute authenticated API requests.

---

## 10. Future Scope & Roadmap
* **AI Voice-Based Mock Interviews**: Integrating speech-to-text and conversational LLMs for real-time oral technical screening.
* **Blockchain-Verified Certificates**: Minting verifiable skill proof credentials on public ledgers.
* **Mobile Applications**: Developing companion iOS and Android apps using React Native.
* **Automated Coding Sandbox**: WebAssembly or isolated Docker sandboxes for real-time live coding assessments.

---

## 11. Conclusion
**Skilloriya** redefines recruitment by transforming hiring from a passive resume collection process into an active, verified, skill-validated ecosystem. By integrating AI-powered resume extraction, standardized skill tests, recruiter pipelines, and embedded video interviews into a cohesive modern interface, Skilloriya bridges the gap between top talent and leading companies with unmatched speed, transparency, and technical rigor.
