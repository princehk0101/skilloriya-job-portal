import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, ArrowRight, Compass, Sparkles, Building2 } from 'lucide-react'

const Footer = () => {
  const location = useLocation()
  const hideFooterRoutes = [
    '/admin-dashboard',
    '/employer',
    '/portfolio',
    '/ai',
    '/ai-copilot',
    '/dsa-sheets',
    '/task-board',
  ]
  if (hideFooterRoutes.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`))) {
    return null
  }

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.22),_rgba(234,241,250,0.88))] pt-20 text-slate-700">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-12 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-frame rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h2 className="display-font text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                Find jobs. Hire faster.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Clean search. Verified listings.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(16,32,58,0.07)]">
                <Compass className="text-blue-700" size={20} />
                <p className="mt-4 text-2xl font-extrabold text-slate-900">2000+</p>
                <p className="mt-1 text-sm text-slate-500">Open roles</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(16,32,58,0.07)]">
                <Building2 className="text-cyan-700" size={20} />
                <p className="mt-4 text-2xl font-extrabold text-slate-900">600+</p>
                <p className="mt-1 text-sm text-slate-500">Hiring teams</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_40px_rgba(16,32,58,0.07)]">
                <Sparkles className="text-amber-600" size={20} />
                <p className="mt-4 text-2xl font-extrabold text-slate-900">Fresh</p>
                <p className="mt-1 text-sm text-slate-500">Support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="my-14 grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="group flex items-center gap-3 text-slate-900">
              <div className="rounded-2xl bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] p-2 shadow-[0_12px_28px_rgba(35,85,217,0.28)] transition-all group-hover:-translate-y-0.5">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <span className="block text-xl font-bold tracking-tight">Skilloria</span>
              </div>
            </Link>
            <p className="text-sm leading-7 text-slate-600">
              Search jobs, compare companies, and apply with confidence.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">Remote jobs</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">Internships</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">Full-time roles</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-600">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/jobs" className="text-slate-600 transition-colors hover:text-blue-700">Browse Jobs</Link></li>
              <li><Link to="/categories" className="text-slate-600 transition-colors hover:text-blue-700">Career Paths</Link></li>
              <li><Link to="/companies" className="text-slate-600 transition-colors hover:text-blue-700">Companies</Link></li>
              <li><Link to="/assessments" className="text-slate-600 transition-colors hover:text-blue-700">Assessments</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-600">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blog" className="text-slate-600 transition-colors hover:text-blue-700">Career Blog</Link></li>
              <li><Link to="/help" className="text-slate-600 transition-colors hover:text-blue-700">Help Center</Link></li>
              <li><Link to="/guidelines" className="text-slate-600 transition-colors hover:text-blue-700">Guidelines</Link></li>
              <li><Link to="/privacy" className="text-slate-600 transition-colors hover:text-blue-700">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-600">Alerts</h3>
            <p className="mb-4 text-sm leading-7 text-slate-600">Get weekly job updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <button className="rounded-2xl bg-slate-900 p-3 text-white transition-colors hover:bg-blue-700">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:px-6 md:flex-row lg:px-8">
            <p>(c) 2026 Skilloria. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="transition-colors hover:text-blue-700">Terms</Link>
              <Link to="/privacy" className="transition-colors hover:text-blue-700">Privacy</Link>
              <Link to="/cookies" className="transition-colors hover:text-blue-700">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
