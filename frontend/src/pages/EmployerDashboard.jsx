import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
  Search,
  Trash2,
  Eye,
  Filter,
  BarChart3,
  Check,
  FileText,
  Star,
  MapPin,
  GraduationCap,
  Mail,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import { getApplicationStatusLabel } from '../utils/applications'
import ChatDrawer from '../components/ChatDrawer'
import SidebarLayout from '../components/SidebarLayout'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'offer':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'interview':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    case 'screening':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'shortlisted':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'rejected':
      return 'bg-rose-100 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const KANBAN_STAGES = [
  { key: 'applied', label: 'Applied', color: 'border-slate-300' },
  { key: 'screening', label: 'Screening', color: 'border-indigo-400' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'border-blue-400' },
  { key: 'interview', label: 'Interview', color: 'border-cyan-400' },
  { key: 'offer', label: 'Offer', color: 'border-purple-400' },
  { key: 'accepted', label: 'Hired', color: 'border-emerald-400' },
  { key: 'rejected', label: 'Rejected', color: 'border-rose-400' },
]

const EmployerDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

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
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    applications_per_job: [],
  })
  const [selectedJobId, setSelectedJobId] = useState('all')
  const [applicants, setApplicants] = useState([])
  const [interviews, setInterviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [scheduledRoom, setScheduledRoom] = useState('')
  const [company, setCompany] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'

  // Talent Search (Resdex) State
  const [talentQuery, setTalentQuery] = useState('')
  const [talentSkill, setTalentSkill] = useState('')
  const [talentList, setTalentList] = useState([])
  const [isLoadingTalent, setIsLoadingTalent] = useState(false)

  // Chat & Video State
  const [chatPartnerId, setChatPartnerId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedChatPartner, setSelectedChatPartner] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInputText, setChatInputText] = useState('')
  const [isSendingMsg, setIsSendingMsg] = useState(false)
  const [isLoadingConvs, setIsLoadingConvs] = useState(false)
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const recruiterChatEndRef = React.useRef(null)

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

  const setTab = (tab) => {
    setSearchParams({ tab })
  }

  const loadEmployerData = async () => {
    setError('')
    try {
      const [profileResult, jobsResult, dashboardResult, companiesResult, interviewsResult] = await Promise.allSettled([
        axios.get('/api/users/profile/', getAuthConfig()),
        axios.get('/api/jobs/my-jobs/', getAuthConfig()),
        axios.get('/api/applications/employer/dashboard/', getAuthConfig()),
        axios.get('/api/companies/', getAuthConfig()),
        axios.get('/api/applications/interviews/my/', getAuthConfig()),
      ])

      let profileData = null
      if (profileResult.status === 'fulfilled' && profileResult.value?.data) {
        profileData = profileResult.value.data
        if (profileData.is_staff || profileData.is_superuser) {
          navigate('/admin-dashboard')
          return
        }
        if (profileData.role !== 'employer') {
          navigate('/dashboard')
          return
        }
        localStorage.setItem('user_role', 'employer')
        localStorage.setItem('user_profile', JSON.stringify(profileData))
        setUser(profileData)
      } else {
        const status = profileResult.reason?.response?.status
        if (status === 401) {
          navigate('/employer-login')
          return
        }
        console.warn('Profile fetch warning in recruiter dashboard:', profileResult.reason?.message)
      }

      if (jobsResult.status === 'fulfilled' && jobsResult.value?.data) {
        setJobs(normalizeList(jobsResult.value.data))
      } else {
        console.warn('Jobs fetch error:', jobsResult.reason?.message)
      }

      if (interviewsResult.status === 'fulfilled' && interviewsResult.value?.data) {
        setInterviews(normalizeList(interviewsResult.value.data))
      } else {
        console.warn('Interviews fetch error:', interviewsResult.reason?.message)
      }

      if (dashboardResult.status === 'fulfilled' && dashboardResult.value?.data) {
        const dData = dashboardResult.value.data
        setStats({
          total_applications: dData?.total_applications || 0,
          waitlist: dData?.waitlist || 0,
          shortlisted: dData?.shortlisted || 0,
          accepted: dData?.accepted || 0,
          applied: dData?.applied || 0,
          screening: dData?.screening || 0,
          interview: dData?.interview || 0,
          offer: dData?.offer || 0,
          rejected: dData?.rejected || 0,
          applications_per_job: dData?.applications_per_job || [],
        })
      } else {
        console.warn('Dashboard stats fetch error:', dashboardResult.reason?.message)
      }

      const effectiveEmail = profileData?.email || user?.email
      if (companiesResult.status === 'fulfilled' && companiesResult.value?.data) {
        const allCompanies = normalizeList(companiesResult.value.data)
        const myCompany = allCompanies.find((c) => c.owner_email === effectiveEmail) || null
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
      } else {
        console.warn('Companies fetch error:', companiesResult.reason?.message)
      }
    } catch (err) {
      console.error('Employer dashboard load unexpected error:', err)
      setError('Unable to load some employer dashboard data right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadApplicants = async (jobId = selectedJobId) => {
    try {
      let url = '/api/applications/employer/applicants/'
      if (jobId && jobId !== 'all') {
        url += `?job_id=${jobId}`
      }
      const res = await axios.get(url, getAuthConfig())
      setApplicants(normalizeList(res.data))
    } catch (err) {
      console.error('Applicants load failed:', err.response?.data || err.message)
      setApplicants([])
    }
  }

  const loadTalentSearch = async (query = talentQuery, skill = talentSkill) => {
    setIsLoadingTalent(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (skill) params.append('skill', skill)
      const res = await axios.get(`/api/applications/employer/talent-search/?${params.toString()}`, getAuthConfig())
      setTalentList(normalizeList(res.data))
    } catch (err) {
      console.error('Talent search failed:', err)
      setTalentList([])
    } finally {
      setIsLoadingTalent(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    loadEmployerData()
    loadApplicants('all')
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'talent' && talentList.length === 0) {
      loadTalentSearch()
    }
  }, [activeTab])

  useEffect(() => {
    loadApplicants(selectedJobId)
  }, [selectedJobId])

  const loadRecruiterConversations = async () => {
    setIsLoadingConvs(true)
    try {
      const res = await axios.get('/api/chat/conversations/', getAuthConfig())
      const convs = res.data || []
      setConversations(convs)
      if (convs.length > 0 && !selectedChatPartner) {
        setSelectedChatPartner(convs[0])
        loadRecruiterMessages(convs[0].partner_id)
      }
    } catch (err) {
      console.error('Failed to load recruiter conversations:', err)
    } finally {
      setIsLoadingConvs(false)
    }
  }

  const loadRecruiterMessages = async (partnerId) => {
    if (!partnerId) return
    setIsLoadingMsgs(true)
    try {
      const res = await axios.get(`/api/chat/messages/${partnerId}/`, getAuthConfig())
      setChatMessages(res.data || [])
    } catch (err) {
      console.error('Failed to load candidate messages:', err)
    } finally {
      setIsLoadingMsgs(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'messages') {
      loadRecruiterConversations()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'messages' && selectedChatPartner?.partner_id) {
      loadRecruiterMessages(selectedChatPartner.partner_id)
      const interval = setInterval(() => {
        loadRecruiterMessages(selectedChatPartner.partner_id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeTab, selectedChatPartner?.partner_id])

  useEffect(() => {
    recruiterChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendRecruiterMessage = async (e) => {
    e?.preventDefault()
    if (!chatInputText.trim() || !selectedChatPartner?.partner_id || isSendingMsg) return
    const text = chatInputText.trim()
    setChatInputText('')
    setIsSendingMsg(true)
    try {
      const res = await axios.post(
        '/api/chat/send/',
        {
          recipient_id: selectedChatPartner.partner_id,
          content: text,
          job_id: selectedChatPartner.job_id || null,
        },
        getAuthConfig()
      )
      setChatMessages((prev) => [...prev, res.data])
      loadRecruiterConversations()
    } catch (err) {
      console.error('Failed to send recruiter message:', err)
    } finally {
      setIsSendingMsg(false)
    }
  }

  const handleStartInstantVideoMeeting = async () => {
    if (!selectedChatPartner?.partner_id || isSendingMsg) return
    const roomId = `meet-${selectedChatPartner.partner_id}-${Date.now().toString().slice(-6)}`
    const meetingMessage = `🎥 Recruiter has initiated a live video interview meeting!\nClick here to join meeting room: /interview/${roomId}`
    setIsSendingMsg(true)
    try {
      const res = await axios.post(
        '/api/chat/send/',
        {
          recipient_id: selectedChatPartner.partner_id,
          content: meetingMessage,
          job_id: selectedChatPartner.job_id || null,
        },
        getAuthConfig()
      )
      setChatMessages((prev) => [...prev, res.data])
      loadRecruiterConversations()
      window.open(`/interview/${roomId}`, '_blank')
    } catch (err) {
      console.error('Failed to start instant meeting:', err)
    } finally {
      setIsSendingMsg(false)
    }
  }

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCompanyForm((prev) => ({ ...prev, logo: file }))
    }
  }

  const handleCompanySave = async (e) => {
    e.preventDefault()
    setIsSavingCompany(true)
    setError('')
    setSuccessMsg('')

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
      setSuccessMsg('Company profile and branding saved successfully!')
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
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      )
      await loadEmployerData()
    } catch (err) {
      console.error('Status update failed:', err.response?.data || err.message)
      setError('Unable to update the application status.')
    }
  }

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to close and archive the job "${title}"?`)) {
      return
    }
    try {
      await axios.delete(`/api/jobs/${jobId}/delete/`, getAuthConfig())
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      setSuccessMsg(`Job "${title}" has been archived.`)
    } catch (err) {
      console.error('Failed to delete job:', err)
      setError('Could not remove this job listing.')
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
      setScheduledRoom(res.data.room_id)
      setScheduleApp(null)
      setInterviewDate('')
      setInterviewNotes('')
      loadApplicants(selectedJobId)
      loadEmployerData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule video interview.')
    } finally {
      setIsScheduling(false)
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
    <SidebarLayout title="Skilloria Recruiter Hub" role="employer" profile={user}>
      <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Top Banner */}
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2.5rem] border border-blue-100 bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 px-8 py-8 text-white shadow-xl md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={resolveMediaUrl(companyForm.logo_url) || resolveMediaUrl(user?.profile_image_url) || 'https://via.placeholder.com/64'}
                  alt="Company Logo"
                  className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover shadow-md bg-white p-1"
                />
                {company?.is_verified && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white shadow">
                    <ShieldCheck size={12} />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-500/30 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                    Naukri RMS Recruiter Suite
                  </span>
                  {user?.is_approved_by_admin ? (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      ✓ Approved Recruiter
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      Pending Admin Verification
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {company?.name || user?.company_name || 'Recruiter Command Hub'}
                </h1>
                <p className="text-xs text-blue-100 max-w-xl mt-0.5">
                  Manage active listings, search candidate talent, track ATS stages, and conduct live video interviews.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-900 shadow-md transition hover:bg-blue-50"
              >
                <Plus size={16} />
                Post New Job
              </Link>
              <button
                onClick={() => setTab('talent')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <Search size={15} />
                Search Resumes
              </button>
            </div>
          </div>

          {/* Toast Alerts */}
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-semibold text-emerald-700 flex items-center justify-between">
              <span>✓ {successMsg}</span>
              {scheduledRoom && (
                <Link to={`/interview/${scheduledRoom}`} className="underline font-bold text-emerald-800">
                  Join Room Now ↗
                </Link>
              )}
            </div>
          )}

          {/* Quick Tab Header Switcher */}
          <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-slate-200/80 pb-2">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
              { id: 'jobs', label: `My Jobs (${jobs.length})`, icon: Briefcase },
              { id: 'pipeline', label: `Candidate Pipeline (${applicants.length})`, icon: Users },
              { id: 'messages', label: `Candidate Messages (${conversations.length})`, icon: MessageSquare },
              { id: 'talent', label: 'Search Talent (Resdex)', icon: Search },
              { id: 'interviews', label: `Video Interviews (${interviews.length})`, icon: Video },
              { id: 'company', label: 'Company Profile', icon: Building2 },
              { id: 'analytics', label: 'Hiring Funnel', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <Users size={18} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Total Applicants</p>
                  <p className="text-2xl font-black text-slate-900">{stats.total_applications}</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <Clock3 size={18} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Screening / Review</p>
                  <p className="text-2xl font-black text-slate-900">{stats.screening + stats.waitlist}</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3">
                    <Briefcase size={18} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Shortlisted for Rounds</p>
                  <p className="text-2xl font-black text-slate-900">{stats.shortlisted}</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Offers & Hired</p>
                  <p className="text-2xl font-black text-slate-900">{stats.accepted + stats.offer}</p>
                </div>
              </div>

              {/* Quick Actions & Recent Jobs Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Jobs snapshot */}
                <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Active Job Postings</h2>
                      <p className="text-xs text-slate-500">Live roles published on Skilloria portal</p>
                    </div>
                    <Link to="/post-job" className="text-xs font-bold text-blue-600 hover:underline">
                      + Post Job
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {jobs.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-500">No jobs posted yet. Click 'Post New Job' to publish your first role!</p>
                    ) : (
                      jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">{job.title}</span>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {job.location} · ₹{Number(job.salary).toLocaleString('en-IN')} · {job.job_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              to={`/job/${job.id}`}
                              target="_blank"
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                            >
                              <Eye size={12} />
                              View on Portal
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedJobId(job.id)
                                setTab('pipeline')
                              }}
                              className="rounded-xl bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                            >
                              View ATS
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Scheduled Interviews snapshot */}
                <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                      {interviews.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {interviews.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500">No scheduled video rounds right now.</p>
                    ) : (
                      interviews.slice(0, 4).map((interview) => (
                        <div key={interview.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {interview.candidate_name || interview.candidate_email}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{interview.job_title}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              {new Date(interview.scheduled_at).toLocaleDateString()}
                            </span>
                            <Link
                              to={`/interview/${interview.room_id}`}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
                            >
                              Join Call 🎥
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY JOBS */}
          {activeTab === 'jobs' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All Job Postings ({jobs.length})</h2>
                  <p className="text-xs text-slate-500">Manage all job listings posted by your organization</p>
                </div>
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Post New Job
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                  <p className="text-sm font-bold text-slate-700">No jobs posted yet</p>
                  <p className="text-xs text-slate-500 mt-1">Create your first job listing to start receiving candidate applications.</p>
                  <Link to="/post-job" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                    Post Job Now
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Role Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Type & Location</th>
                        <th className="py-3 px-4">Salary</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {job.title}
                            <p className="text-[10px] font-normal text-slate-400">ID: #{job.id} · Posted {new Date(job.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 px-4">{job.category_name || 'General'}</td>
                          <td className="py-4 px-4">{job.job_type} · {job.location}</td>
                          <td className="py-4 px-4 font-bold">₹{Number(job.salary).toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4">
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                              Active & Live
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <Link
                              to={`/job/${job.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
                              title="Verify listing live on student portal"
                            >
                              <ExternalLink size={12} />
                              View on Portal
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedJobId(job.id)
                                setTab('pipeline')
                              }}
                              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                            >
                              Applicants
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                              title="Archive Job"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CANDIDATE PIPELINE (ATS) */}
          {activeTab === 'pipeline' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              {/* Header with Job filter & View switcher */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Candidate ATS Pipeline ({applicants.length} Total)
                  </h2>
                  <p className="text-xs text-slate-500">Track candidates across stages, review tests, schedule video rounds</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Job Filter */}
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="all">All Jobs ({jobs.length})</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>

                  {/* Kanban vs List Switcher */}
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers size={14} />
                      Kanban
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List size={14} />
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto">
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

                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[30rem]">
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
                                    <span className="text-[10px] text-blue-600 font-semibold">{app.job_title}</span>
                                  </div>
                                </div>

                                {app.skills && (
                                  <p className="text-[10px] text-slate-600 line-clamp-1">
                                    <strong>Skills:</strong> {app.skills}
                                  </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-slate-100">
                                  {app.resume_url || app.resume ? (
                                    <a
                                      href={resolveMediaUrl(app.resume_url || app.resume)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <FileText size={12} /> Resume
                                    </a>
                                  ) : <span />}

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setScheduleApp(app)}
                                      className="rounded-lg p-1.5 text-cyan-700 bg-cyan-50 hover:bg-cyan-100"
                                      title="Schedule Video Call"
                                    >
                                      <Video size={13} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setChatPartnerId(app.applicant)
                                        setIsChatOpen(true)
                                      }}
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
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
                                  >
                                    <option value="applied">Stage: Applied</option>
                                    <option value="screening">Stage: Screening</option>
                                    <option value="shortlisted">Stage: Shortlisted</option>
                                    <option value="interview">Stage: Interview</option>
                                    <option value="offer">Stage: Offer</option>
                                    <option value="accepted">Stage: Hired</option>
                                    <option value="rejected">Stage: Rejected</option>
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
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Applied Job</th>
                        <th className="py-3 px-4">Skills & Education</th>
                        <th className="py-3 px-4">Applied Date</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {applicants.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{app.full_name || app.applicant_name}</div>
                            <div className="text-[11px] text-slate-400">{app.applicant_email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-blue-700">{app.job_title}</td>
                          <td className="py-3.5 px-4">
                            <p className="line-clamp-1">{app.skills || 'Not specified'}</p>
                            <p className="text-[10px] text-slate-400">{app.college_name || 'Graduated'}</p>
                          </td>
                          <td className="py-3.5 px-4">{new Date(app.applied_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-bold outline-none ${statusBadgeClass(app.status)}`}
                            >
                              <option value="applied">Applied</option>
                              <option value="screening">Screening</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview">Interview</option>
                              <option value="offer">Offer</option>
                              <option value="accepted">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {app.resume_url || app.resume ? (
                              <a
                                href={resolveMediaUrl(app.resume_url || app.resume)}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 inline-block"
                              >
                                Resume
                              </a>
                            ) : null}
                            <button
                              onClick={() => setScheduleApp(app)}
                              className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 hover:bg-cyan-100"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => {
                                setChatPartnerId(app.applicant)
                                setIsChatOpen(true)
                              }}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                            >
                              Chat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* TAB 3.5: CANDIDATE MESSAGES & VIDEO INTERVIEW STUDIO */}
          {activeTab === 'messages' && (
            <div className="rounded-3xl border border-blue-100 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row h-[750px]">
              {/* Left Column: Candidate Conversations List */}
              <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/40">
                <div className="p-4 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Candidate Conversations</h3>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      {conversations.length} Active
                    </span>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      placeholder="Search candidates or jobs..."
                      className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {isLoadingConvs ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">No candidate messages yet</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        When candidates apply to your jobs, you can message them directly from here.
                      </p>
                    </div>
                  ) : (
                    conversations
                      .filter(
                        (c) =>
                          c.partner_name?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                          c.job_title?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                          c.partner_email?.toLowerCase().includes(chatSearch.toLowerCase())
                      )
                      .map((conv) => {
                        const active = selectedChatPartner?.partner_id === conv.partner_id
                        return (
                          <button
                            key={conv.partner_id}
                            onClick={() => {
                              setSelectedChatPartner(conv)
                              loadRecruiterMessages(conv.partner_id)
                            }}
                            className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                              active
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'hover:bg-blue-50/70 text-slate-800'
                            }`}
                          >
                            <div
                              className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
                                active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {conv.partner_name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`truncate text-xs font-bold ${active ? 'text-white' : 'text-slate-900'}`}>
                                  {conv.partner_name}
                                </p>
                                {conv.unread_count > 0 && (
                                  <span
                                    className={`h-4 min-w-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                                      active ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                                    }`}
                                  >
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                              {conv.job_title ? (
                                <p
                                  className={`truncate text-[11px] font-medium mt-0.5 ${
                                    active ? 'text-blue-100' : 'text-indigo-600'
                                  }`}
                                >
                                  Re: {conv.job_title}
                                </p>
                              ) : null}
                              <p
                                className={`truncate text-[10px] mt-0.5 ${
                                  active ? 'text-blue-200' : 'text-slate-400'
                                }`}
                              >
                                {conv.last_message || 'Ready to communicate'}
                              </p>
                            </div>
                          </button>
                        )
                      })
                  )}
                </div>
              </div>

              {/* Right Column: Active Conversation Feed & Video Meeting Launcher */}
              <div className="flex-1 flex flex-col bg-white">
                {selectedChatPartner ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                          {selectedChatPartner.partner_name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">
                              {selectedChatPartner.partner_name}
                            </h3>
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Candidate
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {selectedChatPartner.job_title ? (
                              <span>Applied for: <strong>{selectedChatPartner.job_title}</strong> · </span>
                            ) : null}
                            <span>{selectedChatPartner.partner_email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Header Actions: Video Meeting + Interview Modal */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleStartInstantVideoMeeting}
                          disabled={isSendingMsg}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                          title="Generate instant room and invite candidate"
                        >
                          <Video size={14} />
                          <span>Start Video Meeting</span>
                        </button>

                        <button
                          onClick={() => {
                            const matchingApp = applicants.find(
                              (a) => a.applicant === selectedChatPartner.partner_id
                            )
                            setScheduleApp(matchingApp || {
                              id: null,
                              applicant: selectedChatPartner.partner_id,
                              job_title: selectedChatPartner.job_title || 'Direct Candidate',
                              applicant_name: selectedChatPartner.partner_name,
                            })
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Calendar size={14} />
                          <span>Schedule Round</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/60">
                      {isLoadingMsgs ? (
                        <div className="flex h-40 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : chatMessages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
                          <MessageSquare size={36} className="mb-2 text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">
                            Start conversation with {selectedChatPartner.partner_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Send candidate interview details, ask technical questions, or launch a live video meeting right now.
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isMe = msg.sender === user?.id || msg.sender_email === user?.email
                          const isMeeting = msg.content?.includes('/interview/')
                          let meetingPath = null
                          if (isMeeting) {
                            const match = msg.content.match(/\/interview\/[a-zA-Z0-9_\-]+/)
                            if (match) meetingPath = match[0]
                          }

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                                  isMe
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-900 border border-slate-200'
                                }`}
                              >
                                {msg.job_title && (
                                  <div className="mb-1 text-[10px] font-semibold opacity-85">
                                    Re: {msg.job_title}
                                  </div>
                                )}
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {meetingPath && (
                                  <div className="mt-3 pt-2 border-t border-white/20">
                                    <Link
                                      to={meetingPath}
                                      target="_blank"
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow"
                                    >
                                      <Video size={13} />
                                      <span>Join Video Meeting Now ↗</span>
                                    </Link>
                                  </div>
                                )}
                              </div>
                              <span className="mt-1 text-[10px] text-slate-400 px-1">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )
                        })
                      )}
                      <div ref={recruiterChatEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form
                      onSubmit={handleSendRecruiterMessage}
                      className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        placeholder={`Type a message to ${selectedChatPartner.partner_name}...`}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!chatInputText.trim() || isSendingMsg}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
                    <MessageSquare size={48} className="mb-3 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">Select a Candidate Conversation</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Choose an applicant from the left panel to review message threads, send updates, or launch instant live video interviews.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TALENT SEARCH (RESDEX) */}
          {activeTab === 'talent' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
                    Skilloria Resdex
                  </span>
                  <span className="text-xs text-slate-400">Verified Candidate Database</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Search & Contact Qualified Candidates</h2>
                <p className="text-xs text-slate-500">
                  Directly search registered students and job seekers by skills, experience, and location.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={talentQuery}
                    onChange={(e) => setTalentQuery(e.target.value)}
                    placeholder="Search candidate by skill (e.g. React, Python, Django, SQL) or name..."
                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => loadTalentSearch(talentQuery, talentSkill)}
                  className="rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 shrink-0"
                >
                  Search Candidates
                </button>
              </div>

              {/* Quick Skill Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400">Quick Filters:</span>
                {['Python', 'React', 'Django', 'SQL', 'GenAI', 'Java', 'DevOps'].map((sk) => (
                  <button
                    key={sk}
                    onClick={() => {
                      const nextSkill = talentSkill === sk ? '' : sk
                      setTalentSkill(nextSkill)
                      loadTalentSearch(talentQuery, nextSkill)
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      talentSkill === sk
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>

              {/* Candidates Grid */}
              {isLoadingTalent ? (
                <div className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-xs text-slate-500">Scanning talent database...</p>
                </div>
              ) : talentList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-xs text-slate-500">
                  No candidates match your current search query. Try broadening your keywords.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {talentList.map((cand) => (
                    <div
                      key={cand.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-blue-300 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                          {cand.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{cand.name}</h3>
                          <p className="text-xs text-slate-500 truncate">{cand.headline}</p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><MapPin size={11} /> {cand.location}</span>
                            <span>·</span>
                            <span>{cand.experience_years}y exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {cand.resume_url ? (
                          <a
                            href={cand.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText size={13} /> View Resume ↗
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No Resume uploaded</span>
                        )}

                        <button
                          onClick={() => {
                            setChatPartnerId(cand.id)
                            setIsChatOpen(true)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          <MessageSquare size={13} />
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VIDEO INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Live Video Interview Studio</h2>
                <p className="text-xs text-slate-500">Conduct remote candidate interviews with live WebRTC video, chat & scorecard.</p>
              </div>

              {interviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-xs text-slate-500">
                  No video interviews scheduled. You can schedule one directly from the Candidate Pipeline tab.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {interviews.map((iv) => (
                    <div key={iv.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-cyan-100 text-cyan-800 px-2.5 py-0.5 text-[10px] font-bold">
                            Live Room
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                            {iv.candidate_name || iv.candidate_email}
                          </h3>
                          <p className="text-xs text-slate-500">{iv.job_title}</p>
                        </div>
                        <Link
                          to={`/interview/${iv.room_id}`}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 flex items-center gap-1.5"
                        >
                          <Video size={14} /> Join Video Call
                        </Link>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Scheduled for: <strong className="text-slate-700">{new Date(iv.scheduled_at).toLocaleString()}</strong>
                      </div>
                      {iv.notes && (
                        <p className="rounded-xl bg-white p-2.5 text-xs text-slate-600 border border-slate-200">
                          <strong>Agenda:</strong> {iv.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: COMPANY PROFILE */}
          {activeTab === 'company' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Company Profile & Employer Branding</h2>
                <p className="text-xs text-slate-500">Customize how your company brand and logo appears on job posts</p>
              </div>

              <form onSubmit={handleCompanySave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo Upload Column */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Company Logo</label>
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    {companyLogoPreview ? (
                      <img src={companyLogoPreview} alt="Logo preview" className="h-24 w-24 rounded-2xl object-contain bg-white p-2 border shadow-sm mb-3" />
                    ) : (
                      <Building2 size={36} className="text-slate-400 mb-3" />
                    )}
                    <label className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition">
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleCompanyLogoChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2">PNG, JPG or SVG up to 5MB</p>
                  </div>
                </div>

                {/* Form Fields Column */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      name="name"
                      value={companyForm.name}
                      onChange={handleCompanyFormChange}
                      placeholder="e.g. Acme Technologies India Pvt Ltd"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters / Location</label>
                      <input
                        name="location"
                        value={companyForm.location}
                        onChange={handleCompanyFormChange}
                        placeholder="e.g. Bengaluru, Karnataka, India"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
                      <input
                        name="website"
                        value={companyForm.website}
                        onChange={handleCompanyFormChange}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">About Company / Overview</label>
                    <textarea
                      name="description"
                      value={companyForm.description}
                      onChange={handleCompanyFormChange}
                      placeholder="Describe your company culture, products, and mission..."
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingCompany}
                    className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSavingCompany ? 'Saving...' : 'Save Company Details'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: HIRING ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Hiring Pipeline Analytics & Conversion Funnel</h2>
                <p className="text-xs text-slate-500">Track candidate progression from initial application to final offer</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pipeline Funnel */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Funnel Conversion Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      ['Applied', stats.applied, 'bg-slate-400'],
                      ['Screening', stats.screening, 'bg-indigo-500'],
                      ['Waitlist', stats.waitlist, 'bg-amber-500'],
                      ['Shortlisted', stats.shortlisted, 'bg-blue-500'],
                      ['Interview', stats.interview, 'bg-cyan-500'],
                      ['Offer', stats.offer, 'bg-purple-500'],
                      ['Hired / Accepted', stats.accepted, 'bg-emerald-500'],
                      ['Rejected', stats.rejected, 'bg-rose-500'],
                    ].map(([label, count, color]) => (
                      <div key={label} className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3">
                        <span className="text-xs font-semibold text-slate-600">{label}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{
                              width: `${stats.total_applications ? Math.max(3, (count / stats.total_applications) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-right text-xs font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Volume */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Applications Volume by Role</h3>
                  <div className="space-y-3">
                    {stats.applications_per_job.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">Post jobs and start receiving applications to view role metrics.</p>
                    ) : (
                      stats.applications_per_job.map((item) => (
                        <div key={item.job_id} className="grid grid-cols-[minmax(0,1.2fr)_2fr_2.5rem] items-center gap-3">
                          <span className="truncate text-xs font-medium text-slate-700" title={item.job__title}>
                            {item.job__title}
                          </span>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${Math.max(4, (item.total_applications / Math.max(...stats.applications_per_job.map((j) => j.total_applications), 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-right text-xs font-bold text-slate-900">{item.total_applications}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Interview Scheduler Modal */}
      {scheduleApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-cyan-600" />
                <h3 className="font-bold text-slate-900">Schedule Video Interview</h3>
              </div>
              <button onClick={() => setScheduleApp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3">
              <div className="rounded-2xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100">
                <p className="font-bold">{scheduleApp.full_name || scheduleApp.applicant_name}</p>
                <p className="text-slate-500 text-[11px]">{scheduleApp.applicant_email} · {scheduleApp.job_title}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agenda / Instructions</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="e.g. Round 1 Technical Architecture & Coding Discussion..."
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
                  {isScheduling ? 'Generating Room...' : 'Confirm & Generate Room'}
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
      )}

      {/* Global In-App Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPartnerId={chatPartnerId}
      />
    </SidebarLayout>
  )
}

export default EmployerDashboard
