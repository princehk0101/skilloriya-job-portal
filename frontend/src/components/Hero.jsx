import React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  BadgeCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const partnerLogos = ['Infosys', 'TCS', 'Wipro', 'Adobe', 'Accenture']

const highlightStats = [
  { value: '2k+', label: 'Jobs' },
  { value: '600+', label: 'Companies' },
  { value: '24/7', label: 'Open' },
]

const Hero = () => {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 lg:pb-28 lg:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,_rgba(35,85,217,0.18),_transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(243,180,79,0.18),_transparent_24%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <h1 className="display-font mt-8 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight text-slate-900 lg:text-7xl">
            Find jobs that
            <span className="block text-blue-700">match your skills.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
            Search by title, skill, or company. Apply in minutes.
          </p>

          <div className="glass-panel mt-10 rounded-[1.75rem] p-3">
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                <Search className="text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Job title, skill, company"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                <MapPin className="text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500"
                />
              </div>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Explore Jobs
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            {['Frontend Developer', 'UI/UX Designer', 'Remote'].map((item) => (
              <span key={item} className="cursor-pointer rounded-full border border-slate-200 bg-white/88 px-3 py-1.5 text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {highlightStats.map((item) => (
              <div key={item.label} className="soft-card rounded-[1.5rem] p-5">
                <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative"
        >
          <div className="relative mx-auto max-w-xl">
            <div className="absolute -left-6 top-14 hidden w-52 rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-[0_20px_45px_rgba(16,32,58,0.12)] backdrop-blur lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Verified employers</p>
                  <p className="text-xs font-medium text-slate-500">Trusted listings</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-20 hidden w-56 rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-[0_20px_45px_rgba(16,32,58,0.12)] backdrop-blur lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Application updates</p>
                  <p className="text-xs font-medium text-slate-500">Track status</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-3 shadow-[0_28px_70px_rgba(16,32,58,0.12)] backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"
                alt="Team collaborating at work"
                className="h-[560px] w-full rounded-[1.6rem] object-cover"
              />
            </div>

            <div className="absolute -bottom-8 left-6 right-6 rounded-[1.6rem] border border-slate-800/70 bg-slate-950/95 p-5 text-white shadow-[0_24px_56px_rgba(16,32,58,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-400">All in one</p>
                  <h3 className="mt-1 text-xl font-bold">Jobs, companies, categories</h3>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-2">
                  <Building2 size={18} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-medium text-slate-300">
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">Full-time and internships</div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">Verified company info</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-frame rounded-[2rem] px-6 py-8">
          <div className="mt-6 flex flex-wrap justify-center gap-4 lg:gap-8">
            {partnerLogos.map((item) => (
              <div key={item} className="cursor-default rounded-xl border border-white/70 bg-white px-6 py-3 text-center text-sm font-extrabold tracking-tight text-slate-400 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <BadgeCheck size={16} className="text-blue-700" />
              Full-time and internships
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Sparkles size={16} className="text-amber-600" />
              Remote and on-site
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
