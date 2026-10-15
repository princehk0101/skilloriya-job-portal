import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  MessageSquare,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
} from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import {
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from '../utils/applications'

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'applied', label: 'Submitted' },
  { id: 'screening', label: 'In Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interviewing' },
  { id: 'offer', label: 'Offers' },
  { id: 'rejected', label: 'Archived' },
]

const getStepIndex = (status) => {
  switch (status) {
    case 'applied':
      return 1
    case 'screening':
      return 2
    case 'shortlisted':
    case 'interview':
      return 3
    case 'offer':
    case 'accepted':
      return 4
    case 'rejected':
      return 2
    default:
      return 1
  }
}

const AppliedJobs = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login', { state: { returnUrl: '/applied-jobs' } })
      return
    }

    const loadApplications = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/applications/my-applications/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || []
        setApplications(data)
      } catch (err) {
        console.error('Failed to load applications:', err.response?.data || err.message)
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [navigate])

  const stats = useMemo(() => {
    const total = applications.length
    const inReview = applications.filter(
      (a) => a.status === 'screening' || a.status === 'applied'
    ).length
    const activeInterviews = applications.filter(
      (a) => a.status === 'interview' || a.status === 'shortlisted'
    ).length
    const offers = applications.filter(
      (a) => a.status === 'offer' || a.status === 'accepted'
    ).length

    return { total, inReview, activeInterviews, offers }
  }, [applications])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        app.job_title?.toLowerCase().includes(q) ||
        app.company_name?.toLowerCase().includes(q) ||
        app.employer_name?.toLowerCase().includes(q) ||
        app.job_location?.toLowerCase().includes(q)

      const matchesTab =
        selectedTab === 'all' ||
        (selectedTab === 'applied' && app.status === 'applied') ||
        (selectedTab === 'screening' && app.status === 'screening') ||
        (selectedTab === 'shortlisted' && app.status === 'shortlisted') ||
        (selectedTab === 'interview' && app.status === 'interview') ||
        (selectedTab === 'offer' && (app.status === 'offer' || app.status === 'accepted')) ||
        (selectedTab === 'rejected' && app.status === 'rejected')

      return matchesSearch && matchesTab
    })
  }, [applications, search, selectedTab])

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff,_#f1f5f9)] pt-24 pb-20">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-300/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-60 h-80 w-80 rounded-full bg-cyan-300/15 blur-[120px]" />

      <div className="relative z-10 mx-auto w-[98%] max-w-[1400px] px-3 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Briefcase size={14} />
            Candidate Application Tracker
          </span>
          <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            My Applied Jobs
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl mx-auto">
            Track your active job applications, interview updates, and candidate status in real-time.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Browse More Jobs
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

          {/* Quick Metrics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applied</span>
              <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4 shadow-sm backdrop-blur">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">In Screening</span>
              <p className="mt-1 text-2xl font-black text-blue-900">{stats.inReview}</p>
            </div>
            <div className="rounded-2xl border border-violet-200/80 bg-violet-50/70 p-4 shadow-sm backdrop-blur">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Interviews</span>
              <p className="mt-1 text-2xl font-black text-violet-900">{stats.activeInterviews}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-sm backdrop-blur">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Job Offers</span>
              <p className="mt-1 text-2xl font-black text-emerald-900">{stats.offers}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search applied jobs, company, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Application Count */}
            <p className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-800">{filteredApplications.length}</strong> of{' '}
              {applications.length} applications
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? applications.length
                  : applications.filter((a) => {
                      if (tab.id === 'offer') return a.status === 'offer' || a.status === 'accepted'
                      return a.status === tab.id
                    }).length

              const isSelected = selectedTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Loading / Empty / List */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Loading your applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 sm:p-14 text-center shadow-sm">
            <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-blue-600">
              <Briefcase size={36} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {search || selectedTab !== 'all'
                ? 'No matching applications found'
                : 'No job applications submitted yet'}
            </h3>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500">
              {search || selectedTab !== 'all'
                ? 'Try adjusting your search keywords or clearing the status filter.'
                : 'Explore open roles matching your skillset and start applying with 1-click verification.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {search || selectedTab !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedTab('all')
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
              ) : null}
              <Link
                to="/jobs"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Browse All Open Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredApplications.map((app, idx) => {
              const isExpanded = expandedId === app.id
              const step = getStepIndex(app.status)
              const statusClass = getApplicationStatusClass(app.status)
              const statusLabel = getApplicationStatusLabel(app.status)

              return (
                <motion.article
                  key={app.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  {/* Card Header & Primary Info */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Employer Logo & Job info */}
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1.5 shadow-sm">
                          {app.employer_image_url ? (
                            <img
                              src={resolveMediaUrl(app.employer_image_url)}
                              alt={app.company_name || 'Employer'}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/jobs/${app.job}`}
                              className="text-base sm:text-lg font-black text-slate-900 transition hover:text-blue-600"
                            >
                              {app.job_title}
                            </Link>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
                            <span className="font-bold text-slate-800">
                              {app.company_name || app.employer_name || 'Recruiter'}
                            </span>
                            {app.job_location ? (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <MapPin size={12} className="text-slate-400" />
                                {app.job_location}
                              </span>
                            ) : null}
                            {app.job_type ? (
                              <span className="inline-flex items-center gap-1 text-slate-500 uppercase text-[10px] font-bold">
                                <Clock size={11} className="text-slate-400" />
                                {app.job_type}
                              </span>
                            ) : null}
                            {app.job_salary ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <IndianRupee size={12} />
                                {Number(app.job_salary).toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Date */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black tracking-wide ${statusClass}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {statusLabel}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Calendar size={12} />
                          {app.applied_at
                            ? new Date(app.applied_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>

                    {/* Application Timeline / Stepper */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting line */}
                        <div className="absolute left-0 top-1/2 -z-0 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
                        <div
                          className="absolute left-0 top-1/2 -z-0 h-0.5 -translate-y-1/2 bg-blue-600 transition-all duration-500"
                          style={{
                            width:
                              app.status === 'rejected'
                                ? '40%'
                                : step === 1
                                ? '15%'
                                : step === 2
                                ? '45%'
                                : step === 3
                                ? '75%'
                                : '100%',
                          }}
                        />

                        {/* Step 1 */}
                        <div className="z-10 flex flex-col items-center bg-white px-1 sm:px-2">
                          <div
                            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 1
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 bg-white text-slate-400'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="mt-1 text-[10px] sm:text-xs font-bold text-slate-800">Applied</span>
                        </div>

                        {/* Step 2 */}
                        <div className="z-10 flex flex-col items-center bg-white px-1 sm:px-2">
                          <div
                            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                              app.status === 'rejected'
                                ? 'bg-rose-600 text-white'
                                : step >= 2
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 bg-white text-slate-400'
                            }`}
                          >
                            {app.status === 'rejected' ? <XCircle size={14} /> : <Clock3 size={14} />}
                          </div>
                          <span className="mt-1 text-[10px] sm:text-xs font-bold text-slate-800">
                            {app.status === 'rejected' ? 'Declined' : 'Screening'}
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="z-10 flex flex-col items-center bg-white px-1 sm:px-2">
                          <div
                            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 3
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 bg-white text-slate-400'
                            }`}
                          >
                            <Sparkles size={14} />
                          </div>
                          <span className="mt-1 text-[10px] sm:text-xs font-bold text-slate-800">Interview</span>
                        </div>

                        {/* Step 4 */}
                        <div className="z-10 flex flex-col items-center bg-white px-1 sm:px-2">
                          <div
                            className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                              step >= 4
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 bg-white text-slate-400'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="mt-1 text-[10px] sm:text-xs font-bold text-slate-800">Decision</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {app.resume_url || app.resume ? (
                          <a
                            href={resolveMediaUrl(app.resume_url || app.resume)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <FileText size={13} className="text-blue-600" />
                            Submitted Resume
                            <ExternalLink size={11} className="text-slate-400" />
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => toggleExpand(app.id)}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                          {isExpanded ? 'Less details' : 'View details'}
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${app.job}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          Job Details
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                              Applicant Profile Info
                            </h4>
                            <p className="text-xs font-medium text-slate-700">
                              <strong>Name:</strong> {app.full_name || app.applicant_name}
                            </p>
                            {app.college_name ? (
                              <p className="text-xs font-medium text-slate-700 mt-1">
                                <strong>College/University:</strong> {app.college_name}
                              </p>
                            ) : null}
                            {app.phone_number ? (
                              <p className="text-xs font-medium text-slate-700 mt-1">
                                <strong>Phone:</strong> {app.phone_number}
                              </p>
                            ) : null}
                          </div>

                          {app.cover_letter ? (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Cover Note
                              </h4>
                              <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                                {app.cover_letter}
                              </p>
                            </div>
                          ) : null}
                        </div>

                        {/* Status history log if available */}
                        {app.status_history && app.status_history.length > 0 ? (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Application Status Updates
                            </h4>
                            <div className="space-y-1.5">
                              {app.status_history.map((event) => (
                                <div
                                  key={event.id}
                                  className="flex items-center justify-between text-xs text-slate-600"
                                >
                                  <span>
                                    Status changed to{' '}
                                    <strong className="text-slate-800 uppercase">
                                      {event.to_status}
                                    </strong>
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {event.created_at
                                      ? new Date(event.created_at).toLocaleDateString()
                                      : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default AppliedJobs
