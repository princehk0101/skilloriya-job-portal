import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Palette,
  ScanSearch,
  Sparkles,
  Quote,
  SunMedium,
  Building2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import CategoryCard from '../components/CategoryCard'
import JobCard from '../components/JobCard'

const designHighlights = [
  {
    title: 'Browse jobs by category',
    description: 'Explore opportunities in development, design, marketing, finance, management, and other in-demand fields.',
    icon: Palette,
  },
  {
    title: 'Explore hiring companies',
    description: 'Review company details, locations, and active openings before you submit an application.',
    icon: Compass,
  },
  {
    title: 'Simple application process',
    description: 'Create your profile, upload your resume, and apply to jobs that match your skills and interests.',
    icon: ScanSearch,
  },
]

const experiencePillars = [
  'Find jobs across multiple categories and locations',
  'Compare employers and review company information',
  'Submit applications with profile details and resume',
]

const showcaseCards = [
  {
    title: 'For job seekers',
    description: 'Search jobs, save time with faster applications, and keep your profile ready for new opportunities.',
    icon: SunMedium,
  },
  {
    title: 'For employers',
    description: 'Post openings, manage company details, and review applicants from one place.',
    icon: Building2,
  },
  {
    title: 'Career resources',
    description: 'Use categories, company pages, and support pages to stay informed while searching for jobs.',
    icon: BadgeCheck,
  },
]

const testimonials = [
  {
    name: 'Aarav S.',
    role: 'Backend Developer Intern',
    quote: 'I found relevant openings quickly and the application process was straightforward.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Neha R.',
    role: 'Campus Hiring Coordinator',
    quote: 'The company pages and job listings make it easier to review roles before sharing them with students.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Zaid M.',
    role: 'Frontend Trainee',
    quote: 'The categories and company listings helped me understand where to apply without wasting time.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Hero />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">Why Skilloria</p>
              <h2 className="display-font mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Everything you need for a better job search.</h2>
            </div>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Discover jobs, explore companies, and apply with the information you need in one place.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {designHighlights.map((step, idx) => {
              const Icon = step.icon
              return (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="section-frame rounded-[1.75rem] p-8 transition-all hover:-translate-y-1 hover:border-blue-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <CategoryCard />
      <JobCard />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">Who Can Use It</p>
              <h2 className="display-font mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Built for candidates and employers.</h2>
            </div>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Whether you are looking for your next role or hiring for your team, the platform helps you manage the process more easily.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {showcaseCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="soft-card rounded-[1.75rem] p-8 transition-all hover:-translate-y-1 hover:border-blue-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-blue-500/20">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[linear-gradient(140deg,_#10203a,_#173c8f,_#0f8698)] p-10 text-white shadow-[0_24px_60px_rgba(16,32,58,0.2)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-blue-100">
              <Building2 size={14} />
              For employers
            </div>
            <h2 className="display-font mt-8 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Post jobs and reach the right candidates.</h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-blue-50/85">
              Create job listings, share company details, and review applications from a single employer dashboard.
            </p>
            <div className="mt-10 space-y-3">
              {experiencePillars.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-medium text-blue-50/90">
                  {item}
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 shadow-sm"
            >
              Post a Job
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="section-frame overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1400"
              alt="Creative team working together"
              className="h-80 w-full object-cover"
            />
            <div className="p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-blue-700">
                <Sparkles size={14} className="text-blue-600" />
                Job search
              </div>
              <h3 className="display-font mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Find jobs that match your skills and interests.</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
                Browse active openings, compare employers, and move from search to application without switching platforms.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-5 py-4">
                  <Compass className="text-blue-600" size={18} />
                  <p className="mt-3 text-sm font-bold text-slate-900">Search by category</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-5 py-4">
                  <BadgeCheck className="text-blue-600" size={18} />
                  <p className="mt-3 text-sm font-bold text-slate-900">View company details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">Success stories</p>
              <h2 className="display-font mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">What users say about Skilloria.</h2>
            </div>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Candidates and hiring teams use the platform to discover opportunities, review details, and apply faster.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, idx) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="section-frame flex h-full flex-col rounded-[1.75rem] p-8 transition-shadow hover:shadow-[0_24px_52px_rgba(16,32,58,0.1)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{item.role}</p>
                  </div>
                </div>
                <div className="mt-6 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-400">
                  <Quote size={16} />
                </div>
                <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-600">{item.quote}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="section-frame overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=1400"
              alt="Modern workspace"
              className="h-full min-h-[320px] w-full object-cover grayscale-[10%]"
            />
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-[linear-gradient(135deg,_#101c34,_#173d95,_#0f8698)] p-10 text-white shadow-[0_24px_60px_rgba(16,32,58,0.24)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-blue-100">
              <Sparkles size={14} className="text-blue-400" />
              Get started
            </div>
            <h2 className="display-font mt-8 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Start your job search today.</h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-blue-50/80">
              Create an account, explore available jobs, and connect with companies that are hiring now.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Create Account
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/companies"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Explore Companies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
