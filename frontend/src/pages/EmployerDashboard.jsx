import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock3,
  LogOut,
  Plus,
  Building2,
  Upload,
  Video,
  MessageSquare,
  Calendar,
  Layers,
  List,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import { getApplicationStatusLabel } from '../utils/applications'
import ChatDrawer from '../components/ChatDrawer'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700'
    case 'offer':
      return 'bg-purple-100 text-purple-700'
    case 'interview':
      return 'bg-cyan-100 text-cyan-700'
    case 'screening':
      return 'bg-indigo-100 text-indigo-700'
    case 'shortlisted':
      return 'bg-blue-100 text-blue-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const KANBAN_STAGES = [
  { key: 'applied', label: 'Applied', color: 'border-slate-300' },
  { key: 'screening', label: 'Screening', color: 'border-indigo-400' },
  { key: 'interview', label: 'Interview', color: 'border-cyan-400' },
  { key: 'offer', label: 'Offer', color: 'border-purple-400' },
  { key: 'accepted', label: 'Hired', color: 'border-emerald-400' },
  { key: 'rejected', label: 'Rejected', color: 'border-rose-400' },
]

const EmployerDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || 'null')
    } catch {
      return null
    }
  })
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({
    total_applications: 0,
    waitlist: 0,
    shortlisted: 0,
    accepted: 0,
  })
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [company, setCompany] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'

  // Chat & Video State
  const [chatPartnerId, setChatPartnerId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Interview Schedule Modal
  const [scheduleApp, setScheduleApp] = useState(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    logo: null,
    logo_url: '',
  })

  const companyLogoPreview = useMemo(() => {
    if (companyForm.logo instanceof File) {
      return URL.createObjectURL(companyForm.logo)
    }
    return resolveMediaUrl(companyForm.logo_url)
  }, [companyForm.logo, companyForm.logo_url])

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const loadEmployerData = async () => {
    try {
      const [profileRes, jobsRes, dashboardRes, companiesRes] = await Promise.all([
        axios.get('/api/users/profile/', getAuthConfig()),
        axios.get('/api/jobs/my-jobs/', getAuthConfig()),
        axios.get('/api/applications/employer/dashboard/', getAuthConfig()),
        axios.get('/api/companies/'),
      ])

      if (profileRes.data?.is_staff || profileRes.data?.is_superuser) {
        navigate('/admin-dashboard')
        return
      }

      if (profileRes.data?.role !== 'employer') {
        navigate('/dashboard')
        return
      }

      localStorage.setItem('user_role', 'employer')
      localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
      setUser(profileRes.data)

      const myJobs = normalizeList(jobsRes.data)
      setJobs(myJobs)

      setStats({
        total_applications: dashboardRes.data?.total_applications || 0,
        waitlist: dashboardRes.data?.waitlist || 0,
        shortlisted: dashboardRes.data?.shortlisted || 0,
        accepted: dashboardRes.data?.accepted || 0,
      })

      const allCompanies = normalizeList(companiesRes.data)
      const myCompany = allCompanies.find((c) => c.owner_email === profileRes.data.email) || null
      setCompany(myCompany)
      if (myCompany) {
        setCompanyForm({
          name: myCompany.name || '',
          description: myCompany.description || '',
          location: myCompany.location || '',
          website: myCompany.website || '',
          logo: null,
          logo_url: myCompany.logo_url || myCompany.logo || '',
        })
      }

      if (myJobs.length > 0 && !selectedJobId) {
        setSelectedJobId(myJobs[0].id)
      }
    } catch (err) {
      console.error('Employer dashboard load failed:', err.response?.data || err.message)
      setError('Unable to load your employer dashboard right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadApplicants = async (jobId) => {
    if (!jobId) {
      setApplicants([])
      return
    }
    try {
      const res = await axios.get(`/api/applications/job/${jobId}/applicants/`, getAuthConfig())
      setApplicants(normalizeList(res.data))
    } catch (err) {
      console.error('Applicants load failed:', err.response?.data || err.message)
      setApplicants([])
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    loadEmployerData()
  }, [navigate])

  useEffect(() => {
    loadApplicants(selectedJobId)
  }, [selectedJobId])

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0] || null
    setCompanyForm((prev) => ({ ...prev, logo: file }))
  }

  const handleSaveCompany = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsSavingCompany(true)

    try {
      const payload = new FormData()
      payload.append('name', companyForm.name)
      payload.append('description', companyForm.description)
      payload.append('location', companyForm.location)
      payload.append('website', companyForm.website || '')
      if (companyForm.logo instanceof File) {
        payload.append('logo', companyForm.logo)
      }

      const requestConfig = {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data',
        },
      }

      let response
      if (company?.id) {
        response = await axios.patch(`/api/companies/${company.id}/update/`, payload, requestConfig)
      } else {
        response = await axios.post('/api/companies/create/', payload, requestConfig)
      }

      const updated = response.data
      setCompany(updated)
      setCompanyForm((prev) => ({
        ...prev,
        logo: null,
        logo_url: updated.logo_url || updated.logo || prev.logo_url,
      }))
      setSuccessMsg('Company profile saved successfully.')
    } catch (err) {
      console.error('Company save failed:', err.response?.data || err.message)
      setError('Unable to save company details.')
    } finally {
      setIsSavingCompany(false)
    }
  }

  const handleStatusUpdate = async (applicationId, status) => {
    setError('')
    setSuccessMsg('')

    try {
      await axios.patch(
        `/api/applications/applications/${applicationId}/status/`,
        { status },
        getAuthConfig()
      )
      setApplicants((prev) => prev.map((app) => (
        app.id === applicationId ? { ...app, status } : app
      )))
      await loadEmployerData()
    } catch (err) {
      console.error('Status update failed:', err.response?.data || err.message)
      setError('Unable to update the application status right now.')
    }
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!scheduleApp || !interviewDate) return

    setIsScheduling(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await axios.post(
        `/api/applications/applications/${scheduleApp.id}/schedule-interview/`,
        {
          scheduled_at: interviewDate,
          notes: interviewNotes,
        },
        getAuthConfig()
      )
      setSuccessMsg(`Video interview scheduled! Room ID: ${res.data.room_id}`)
      setScheduleApp(null)
      setInterviewDate('')
      setInterviewNotes('')
      loadApplicants(selectedJobId)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule video interview.')
    } finally {
      setIsScheduling(false)
    }
  }

  const openChatWithApplicant = (app) => {
    if (app.applicant) {
      setChatPartnerId(app.applicant)
      setIsChatOpen(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2.5rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#0ea5e9)] px-8 py-8 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)] md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img
              src={resolveMediaUrl(user?.profile_image_url) || 'https://via.placeholder.com/56'}
              alt="Employer"
              className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-md"
            />
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                Recruiter Command Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Employer Panel {user?.first_name ? `- ${user.first_name}` : ''}
              </h1>
              <p className="text-xs text-blue-100">
                Post jobs, manage candidate pipeline, video interview, and connect directly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/post-job"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-800 shadow-md transition hover:bg-blue-50"
            >
              <Plus size={15} />
              Post New Job
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
        {successMsg ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-semibold text-emerald-700">
            ✓ {successMsg}
          </div>
        ) : null}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Users size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Total Applicants</p>
            <p className="text-2xl font-black text-slate-900">{stats.total_applications}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Clock3 size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Waitlist / Screening</p>
            <p className="text-2xl font-black text-slate-900">{stats.waitlist}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
              <Briefcase size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Shortlisted</p>
            <p className="text-2xl font-black text-slate-900">{stats.shortlisted}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-xs text-slate-500 font-medium">Hired / Accepted</p>
            <p className="text-2xl font-black text-slate-900">{stats.accepted}</p>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Selector & Company Profile */}
          <div className="lg:col-span-1 space-y-8">
            {/* My Posted Jobs */}
            <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">My Posted Jobs ({jobs.length})</h2>
                <Link to="/post-job" className="text-xs font-bold text-blue-600 hover:underline">
                  + Add Job
                </Link>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-500">No jobs posted yet. Click 'Post New Job' to start.</p>
                ) : (
                  jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                        selectedJobId === job.id
                          ? 'border-blue-600 bg-blue-50/80 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900 truncate">{job.title}</p>
                        {job.is_featured ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-800">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{job.location} • {job.job_type}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Company Profile Form */}
            <form
              onSubmit={handleSaveCompany}
              className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Company Branding</h2>
                  <p className="text-xs text-slate-500">Logo, description, location</p>
                </div>
                {company?.id ? (
                  <Link to={`/companies/${company.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                    Public View
                  </Link>
                ) : null}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                    {companyLogoPreview ? (
                      <img src={companyLogoPreview} alt="Company" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={20} className="text-blue-500" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-blue-700 p-1.5 text-white shadow-md">
                    <Upload size={12} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCompanyLogoChange} />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-800 truncate">{companyForm.name || 'Set company name'}</p>
                  <p className="text-[11px] text-slate-500">Verified employer status</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  name="name"
                  value={companyForm.name}
                  onChange={handleCompanyFormChange}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  required
                />
                <input
                  name="location"
                  value={companyForm.location}
                  onChange={handleCompanyFormChange}
                  placeholder="Location (e.g. Bangalore, India)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  required
                />
                <input
                  name="website"
                  value={companyForm.website}
                  onChange={handleCompanyFormChange}
                  placeholder="Website URL"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
                <textarea
                  name="description"
                  value={companyForm.description}
                  onChange={handleCompanyFormChange}
                  placeholder="Company summary..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {isSavingCompany ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Applicants Pipeline (Kanban or List) */}
          <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-sm">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Candidate Pipeline {selectedJobId ? `(Job #${selectedJobId})` : ''}
                </h2>
                <p className="text-xs text-slate-500">
                  {applicants.length} total applicant(s) for selected position.
                </p>
              </div>

              {/* View Switcher: Kanban vs List */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers size={14} />
                  Kanban Pipeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List size={14} />
                  List View
                </button>
              </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {KANBAN_STAGES.map((stage) => {
                  const stageApps = applicants.filter((a) => {
                    if (stage.key === 'applied') return a.status === 'applied' || a.status === 'waitlist'
                    return a.status === stage.key
                  })

                  return (
                    <div
                      key={stage.key}
                      className={`flex flex-col rounded-2xl border-t-4 bg-slate-50/70 p-3.5 border ${stage.color}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {stage.label}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
                          {stageApps.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
                        {stageApps.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400">
                            No candidates
                          </div>
                        ) : (
                          stageApps.map((app) => (
                            <div
                              key={app.id}
                              className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm space-y-2.5 transition hover:border-blue-300"
                            >
                              <div className="flex items-start gap-2.5">
                                <img
                                  src={resolveMediaUrl(app.applicant_profile_image_url) || 'https://via.placeholder.com/36'}
                                  alt="Candidate"
                                  className="h-9 w-9 rounded-xl object-cover border border-slate-100 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs text-slate-900 truncate">
                                    {app.full_name || app.applicant_name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate">{app.applicant_email}</p>
                                </div>
                              </div>

                              {app.skills ? (
                                <p className="text-[10px] text-slate-600 line-clamp-1">
                                  <strong>Skills:</strong> {app.skills}
                                </p>
                              ) : null}

                              {/* Actions */}
                              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                                {app.resume_url || app.resume ? (
                                  <a
                                    href={resolveMediaUrl(app.resume_url || app.resume)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-blue-600 hover:underline"
                                  >
                                    Resume ↗
                                  </a>
                                ) : <span />}

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setScheduleApp(app)}
                                    className="rounded-lg p-1.5 text-cyan-700 bg-cyan-50 hover:bg-cyan-100"
                                    title="Schedule Video Interview"
                                  >
                                    <Video size={13} />
                                  </button>
                                  <button
                                    onClick={() => openChatWithApplicant(app)}
                                    className="rounded-lg p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                    title="Message Candidate"
                                  >
                                    <MessageSquare size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Stage Mover */}
                              <div className="pt-1">
                                <select
                                  value={app.status}
                                  onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 outline-none"
                                >
                                  <option value="applied">Applied</option>
                                  <option value="screening">Move to Screening</option>
                                  <option value="interview">Move to Interview</option>
                                  <option value="offer">Make Offer</option>
                                  <option value="accepted">Mark as Hired</option>
                                  <option value="rejected">Mark as Rejected</option>
                                </select>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {applicants.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No applicants yet for this job.</p>
                ) : (
                  applicants.map((app) => (
                    <div key={app.id} className="rounded-2xl border border-slate-200 p-4 bg-white space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={resolveMediaUrl(app.applicant_profile_image_url) || 'https://via.placeholder.com/44'}
                            alt="Candidate"
                            className="h-11 w-11 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <p className="font-bold text-sm text-slate-900">{app.full_name || app.applicant_name}</p>
                            <p className="text-xs text-slate-500">{app.applicant_email} • {app.phone_number}</p>
                            {app.skills ? (
                              <p className="text-xs text-slate-600 mt-1">
                                <strong>Skills:</strong> {app.skills}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`${statusBadgeClass(app.status)} px-3 py-1 rounded-full text-xs font-bold`}>
                            {getApplicationStatusLabel(app.status)}
                          </span>
                          <button
                            onClick={() => setScheduleApp(app)}
                            className="inline-flex items-center gap-1 rounded-xl bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100"
                          >
                            <Video size={13} />
                            Interview
                          </button>
                          <button
                            onClick={() => openChatWithApplicant(app)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            <MessageSquare size={13} />
                            Chat
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        {app.resume_url || app.resume ? (
                          <a
                            href={resolveMediaUrl(app.resume_url || app.resume)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline"
                          >
                            View Resume PDF
                          </a>
                        ) : <span />}

                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="accepted">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {scheduleApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-blue-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900">Schedule Video Interview</h3>
              </div>
              <button onClick={() => setScheduleApp(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="mt-4 space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-600 mb-1">Candidate</span>
                <p className="font-bold text-slate-900 text-sm">{scheduleApp.full_name || scheduleApp.applicant_name}</p>
                <p className="text-xs text-slate-500">{scheduleApp.applicant_email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Agenda / Notes</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="e.g. Technical round focusing on React & Django architecture..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isScheduling ? 'Creating Room...' : 'Confirm & Create Room'}
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleApp(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Global In-App Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPartnerId={chatPartnerId}
      />
    </div>
  )
}

export default EmployerDashboard
