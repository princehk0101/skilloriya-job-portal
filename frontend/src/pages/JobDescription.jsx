import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  MapPin,
  Clock,
  IndianRupee,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Building2,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  MessageSquare,
  Zap,
  Check,
  XCircle,
  Share2,
  Award,
} from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import {
  createAppliedJobsMap,
  fetchMyApplications,
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from '../utils/applications'
import ChatDrawer from '../components/ChatDrawer'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const JobDescription = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [relatedJobs, setRelatedJobs] = useState([])
  const [appliedJobsMap, setAppliedJobsMap] = useState({})
  const [isSaved, setIsSaved] = useState(false)
  const [aiMatch, setAiMatch] = useState(null)
  const [loadingAiMatch, setLoadingAiMatch] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null
  }

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        const auth = getAuthConfig()
        const [response, applications] = await Promise.all([
          axios.get(`/api/jobs/${id}/`, auth || {}),
          fetchMyApplications(),
        ])
        const jobData = response.data
        const nextAppliedJobsMap = createAppliedJobsMap(applications)
        setJob(jobData)
        setAppliedJobsMap(nextAppliedJobsMap)
        setIsSaved(Boolean(jobData.is_saved))

        // Fetch AI Match Score if logged in as seeker
        if (auth && localStorage.getItem('user_role') !== 'employer') {
          setLoadingAiMatch(true)
          axios
            .get(`/api/ai/job-match/${id}/`, auth)
            .then((res) => setAiMatch(res.data))
            .catch(() => setAiMatch(null))
            .finally(() => setLoadingAiMatch(false))
        }

        let suggested = []
        if (jobData.category) {
          const categoryRes = await axios.get(`/api/jobs/?category=${jobData.category}`)
          suggested = normalizeList(categoryRes.data)
        }

        if (suggested.length < 5 && jobData.job_type) {
          const typeRes = await axios.get(`/api/jobs/?job_type=${jobData.job_type}`)
          const typeJobs = normalizeList(typeRes.data)
          const merged = [...suggested, ...typeJobs]
          const uniq = []
          const seen = new Set()
          for (const item of merged) {
            if (seen.has(item.id)) continue
            seen.add(item.id)
            uniq.push(item)
          }
          suggested = uniq
        }

        suggested = suggested.filter((item) => Number(item.id) !== Number(jobData.id)).slice(0, 6)
        setRelatedJobs(suggested)
      } catch {
        setError('Failed to load job details.')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleToggleSave = async () => {
    const auth = getAuthConfig()
    if (!auth) {
      navigate('/login')
      return
    }
    try {
      await axios.post(`/api/jobs/${id}/save/`, {}, auth)
      setIsSaved((prev) => !prev)
    } catch (err) {
      console.error('Failed to toggle save:', err)
    }
  }

  const openApplyPage = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    navigate(`/apply/${id}`)
  }

  const viewerRole = localStorage.getItem('user_role')
  const currentApplication = appliedJobsMap[String(id)] || null
  const applyButtonLabel = currentApplication
    ? 'Already Applied'
    : viewerRole === 'employer'
      ? 'Candidate Account Required'
      : 'Apply for Position'

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-24">Loading job details...</div>
  if (error) return <div className="flex min-h-screen items-center justify-center pt-24 text-rose-600 font-bold">{error}</div>
  if (!job) return <div className="flex min-h-screen items-center justify-center pt-24">Job not found</div>

  return (
    <div className="min-h-screen pb-16 pt-24 bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
      <div className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Jobs
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                isSaved
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {isSaved ? 'Saved in Wishlist' : 'Save Job'}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-blue-100 bg-white/95 shadow-[0_20px_55px_rgba(35,85,217,0.1)] backdrop-blur">
          {/* Hero Banner */}
          <div className="bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-4 py-6 sm:px-8 sm:py-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 sm:p-2.5 backdrop-blur shadow-md">
                  <img
                    src={resolveMediaUrl(job.employer_image_url) || 'https://via.placeholder.com/80'}
                    alt={job.employer_name || job.employer_email}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {job.is_featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                        <Zap size={11} />
                        Featured Role
                      </span>
                    ) : null}
                    {job.company_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                        <CheckCircle2 size={12} className="text-emerald-300" />
                        Verified Employer
                      </span>
                    ) : null}
                  </div>

                  <h1 className="display-font mt-2 sm:mt-3 text-2xl font-extrabold leading-tight sm:text-4xl text-white">
                    {job.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-4 text-xs text-blue-100">
                    <span className="inline-flex items-center gap-1.5 font-bold text-white">
                      <Building2 size={15} />
                      {job.employer_name || job.employer_email}
                    </span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {job.location || 'Remote'}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {job.job_type_display || job.job_type}</span>
                    <span className="inline-flex items-center gap-1.5"><IndianRupee size={15} /> {job.salary ? `₹${Number(job.salary).toLocaleString('en-IN')} / year` : 'Pay not listed'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 sm:p-4 backdrop-blur sm:flex-row lg:flex-col">
                <button
                  onClick={openApplyPage}
                  disabled={Boolean(currentApplication) || viewerRole === 'employer'}
                  className={`rounded-2xl px-6 sm:px-8 py-3 text-sm font-bold transition shadow-md ${
                    currentApplication || viewerRole === 'employer'
                      ? 'cursor-not-allowed bg-white/20 text-white'
                      : 'bg-white text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  {applyButtonLabel}
                </button>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 sm:px-6 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <MessageSquare size={14} />
                  Message Recruiter
                </button>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 p-4 sm:p-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-8">
              {/* Application Status Banner if applied */}
              {currentApplication ? (
                <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 px-6 py-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Application Submitted</h2>
                      <p className="mt-1 text-xs text-slate-600">
                        Submitted on {new Date(currentApplication.applied_at).toLocaleDateString()}. Recruiter will review your credentials.
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${getApplicationStatusClass(currentApplication.status)}`}>
                      <BadgeCheck size={15} />
                      {getApplicationStatusLabel(currentApplication.status)}
                    </span>
                  </div>
                </section>
              ) : null}

              {/* Job Description */}
              <section className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-7">
                <h2 className="text-xl font-extrabold text-slate-900">About the Role</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-700">{job.description}</p>
                {job.required_skills?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">{skill}</span>)}
                  </div>
                ) : null}
                {job.practical_challenge ? (
                  <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                    <h3 className="text-sm font-bold text-cyan-950">Optional Proof-of-Skill challenge</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-cyan-900">{job.practical_challenge}</p>
                  </div>
                ) : null}
              </section>

              {/* Suggested Related Jobs */}
              <section className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900">Similar Recommended Roles</h2>
                {relatedJobs.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-500">No similar jobs found at the moment.</p>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relatedJobs.map((item) => (
                      <Link
                        key={item.id}
                        to={`/jobs/${item.id}`}
                        className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/40"
                      >
                        <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.location} • {item.job_type}</p>
                        <p className="mt-2 text-xs font-semibold text-blue-600">₹{Number(item.salary || 0).toLocaleString('en-IN')} / year</p>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* AI Match Score Card */}
              <div className="rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-800 font-extrabold text-sm">
                    <Sparkles size={18} className="text-cyan-600" />
                    <span>AI Skill Matching</span>
                  </div>
                  {aiMatch ? (
                    <span className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                      {aiMatch.match_score}% Match
                    </span>
                  ) : null}
                </div>

                {loadingAiMatch ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-cyan-600" />
                    Calculating skill match against your profile...
                  </div>
                ) : aiMatch ? (
                  <div className="mt-4 space-y-4 text-xs">
                    {(aiMatch.is_top_applicant || aiMatch.match_score >= 65) && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-amber-900 flex items-start gap-2.5 shadow-sm">
                        <Zap size={18} className="text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-xs">🏆 You are a Top Applicant! (Top 5% Match)</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            {aiMatch.top_applicant_reason || "Your resume skills give you a standout advantage for this position."}
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-slate-600">
                      Based on your profile skills and experience, this role is a <strong className="text-cyan-800">{aiMatch.recommendation_level}</strong> for you.
                    </p>

                    {aiMatch.matched_skills?.length > 0 ? (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1.5">Matched Skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiMatch.matched_skills.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                              <Check size={11} strokeWidth={3} /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {aiMatch.missing_skills?.length > 0 ? (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1.5">Skills to Learn:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiMatch.missing_skills.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              • {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="pt-2 border-t border-cyan-100">
                      <Link
                        to="/assessments"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 shadow-sm transition"
                      >
                        <Award size={14} className="text-amber-300" />
                        🎯 Play & Verify Your Skill (Rank #1)
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    Sign in with a candidate profile to view your personalized AI match score and skill insights.
                  </p>
                )}
              </div>

              {/* Job Overview */}
              <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900">Key Highlights</h3>
                <div className="mt-4 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Job Type</span>
                    <span className="font-bold text-slate-800 capitalize">{job.job_type_display || job.job_type}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Monthly Compensation</span>
                    <span className="font-bold text-emerald-700">₹{Number(job.salary || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Experience Needed</span>
                    <span className="font-bold text-slate-800">{job.experience_required} Years</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Industry Category</span>
                    <span className="font-bold text-slate-800">{job.category_name || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Posted Date</span>
                    <span className="font-bold text-slate-800">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct In-App Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialJobId={job.id}
      />
    </div>
  )
}

export default JobDescription
