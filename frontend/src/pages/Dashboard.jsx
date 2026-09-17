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
  const [interviews, setInterviews] = useState([])
  const [badges, setBadges] = useState([])
  const [activeTab, setActiveTab] = useState('applications') // 'applications' | 'saved' | 'ai_recommended' | 'interviews' | 'badges'
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
      const [userRes, appsRes, savedRes, aiRes, interviewRes, badgesRes] = await Promise.allSettled([
        axios.get('/api/users/profile/', config),
        axios.get('/api/applications/my-applications/', config),
        axios.get('/api/jobs/saved/', config),
        axios.get('/api/ai/recommended-jobs/', config),
        axios.get('/api/applications/interviews/my/', config),
        axios.get('/api/skills/my-badges/', config),
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2.5rem] border border-blue-100 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-8 py-8 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img
              src={resolveMediaUrl(user?.profile_image_url) || 'https://via.placeholder.com/64'}
              alt="Profile"
              className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-md"
            />
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                Candidate Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Welcome back, {user?.first_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-xs text-blue-100">
                Track your active applications, saved jobs, AI matches, and interview schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-800 shadow-md transition hover:bg-blue-50"
            >
              Edit Profile
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
                    Based on your resume and skill set, you rank as a <strong>Top Applicant</strong> for {aiJobs[0]?.title || "high-growth tech roles"}. Play skill tests to earn verified badges and apply directly!
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
            onClick={() => setActiveTab('ai_recommended')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              activeTab === 'ai_recommended'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
            }`}
          >
            <Sparkles size={14} />
            AI Recommended Roles ({aiJobs.length})
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
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{app.job_title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${getApplicationStatusClass(app.status)}`}>
                        {getApplicationStatusLabel(app.status)}
                      </span>
                      <Link
                        to={`/jobs/${app.job}`}
                        className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View Role
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {/* 2. Saved Jobs Tab */}
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
                          {job.location} • {job.job_type} • ₹{Number(job.salary || 0).toLocaleString()}/mo
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
                  <h3 className="text-lg font-bold text-slate-900">AI Job Match Recommendations</h3>
                  <p className="text-xs text-slate-500">Roles ranked by your profile skills & experience overlap.</p>
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
                          {job.employer_name} • {job.location} • ₹{Number(job.salary || 0).toLocaleString()}/mo
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
