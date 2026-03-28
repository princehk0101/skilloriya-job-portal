import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpenText, LifeBuoy, ShieldCheck, FileText, Cookie, Sparkles } from 'lucide-react'

const pageContent = {
  blog: {
    eyebrow: 'Career Blog',
    title: 'Career advice and job search insights.',
    description: 'Read articles on resumes, interviews, applications, and career growth.',
    icon: BookOpenText,
    sections: [
      {
        heading: 'Featured topics',
        body: 'Interview preparation, resume writing, job search strategies, remote work, and career development.',
      },
      {
        heading: 'Who it helps',
        body: 'Useful for students, freshers, and professionals looking to improve their job search approach.',
      },
    ],
  },
  help: {
    eyebrow: 'Help Center',
    title: 'Quick answers for login, profiles, jobs, and applications.',
    description: 'Find answers to common questions related to accounts, profiles, jobs, and applications.',
    icon: LifeBuoy,
    sections: [
      {
        heading: 'Common user support',
        body: 'Login issues, OTP verification, profile updates, resume upload problems, and application submission errors.',
      },
      {
        heading: 'Common employer support',
        body: 'Creating company profile, posting jobs, reviewing applicants, updating statuses, and category management.',
      },
    ],
  },
  guidelines: {
    eyebrow: 'Job Guidelines',
    title: 'Simple posting rules to keep the platform trustworthy.',
    description: 'These rules help maintain quality for both job seekers and employers and reduce spam or misleading listings.',
    icon: FileText,
    sections: [
      {
        heading: 'Posting expectations',
        body: 'Use clear titles, real salary ranges where possible, accurate locations, and category-aligned job descriptions.',
      },
      {
        heading: 'Platform standards',
        body: 'No fake listings, misleading compensation claims, or requests for payments from candidates.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'How profile, company, and application data is handled.',
    description: 'Learn what information is collected and how it is used on the platform.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Data collected',
        body: 'User profile details, uploaded media such as profile images and resumes, job applications, and employer company information.',
      },
      {
        heading: 'How data is used',
        body: 'To authenticate users, match jobs to categories, process applications, and let employers review applicants securely.',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Basic terms for using the job portal responsibly.',
    description: 'These terms explain the rules and responsibilities for using the platform.',
    icon: FileText,
    sections: [
      {
        heading: 'Account usage',
        body: 'Users should provide accurate information and keep credentials secure. Employers are responsible for authentic job listings.',
      },
      {
        heading: 'Platform integrity',
        body: 'Abusive behavior, fraudulent job posts, or misuse of applicant information is not permitted.',
      },
    ],
  },
  cookies: {
    eyebrow: 'Cookies',
    title: 'How cookies and session preferences are used.',
    description: 'This page explains the stored preferences that help keep your session active and improve usability.',
    icon: Cookie,
    sections: [
      {
        heading: 'What is stored',
        body: 'Session tokens, role information, profile cache, and lightweight UI state such as notification read markers.',
      },
      {
        heading: 'Why it matters',
        body: 'These preferences help keep users signed in and improve navigation across visits.',
      },
    ],
  },
}

const InfoPage = ({ pageKey }) => {
  const content = pageContent[pageKey] || pageContent.help
  const Icon = content.icon || Sparkles

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-8 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
            <Icon size={14} />
            {content.eyebrow}
          </div>
          <h1 className="display-font mt-5 text-4xl font-bold leading-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">{content.description}</p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {content.sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur"
            >
              <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default InfoPage
