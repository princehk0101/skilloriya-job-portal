import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Clock, CheckCircle, XCircle, LogOut, Search, ArrowRight, UserCircle2 } from 'lucide-react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { resolveMediaUrl } from '../utils/media'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return 'bg-cyan-100 text-cyan-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    case 'shortlisted':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const userRes = await axios.get('/api/users/profile/', config)
        const currentUser = userRes.data

        if (currentUser?.is_staff || currentUser?.is_superuser) {
          navigate('/admin-dashboard')
          return
        }

        if (currentUser?.role === 'employer') {
          localStorage.setItem('user_role', 'employer')
          navigate('/employer')
          return
        }

        localStorage.setItem('user_role', currentUser?.role || 'seeker')
        localStorage.setItem('user_profile', JSON.stringify(currentUser))
        setUser(currentUser)

        const appsRes = await axios.get('/api/applications/my-applications/', config)
        const appList = normalizeList(appsRes.data)
        const mapped = appList.map((app) => ({
          id: app.id,
          jobId: app.job,
          title: app.job_title || 'Job',
          appliedAt: app.applied_at,
          status: app.status || 'waitlist',
        }))
        setApplications(mapped)

        setStats([
          {
            label: 'Applied Jobs',
            value: mapped.length,
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Waitlist',
            value: mapped.filter((a) => a.status === 'waitlist').length,
            icon: Clock,
            color: 'text-blue-700',
            bg: 'bg-blue-100',
          },
          {
            label: 'Shortlisted',
            value: mapped.filter((a) => a.status === 'shortlisted').length,
            icon: CheckCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
          },
          {
            label: 'Rejected',
            value: mapped.filter((a) => a.status === 'rejected').length,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-100',
          },
        ])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Unable to load your dashboard right now. Please try again in a moment.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#0ea5e9)] px-6 py-7 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)] md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img
              src={resolveMediaUrl(user?.profile_image_url) || 'https://via.placeholder.com/56'}
              alt="Seeker"
              className="h-14 w-14 rounded-2xl border border-white/20 object-cover"
            />
            <div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome, {user?.first_name || user?.email}
            </h1>
            <p className="mt-1 text-blue-100">Track your applications and update your profile.</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold text-white transition-all hover:bg-white/15"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {error ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-3xl border border-blue-100 bg-white/85 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur"
            >
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon size={22} />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">{stat.label}</h3>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white/88 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur">
              <div className="border-b border-blue-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
                    <p className="mt-1 text-sm text-slate-500">Track the latest updates on every application from one place.</p>
                  </div>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Browse Jobs
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-blue-50">
                {applications.length === 0 ? (
                  <div className="p-8">
                    <div className="rounded-[1.75rem] border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center">
                      <Search className="mx-auto text-blue-600" size={28} />
                      <h3 className="mt-4 text-lg font-bold text-slate-900">No applications yet</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Start browsing available roles and submit your first application.
                      </p>
                      <Link
                        to="/"
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                      >
                        Explore Jobs
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{app.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`${getStatusColor(app.status)} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider`}>
                          {app.status}
                        </span>
                        {app.jobId ? (
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                          >
                            View Job
                            <ArrowRight size={14} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-blue-100 bg-white/88 p-8 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Keep your profile updated to improve recruiter visibility.
              </p>
              <Link
                to="/profile"
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all block text-center"
              >
                Update Profile
              </Link>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#0ea5e9)] p-8 text-white shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <UserCircle2 size={22} />
              </div>
              <h2 className="mt-5 text-xl font-bold">Stay application-ready</h2>
              <p className="mt-3 text-sm leading-7 text-blue-100">
                Keep your resume, skills, and contact details current so you can apply faster whenever a suitable role appears.
              </p>
              <Link
                to="/categories"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Explore Categories
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
