# SYNOPSIS OF PROJECT

## SKILLORIYA
### A Skill-Based Job Portal and Recruitment Platform

**Submitted in partial fulfilment of the requirements for the degree of Bachelor of Technology (B.Tech)**

- **Department:** Department of Computer Science and Engineering  
- **University:** Bundelkhand University, Jhansi, Uttar Pradesh  
- **Submitted By:** Sudhanshu Yadav  
- **Roll Number:** [Enter Roll Number]  
- **Academic Session:** 2025–2026  
- **Project Guide:** [Enter Guide Name]  

---

## 1. Abstract

Skilloriya is a modern web-based job portal and recruitment platform designed to help job seekers find jobs and help employers hire the right talent based on real skills. Most traditional job portals only look at resumes with plain keywords, which makes hiring slow and inaccurate. Skilloriya solves this by focusing on verified skills, automated resume parsing, interactive skill assessment tests, and an easy-to-use recruitment dashboard.

The project is built using a modern full-stack architecture. The frontend is made with React.js 18, Vite, and Tailwind CSS to provide a clean and fast user interface. The backend is built using Python with Django REST Framework (DRF) and SimpleJWT authentication, which allows users to log in directly upon signup. For data storage, the application connects to a cloud-based Neon PostgreSQL database with SSL encryption. Candidate resumes and images are safely stored in ImageKit Cloud CDN.

Key features include an automatic resume reader (PyPDF and Google Gemini AI) that fills in candidate details automatically, a skill testing module with 7 tracks and 140+ questions, live job filtering by location and salary, and a simple application tracking pipeline for recruiters.

**Keywords:** Job Portal, Skill-Based Hiring, React.js, Django REST Framework, Neon PostgreSQL, ImageKit CDN, Resume Parser, Online Assessments.

---

## 2. Introduction

Finding a job and hiring skilled candidates has become a big challenge today. Job seekers submit hundreds of resumes on different websites without knowing what happens to their applications. At the same time, companies receive a huge number of resumes and waste weeks manually reading each one to find candidates with the right skills.

Skilloriya is created to solve this problem by providing a centralized and transparent platform where skills come first. It provides clear and separate dashboards for three types of users:

- **Candidates (Job Seekers):** Can create a profile, upload a resume for automatic details extraction, take skill tests to earn badges, search jobs with smart filters, and apply in one click.
- **Recruiters (Employers):** Can create company profiles, post job openings with salary and skill requirements, review applicants, and move candidates through hiring stages (Screening, Interview, Offer).
- **Administrators:** Can monitor platform users, manage job categories, add test questions, and ensure security.

The project combines modern web technologies with cloud services to deliver a smooth and scalable recruitment system.

---

## 3. Problem Statement

Traditional hiring systems have several common problems that make recruitment slow and stressful for both sides:

1. **Manual Resume Screening:** Recruiters spend too many hours reading resumes manually to check basic contact info, education, and skills.
2. **No Proof of Practical Skills:** Resumes often list skills that candidates cannot practically demonstrate, leading to bad hires.
3. **No Application Updates:** Job seekers do not receive status updates on whether their application was seen, shortlisted, or rejected.
4. **Poor Job Filtering:** Many portals do not have clear filters for location, remote work, salary range, and experience levels.
5. **Complicated Signups:** Forcing users through lengthy multi-step verifications causes high dropout rates during registration.
6. **Server Storage Issues:** Storing heavy PDF resumes and pictures directly on the web server slows down the website.

---

## 4. Objectives of the Project

The main goal of Skilloriya is to create a fast, simple, and skill-focused recruitment platform with the following specific goals:

1. Build a fast and responsive single-page web app using React 18, Vite, and Tailwind CSS.
2. Implement secure JWT authentication in Django so candidates and recruiters log in directly after registration.
3. Create an automated ATS Resume Parser using PyPDF and Gemini AI that auto-fills candidate profiles.
4. Build an Online Assessment System with 7 tracks (React, Django, Full-Stack, ML/GenAI, DevOps, TypeScript, SQL) and 140+ questions.
5. Connect the backend to Neon Cloud Serverless PostgreSQL with secure connection pooling.
6. Integrate ImageKit Cloud CDN to store resumes and profile pictures safely in the cloud with fast loading.
7. Provide real-time job search and filters based on location, job type (Full-Time, Remote, Internship), and salary.
8. Provide an easy Applicant Tracking System (ATS) for recruiters to move candidates from Applied to Offered.
9. Enforce role-based security so candidates and recruiters only access their allowed pages.
10. Containerize the complete application using Docker and Docker Compose for easy deployment.

---

## 5. Scope of the Project

- **Candidate Module:** Instant registration with auto-login; profile management with skills and social links; automatic resume parsing; job browsing with filters; bookmarking saved jobs; 1-click job application; live application status tracking; and timed skill assessments with score badges.
- **Recruiter Module:** Recruiter registration; company profile creation with logo and website; job posting with requirements and salary ranges; applicant management pipeline with status tags (Applied, Screening, Interview, Offered, Rejected); and candidate search.
- **Admin & Cloud Features:** Django admin panel to manage users, job categories, and question banks; cloud CDN media storage via ImageKit; and AI career copilot features for interview preparation.

---

## 6. Existing System vs. Proposed System

In the existing system, companies rely on spreadsheets and email inboxes to collect resumes, while candidates fill out repetitive forms on multiple sites. This leads to lost resumes, slow hiring decisions, and zero skill verification.

The proposed **Skilloriya** platform connects everything in one single system. Candidates register and log in instantly, parse their resume in seconds, verify their technical skills through built-in assessments, and apply to relevant jobs. Recruiters can view all applicants in one clean dashboard and update their hiring stages immediately.

---

## 7. System Workflow

1. **Registration:** User signs up as Candidate or Recruiter and is logged in automatically using JWT tokens.
2. **Profile & Resume:** Candidate uploads a resume PDF; PyPDF and AI extract details automatically, while the file is saved to ImageKit CDN.
3. **Skill Test:** Candidate takes a timed quiz; the system calculates the score and displays a badge on their profile.
4. **Job Search & Apply:** Candidate filters jobs by location and salary, then clicks 'Apply Now'.
5. **Recruiter Review:** Recruiter opens their dashboard, reads the applicant's resume and test score, and updates the hiring status.

---

## 8. Technology Stack

| Technology | Role | Description & Purpose |
| :--- | :--- | :--- |
| **React.js 18** | Frontend | Builds interactive single-page user interface with reusable components |
| **Vite 5** | Build Tool | Provides ultra-fast local development and production code bundling |
| **Tailwind CSS 4** | Styling | Creates clean, responsive layouts that work on mobile and desktop |
| **Lucide React** | Icons | Modern icons for clean navigation across all pages and buttons |
| **Axios** | HTTP Client | Sends requests from React to Django with automatic JWT auth tokens |
| **Python 3.12** | Language | Main programming language for backend APIs and logic |
| **Django 6.0 & DRF** | Backend | Provides REST API endpoints, serializers, and administrative panel |
| **SimpleJWT** | Auth | Handles secure stateless login and token refresh with direct auto-login |
| **Neon PostgreSQL** | Database | Cloud Serverless PostgreSQL with SSL connection pooling |
| **ImageKit CDN** | Cloud Storage | Stores profile pictures, logos, and PDF resumes with fast global delivery |
| **PyPDF & Gemini AI** | Resume Parser | Extracts text and auto-detects name, skills, and experience from resumes |
| **Docker & Compose** | Deployment | Packages frontend and backend into containers for simple hosting |

---

## 9. System Architecture

```
+-------------------------------------------------------------------------+
|                    CLIENT (React 18 + Vite + Tailwind CSS)              |
|           Candidate Dashboard  |  Recruiter Dashboard  |  Assessments   |
+-------------------------------------------------------------------------+
                                     |
                         HTTPS / REST (Axios + JWT)
                                     v
+-------------------------------------------------------------------------+
|                 DJANGO REST FRAMEWORK BACKEND                           |
|     SimpleJWT Auto-Login | Role Permissions | ATS Logic & APIs          |
+-------------------------------------------------------------------------+
         |                           |                           |
         v                           v                           v
+-----------------+        +--------------------+      +------------------+
| NEON POSTGRESQL |        | IMAGEKIT CLOUD CDN |      | PYPDF + GEMINI   |
| Cloud Database  |        | Resumes & Images   |      | AI Resume Parser |
+-----------------+        +--------------------+      +------------------+
```

---

## 10. Functional Requirements

- **FR-01: Auto-Login on Registration:** Users are immediately logged in after signup without re-entering credentials.
- **FR-02: JWT Authentication:** Secure Bearer token authorization protects private pages and data.
- **FR-03: Resume Text Parsing:** Uploaded PDF resumes are read automatically to extract name, email, skills, and bio.
- **FR-04: Skill Assessment Tests:** 7 tracks with 140+ MCQs, automatic timer, and instant score calculation.
- **FR-05: Real-Time Job Filters:** Search jobs by keyword, location, job type (Full-Time, Remote), and salary range.
- **FR-06: 1-Click Application:** Candidates submit applications easily and monitor their progress live.
- **FR-07: Recruiter Job Posting:** Employers create and manage job postings with custom requirements and pay.
- **FR-08: Recruiter ATS Funnel:** Recruiters view applicants and change status: Applied → Screening → Interview → Offered.
- **FR-09: Cloud CDN Storage:** Profile photos, logos, and resumes upload directly to ImageKit cloud storage.
- **FR-10: Role Protection:** Strict security rules ensure candidates cannot access recruiter features and vice versa.

---

## 11. Non-Functional Requirements

- **Security:** Passwords hashed using PBKDF2; JWT tokens for authentication; SSL encrypted database queries.
- **Speed:** Fast REST API responses and accelerated image loading via global ImageKit CDN servers.
- **Scalability:** Neon PostgreSQL serverless architecture automatically handles growing data and users.
- **Responsiveness:** Clean mobile-first design that works smoothly on phones, tablets, and computers.

---

## 12. Database Design

| Table / Model | App | Key Fields & Relational Links |
| :--- | :--- | :--- |
| **User** | users | id, email, password, role (candidate/recruiter), full_name, phone, bio, skills, profile_image, resume, location |
| **Company** | jobs | id, name, slug, logo, description, website, location, industry, size |
| **Category** | jobs | id, name, slug, icon, job_count |
| **Job** | jobs | id, recruiter (FK), company (FK), category (FK), title, description, job_type, location, is_remote, salary_min, salary_max, skills_required, is_active |
| **Application** | applications | id, job (FK), candidate (FK), cover_letter, resume, status (applied, screening, interview, offered, rejected), applied_at |
| **SkillTrack** | skills | id, title, slug, description, icon, difficulty, time_limit_mins, passing_score |
| **SkillQuestion** | skills | id, track (FK), question_text, options (JSON), correct_option, explanation |
| **AssessmentAttempt** | skills | id, user (FK), track (FK), score, passed, completed_at |

---

## 13. Development Methodology

The project was built step-by-step using an Agile approach across 6 main phases:
1. **Planning:** Defining candidate and recruiter needs.
2. **Backend Development:** Creating Django models, APIs, and JWT auto-login.
3. **Database & Cloud Setup:** Connecting Neon PostgreSQL and ImageKit CDN.
4. **Frontend Development:** Building React pages with Vite and Tailwind CSS.
5. **Integration:** Connecting frontend and backend with Axios.
6. **Testing & Deployment:** Verifying all features and preparing Docker setup.

---

## 14. Feasibility Study

- **Technical Feasibility:** The project uses stable, popular tools (React, Django, PostgreSQL) with great community support.
- **Economic Feasibility:** Built using free-tier cloud services (Neon, ImageKit, open-source libraries), costing nothing during development.
- **Operational Feasibility:** Simple and clean user interface that anyone can use without special training.

---

## 15. Testing Strategy

- **Unit Testing:** Checked password security, resume text extraction, and quiz score calculation.
- **API Testing:** Tested all REST endpoints for valid responses (200 OK) and error handling.
- **User Flow Testing:** Tested full flow: Signup → Auto-login → Resume Upload → Test → Job Apply → Recruiter Review.
- **Device Testing:** Verified that the website looks and works great on both mobile screens and desktops.

---

## 16. Expected Outcomes

- A working job portal connecting candidates and recruiters in one place.
- Instant auto-login that saves time for every new user.
- Automated resume parsing that fills profile fields automatically.
- 7 live skill tests with 140+ questions to prove candidate abilities.
- Fast cloud storage for all images and resume files via ImageKit CDN.

---

## 17. Limitations & Future Scope

- **Limitations:** Resume parser works best on standard text PDFs; complex image-heavy resumes may need small manual edits. Requires internet for cloud database and CDN.
- **Future Scope:** (1) Adding live video interviews inside the browser. (2) Real-time chat between recruiters and candidates. (3) Mobile app for Android and iOS using React Native. (4) Push notifications for interview alerts.

---

## 18. Conclusion

Skilloriya successfully solves the main problems of traditional job hunting by putting skills first. By combining React.js, Django REST Framework, Neon Cloud PostgreSQL, and ImageKit CDN, the platform provides a fast, simple, and transparent hiring experience. It helps candidates prove their skills and helps recruiters hire faster with less manual work.

---

## 19. References

1. React.js Documentation — https://react.dev/
2. Django REST Framework — https://www.django-rest-framework.org/
3. Neon Serverless PostgreSQL — https://neon.tech/docs
4. ImageKit.io Developer Docs — https://docs.imagekit.io/
5. Tailwind CSS Guide — https://tailwindcss.com/docs

---

### Signatures

| Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Student** | Sudhanshu Yadav | ______________________ | ____________ |
| **Project Guide** | [Guide Name] | ______________________ | ____________ |
| **Head of Department** | Dept. of CSE, BU Jhansi | ______________________ | ____________ |
