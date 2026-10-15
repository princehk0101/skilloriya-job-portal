import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Search,
  ArrowRight,
  UserCircle2,
  Bookmark,
  Sparkles,
  Video,
  Award,
  Calendar,
  Layers,
  MapPin,
  IndianRupee,
  Loader2,
  Trash2,
  Zap,
  History,
  BellRing,
  FileUp,
  Printer,
  MessageSquare,
} from 'lucide-react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { resolveMediaUrl } from '../utils/media'
import { getApplicationStatusClass, getApplicationStatusLabel } from '../utils/applications'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [aiJobs, setAiJobs] = useState([])
  const [recommendationSource, setRecommendationSource] = useState('profile')
  const [recommendationSkills, setRecommendationSkills] = useState([])
  const [interviews, setInterviews] = useState([])
  const [badges, setBadges] = useState([])
  const [jobAlerts, setJobAlerts] = useState([])
  const [resumeVersions, setResumeVersions] = useState([])
  const [resumeMessage, setResumeMessage] = useState('')
  const [alertDraft, setAlertDraft] = useState({ name: '', keyword: '', skills: '', location: '', job_type: '' })
  const [alertMatches, setAlertMatches] = useState({})
  const [alertMessage, setAlertMessage] = useState('')
  const [activeTab, setActiveTab] = useState('applications') // 'applications' | 'saved' | 'ai_recommended' | 'interviews' | 'badges'
  const [expandedApplicationId, setExpandedApplicationId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const config = getAuthConfig()
      const [userRes, appsRes, savedRes, aiRes, interviewRes, badgesRes, alertsRes, resumesRes] = await Promise.allSettled([
        axios.get('/api/users/profile/', config),
        axios.get('/api/applications/my-applications/', config),
        axios.get('/api/jobs/saved/', config),
        axios.get('/api/ai/recommended-jobs/', config),
        axios.get('/api/applications/interviews/my/', config),
        axios.get('/api/skills/my-badges/', config),
        axios.get('/api/jobs/alerts/', config),
        axios.get('/api/users/resume-versions/', config),
      ])

      if (userRes.status === 'fulfilled') {
        const currentUser = userRes.value.data
        if (currentUser?.is_staff || currentUser?.is_superuser) {
          navigate('/admin-dashboard')
          return
        }
        if (currentUser?.role === 'employer') {
          navigate('/employer')
          return
        }
        localStorage.setItem('user_role', currentUser?.role || 'seeker')
        localStorage.setItem('user_profile', JSON.stringify(currentUser))
        setUser(currentUser)
      }

      if (appsRes.status === 'fulfilled') {
        setApplications(normalizeList(appsRes.value.data))
      }
      if (savedRes.status === 'fulfilled') {
        setSavedJobs(normalizeList(savedRes.value.data))
      }
      if (aiRes.status === 'fulfilled') {
        setAiJobs(normalizeList(aiRes.value.data))
      }
      if (interviewRes.status === 'fulfilled') {
        setInterviews(normalizeList(interviewRes.value.data))
      }
      if (badgesRes.status === 'fulfilled') {
        setBadges(normalizeList(badgesRes.value.data))
      }
      if (alertsRes.status === 'fulfilled') {
        setJobAlerts(normalizeList(alertsRes.value.data))
      }
      if (resumesRes.status === 'fulfilled') {
        setResumeVersions(normalizeList(resumesRes.value.data))
      }
    } catch (err) {
      console.error('Dashboard load failed:', err)
      setError('Unable to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRemoveSaved = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/save/`, {}, getAuthConfig())
      setSavedJobs((prev) => prev.filter((item) => item.job !== jobId && item.job_detail?.id !== jobId))
    } catch (err) {
      console.error('Failed to remove saved job:', err)
    }
  }

  const handleCreateAlert = async (event) => {
    event.preventDefault()
    setAlertMessage('')
    try {
      const response = await axios.post('/api/jobs/alerts/', alertDraft, getAuthConfig())
      setJobAlerts((current) => [response.data, ...current])
      setAlertDraft({ name: '', keyword: '', skills: '', location: '', job_type: '' })
      setAlertMessage('Job alert created. Matching new jobs will be sent to your email.')
    } catch (err) {
      setAlertMessage(err.response?.data?.detail || 'Could not create this alert. Check the fields and try again.')
    }
  }

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`/api/jobs/alerts/${alertId}/`, getAuthConfig())
      setJobAlerts((current) => current.filter((alert) => alert.id !== alertId))
      setAlertMatches((current) => {
        const next = { ...current }
        delete next[alertId]
        return next
      })
    } catch {
      setAlertMessage('Could not delete this alert. Please try again.')
    }
  }

  const handleShowAlertMatches = async (alertId) => {
    try {
      const response = await axios.get(`/api/jobs/alerts/${alertId}/matches/`, getAuthConfig())
      setAlertMatches((current) => ({ ...current, [alertId]: normalizeList(response.data) }))
    } catch {
      setAlertMessage('Could not load matching jobs right now.')
    }
  }

  const handleUploadResumeVersion = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const payload = new FormData()
    payload.append('name', file.name.replace(/\.[^.]+$/, ''))
    payload.append('file', file)
    setResumeMessage('')
    try {
      const response = await axios.post('/api/users/resume-versions/', payload, getAuthConfig())
      setResumeVersions((current) => [response.data, ...current])
      setResumeMessage('Resume uploaded. Finding vacancies that fit this resume…')
      try {
        const matchesResponse = await axios.get(`/api/ai/recommended-jobs/?resume_id=${response.data.id}`, getAuthConfig())
        const matches = normalizeList(matchesResponse.data)
        setAiJobs(matches)
        const firstMatch = matches[0]?.ai_match
        const skills = firstMatch?.resume_skills || []
        setRecommendationSkills(skills)
        setRecommendationSource(firstMatch?.matching_basis || 'profile')
        setActiveTab('ai_recommended')
        setResumeMessage(skills.length
          ? `Resume uploaded. Found ${skills.length} skill${skills.length === 1 ? '' : 's'} and ranked matching vacancies.`
          : 'Resume uploaded. No skills could be extracted, so suggestions use your profile details.')
      } catch (matchError) {
        console.error('Resume job matching failed:', matchError.response?.data || matchError.message)
        setResumeMessage('Resume uploaded, but matching vacancies could not be loaded. Open Recommended Jobs to try again.')
      }
    } catch (err) {
      const detail = err.response?.data?.file?.[0] || err.response?.data?.name?.[0]
      setResumeMessage(detail || 'Could not upload this resume. Use a PDF, DOC, or DOCX file up to 10 MB.')
    }
  }

  const handleDeleteResumeVersion = async (resumeId) => {
    try {
      await axios.delete(`/api/users/resume-versions/${resumeId}/`, getAuthConfig())
      setResumeVersions((current) => current.filter((resume) => resume.id !== resumeId))
      setResumeMessage('Resume version deleted.')
    } catch {
      setResumeMessage('Could not delete this resume version.')
    }
  }

  const handlePrintPassport = () => window.print()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-20">
      <div className="w-[98%] max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Centered Header with No BG */}
        <div className="text-center max-w-3xl mx-auto mb-10 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Sparkles size={14} />
            Candidate Command Center
          </span>
          <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            Welcome back, {user?.first_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl mx-auto">
            Track your active applications, saved jobs, AI matches, and interview schedules.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        {/* Top Applicant Banner Alert */}
        {aiJobs.length > 0 && (
          <div className="mb-6 rounded-3xl border border-cyan-200 bg-[linear-gradient(135deg,_#eff6ff,_#ecfeff)] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="rounded-2xl bg-cyan-600 text-white p-3 shadow-md shrink-0">
                  <Sparkles size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-slate-900 uppercase tracking-wider">
                      🏆 Top Applicant Matches Found
                    </span>
                    <span className="text-xs font-bold text-slate-700">({aiJobs.length} Positions Available)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Based on your profile skills, experience, and location, you are a <strong>strong match</strong> for {aiJobs[0]?.title || "these roles"}. Take skill assessments to earn verified badges and apply directly.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Link
                  to="/assessments"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-cyan-300 px-3.5 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-50 shadow-sm transition"
                >
                  <Award size={14} className="text-amber-500" />
                  Play Skill Test
                </Link>
                <button
                  onClick={() => setActiveTab('ai_recommended')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 shadow-sm transition"
                >
                  <Zap size={13} className="text-amber-400" />
                  View Top Roles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Briefcase size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Applications</p>
            <p className="text-2xl font-black text-slate-900">{applications.length}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Bookmark size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Saved in Wishlist</p>
            <p className="text-2xl font-black text-slate-900">{savedJobs.length}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
              <Video size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Interviews</p>
            <p className="text-2xl font-black text-slate-900">{interviews.length}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Award size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Earned Badges</p>
            <p className="text-2xl font-black text-slate-900">{badges.length}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => setActiveTab('applications')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'applications'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Briefcase size={14} />
            My Applications ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'saved'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <Bookmark size={14} />
            Saved Jobs ({savedJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <BellRing size={14} />
            Job Alerts ({jobAlerts.length})
          </button>

          <button
            onClick={() => setActiveTab('resumes')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'resumes'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileUp size={14} />
            Resume Versions ({resumeVersions.length})
          </button>

          <button
            onClick={() => setActiveTab('passport')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'passport'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-800'
            }`}
          >
            <Award size={14} />
            Skill Fit Passport
          </button>

          <button
            onClick={() => setActiveTab('ai_recommended')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'ai_recommended'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
            }`}
          >
            <Sparkles size={14} />
            Skill Matches ({aiJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'interviews'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Video size={14} />
            Interviews ({interviews.length})
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'badges'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <Award size={14} />
            My Certifications ({badges.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="rounded-[2.5rem] border border-blue-100 bg-white/95 p-6 sm:p-8 shadow-sm">
          {/* 1. Applications Tab */}
          {activeTab === 'applications' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Application Progress</h3>
              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Briefcase size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No applications submitted yet</p>
                  <Link to="/" className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline">
                    Explore Job Feed →
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{app.job_title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applied on {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${getApplicationStatusClass(app.status)}`}>
                          {getApplicationStatusLabel(app.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('open-chat', {
                                detail: {
                                  partnerId: app.employer_id,
                                  jobId: app.job,
                                  partnerName: `${app.company_name || app.employer_name || 'Recruiter'} · ${app.job_title}`,
                                  companyName: app.company_name,
                                  jobTitle: app.job_title,
                                },
                              })
                            )
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-sm"
                        >
                          <MessageSquare size={13} />
                          Message Recruiter
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedApplicationId((current) => current === app.id ? null : app.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
                          aria-expanded={expandedApplicationId === app.id}
                        >
                          <History size={14} />
                          {expandedApplicationId === app.id ? 'Hide timeline' : 'Track status'}
                        </button>
                        <Link
                          to={`/jobs/${app.job}`}
                          className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          View Role
                        </Link>
                      </div>
                    </div>

                    {app.skill_proof ? (
                      <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-xs text-slate-700">
                        <p className="font-bold text-slate-900">Skill proof · <span className="capitalize">{app.skill_proof.status.replace('_', ' ')}</span></p>
                        {app.skill_proof.review_note ? <p className="mt-1">Employer feedback: {app.skill_proof.review_note}</p> : null}
                      </div>
                    ) : null}

                    {expandedApplicationId === app.id ? (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status history</h5>
                        <ol className="space-y-3">
                          {(app.status_history || []).map((event) => (
                            <li key={event.id} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                <History size={13} />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {event.is_baseline
                                    ? `Tracking started at ${getApplicationStatusLabel(event.to_status)}`
                                    : event.from_status
                                      ? `${getApplicationStatusLabel(event.from_status)} → ${getApplicationStatusLabel(event.to_status)}`
                                      : `Application submitted · ${getApplicationStatusLabel(event.to_status)}`}
                                </p>
                                <time className="text-xs text-slate-500" dateTime={event.created_at}>
                                  {new Date(event.created_at).toLocaleString()}
                                </time>
                              </div>
                            </li>
                          ))}
                        </ol>
                        {app.status_history?.some((event) => event.is_baseline) ? (
                          <p className="mt-3 text-xs text-slate-500">Earlier status changes were not recorded. New updates will appear here.</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          ) : null}

          {/* 2. Saved Jobs Tab */}
          {activeTab === 'alerts' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Smart Job Alerts</h3>
                <p className="mt-1 text-xs text-slate-500">Get an email when a new job matches your location, job type, or any skill you list.</p>
              </div>
              <form onSubmit={handleCreateAlert} className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <input required maxLength={120} value={alertDraft.name} onChange={(e) => setAlertDraft({ ...alertDraft, name: e.target.value })} placeholder="Alert name (e.g. React remote)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                <input value={alertDraft.keyword} onChange={(e) => setAlertDraft({ ...alertDraft, keyword: e.target.value })} placeholder="Job title or keyword" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                <input value={alertDraft.skills} onChange={(e) => setAlertDraft({ ...alertDraft, skills: e.target.value })} placeholder="Skills (comma separated)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                <input value={alertDraft.location} onChange={(e) => setAlertDraft({ ...alertDraft, location: e.target.value })} placeholder="Location" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                <select value={alertDraft.job_type} onChange={(e) => setAlertDraft({ ...alertDraft, job_type: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">Any work style</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Create alert</button>
              </form>
              {alertMessage ? <p role="status" className="text-sm text-indigo-800">{alertMessage}</p> : null}
              {jobAlerts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">You have no alerts yet. Create one to hear about matching jobs by email.</p>
              ) : jobAlerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{alert.name}</h4>
                      <p className="mt-1 text-xs text-slate-500">{[alert.keyword, alert.skills && `Skills: ${alert.skills}`, alert.location, alert.job_type].filter(Boolean).join(' · ') || 'All new jobs'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleShowAlertMatches(alert.id)} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50">Find matching jobs</button>
                      <button onClick={() => handleDeleteAlert(alert.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Delete</button>
                    </div>
                  </div>
                  {alertMatches[alert.id] ? (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      {alertMatches[alert.id].length ? alertMatches[alert.id].map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm hover:bg-indigo-50">
                          <span className="font-semibold text-slate-800">{job.title}</span>
                          <span className="text-xs text-slate-500">{job.location} · {job.job_type_display || job.job_type}</span>
                        </Link>
                      )) : <p className="text-xs text-slate-500">No current jobs match this alert.</p>}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'resumes' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Resume Version Manager</h3>
                  <p className="mt-1 text-xs text-slate-500">Keep role-specific resumes and choose one for each application.</p>
                </div>
                <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                  Upload resume
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadResumeVersion} className="hidden" />
                </label>
              </div>
              {resumeMessage ? <p role="status" className="text-sm text-slate-600">{resumeMessage}</p> : null}
              {resumeVersions.length ? resumeVersions.map((resume) => (
                <div key={resume.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{resume.name}</h4>
                    <p className="mt-1 text-xs text-slate-500">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {resume.file_url ? <a href={resume.file_url} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">Preview</a> : null}
                    <button onClick={() => handleDeleteResumeVersion(resume.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700">Delete</button>
                  </div>
                </div>
              )) : <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No resume versions yet. Upload one to choose it while applying.</p>}
            </div>
          ) : null}

          {activeTab === 'passport' ? (
            <section id="skill-fit-passport" className="space-y-6 rounded-2xl bg-white p-2 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,_#0f766e,_#0e7490)] p-6 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100">Skilloriya Career Snapshot</p>
                  <h2 className="mt-2 text-2xl font-black">{[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}</h2>
                  <p className="mt-1 text-sm text-teal-50">{user?.headline || 'Candidate'}{user?.location ? ` · ${user.location}` : ''}</p>
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-teal-50">A shareable snapshot of your profile skills, assessment credentials, and how your profile aligns with current openings. Match scores are explainable estimates based on profile data.</p>
                </div>
                <button type="button" onClick={handlePrintPassport} className="print-hidden inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-50">
                  <Printer size={14} /> Print / Save PDF
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900">Your skill profile</h3>
                  <p className="mt-1 text-xs text-slate-500">Skills recruiters can compare with job requirements.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(user?.skills || '').split(/[,|/\n]/).map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                      <span key={skill} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">{skill}</span>
                    ))}
                    {!user?.skills?.trim() ? <p className="text-xs text-slate-500">Add skills to your profile to unlock job match insights.</p> : null}
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div><dt className="text-xs text-slate-500">Experience</dt><dd className="mt-1 text-sm font-bold text-slate-900">{user?.experience_years || 0} years</dd></div>
                    <div><dt className="text-xs text-slate-500">Location</dt><dd className="mt-1 text-sm font-bold text-slate-900">{user?.location || 'Not specified'}</dd></div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900">Verified assessment badges</h3>
                  <p className="mt-1 text-xs text-slate-500">Credentials earned by completing Skilloriya assessments.</p>
                  {badges.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {badges.map((badge) => <span key={badge.id} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">{badge.badge_title || badge.assessment_title} · {badge.score_percentage}%</span>)}
                    </div>
                  ) : <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No badges yet. Complete an assessment to add a verified credential.</p>}
                  <Link to="/assessments" className="print-hidden mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Browse assessments</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900">Best current job fits</h3>
                <p className="mt-1 text-xs text-slate-500">Each score includes the profile factors used to calculate it.</p>
                {aiJobs.slice(0, 3).length ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {aiJobs.slice(0, 3).map((job) => (
                      <article key={job.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                          <span className="shrink-0 rounded-full bg-teal-100 px-2 py-1 text-xs font-black text-teal-800">{job.ai_match?.match_score ?? 0}%</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{job.employer_name} · {job.location}</p>
                        <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-emerald-700">Matches: {(job.ai_match?.matched_skills || []).join(', ') || 'No direct skill overlap'}</p>
                        {job.ai_match?.missing_skills?.length ? <p className="mt-2 text-[11px] text-slate-600">Build next: {job.ai_match.missing_skills.slice(0, 4).join(', ')}</p> : null}
                        {job.ai_match?.score_breakdown ? (
                          <div className="mt-3 space-y-1 border-t border-slate-200 pt-2">
                            {Object.entries(job.ai_match.score_breakdown).filter(([factor]) => factor !== 'minimum score adjustment').map(([factor, points]) => (
                              <p key={factor} className="flex justify-between gap-2 text-[10px] capitalize text-slate-500"><span>{factor}</span><span className="font-bold text-slate-700">{points.score}/{points.out_of}</span></p>
                            ))}
                          </div>
                        ) : null}
                        <Link to={`/jobs/${job.id}`} className="print-hidden mt-3 inline-block text-xs font-bold text-blue-700">View role</Link>
                      </article>
                    ))}
                  </div>
                ) : <p className="mt-4 text-xs text-slate-500">No active openings are available for matching right now.</p>}
              </div>
              <p className="text-[10px] text-slate-400">Generated from your Skilloriya profile and assessment results. Keep your profile current for more relevant matches.</p>
            </section>
          ) : null}

          {activeTab === 'saved' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Saved Jobs Wishlist</h3>
              {savedJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bookmark size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No saved jobs in wishlist</p>
                  <p className="text-xs text-slate-500 mt-1">Bookmark roles from job cards to view them later.</p>
                </div>
              ) : (
                savedJobs.map((item) => {
                  const job = item.job_detail || {}
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-amber-300"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{job.title || 'Job Opening'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {job.location} • {job.job_type} • ₹{Number(job.salary || 0).toLocaleString('en-IN')} / year
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${job.id || item.job}`}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
                        >
                          Apply Now
                        </Link>
                        <button
                          onClick={() => handleRemoveSaved(job.id || item.job)}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                          title="Remove from saved"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : null}

          {/* 3. AI Recommended Tab */}
          {activeTab === 'ai_recommended' ? (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recommended Jobs</h3>
                  <p className="text-xs text-slate-500">Roles ranked by profile skills, experience, and location overlap.</p>
                  {recommendationSource === 'resume' ? (
                    <p className="mt-1 text-xs font-semibold text-cyan-800">Matched from uploaded resume{recommendationSkills.length ? ` · ${recommendationSkills.join(', ')}` : ''}</p>
                  ) : null}
                </div>
              </div>

              {aiJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Sparkles size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No matching jobs found yet</p>
                  <p className="text-xs text-slate-500 mt-1">Add more skills to your profile to get personalized recommendations.</p>
                </div>
              ) : (
                aiJobs.map((job) => {
                  const match = job.ai_match || {}
                  const isTop = match.is_top_applicant || (match.match_score >= 60)
                  return (
                    <div
                      key={job.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50/40 to-white p-5 transition hover:border-cyan-300 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                          {isTop ? (
                            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900 flex items-center gap-1">
                              <Zap size={10} className="text-amber-600 fill-amber-500" />
                              🏆 Top Applicant ({match.match_score || 85}%)
                            </span>
                          ) : match.match_score ? (
                            <span className="rounded-full bg-cyan-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                              {match.match_score}% Match
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {job.employer_name} • {job.location} • ₹{Number(job.salary || 0).toLocaleString('en-IN')} / year
                        </p>
                        {match.matched_skills && match.matched_skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {match.matched_skills.map((sk, idx) => (
                              <span key={idx} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                                ✓ {sk}
                              </span>
                            ))}
                          </div>
                        )}
                        {match.missing_skills?.length > 0 ? (
                          <p className="mt-2 text-xs text-slate-600">
                            Skills to build: <span className="font-semibold">{match.missing_skills.slice(0, 5).join(', ')}</span>
                          </p>
                        ) : null}
                        {match.score_breakdown ? (
                          <div className="mt-3 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Match score breakdown">
                            {Object.entries(match.score_breakdown).map(([factor, points]) => (
                              <div key={factor} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                                <p className="text-[10px] capitalize text-slate-500">{factor}</p>
                                <p className="text-xs font-bold text-slate-800">{points.score}/{points.out_of}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to="/assessments"
                          className="inline-flex items-center gap-1 rounded-xl bg-cyan-50 border border-cyan-200 px-3 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-sm"
                          title="Play skill test"
                        >
                          <Award size={13} className="text-amber-500" />
                          Play Skill
                        </Link>
                        <Link
                          to={`/apply/${job.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
                        >
                          ⚡ Apply
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : null}

          {/* 4. Interviews Tab */}
          {activeTab === 'interviews' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Scheduled Video Interviews</h3>
              {interviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Video size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No video interviews scheduled</p>
                  <p className="text-xs text-slate-500 mt-1">When recruiters schedule a round, your meeting room will appear here.</p>
                </div>
              ) : (
                interviews.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.job_title || 'Technical Interview'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        With Recruiter: {item.employer_email}
                      </p>
                      <p className="text-xs font-bold text-blue-700 mt-0.5">
                        Scheduled for: {new Date(item.scheduled_at).toLocaleString()}
                      </p>
                      {item.feedback?.is_approved ? (
                        <div className="mt-3 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-xs font-bold text-emerald-800">Interviewer feedback · {item.feedback.rating}/5</p>
                          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">{item.feedback.feedback}</p>
                        </div>
                      ) : null}
                    </div>

                    <Link
                      to={`/interview/${item.room_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 shadow-md"
                    >
                      <Video size={14} />
                      Join Video Room
                    </Link>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {/* 5. Badges Tab */}
          {activeTab === 'badges' ? (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">My Earned Skill Badges</h3>
                  <p className="text-xs text-slate-500">Certificates earned through Skilloria assessments.</p>
                </div>
                <Link
                  to="/assessments"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600"
                >
                  Take More Tests
                </Link>
              </div>

              {badges.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Award size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No skill badges earned yet</p>
                  <Link to="/assessments" className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline">
                    Take an assessment to earn your first badge →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3.5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-md">
                        <Award size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{b.badge_title || b.assessment_title}</h4>
                        <p className="text-xs text-slate-500">Score: {b.score_percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
