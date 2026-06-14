import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Users,
  Briefcase,
  Building2,
  FileText,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Loader2,
} from 'lucide-react'

const cardConfig = [
  { key: 'total_users', label: 'Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'total_jobs', label: 'Jobs', icon: Briefcase, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { key: 'companies', label: 'Companies', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-100' },
  { key: 'applications', label: 'Applications', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
]

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchAll = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      const [profileRes, dashboardRes, usersRes, jobsRes, companiesRes, applicationsRes] = await Promise.all([
        axios.get('/api/users/profile/', getAuthConfig()),
        axios.get('/api/admin/dashboard/', getAuthConfig()),
        axios.get('/api/admin/users/', getAuthConfig()),
        axios.get('/api/admin/jobs/', getAuthConfig()),
        axios.get('/api/admin/companies/', getAuthConfig()),
        axios.get('/api/admin/applications/', getAuthConfig()),
      ])

      if (!profileRes.data?.is_staff && !profileRes.data?.is_superuser) {
        navigate('/dashboard')
        return
      }

      setProfile(profileRes.data)
      localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
      setStats(dashboardRes.data?.stats || {})
      setUsers(normalizeList(usersRes.data))
      setJobs(normalizeList(jobsRes.data))
      setCompanies(normalizeList(companiesRes.data))
      setApplications(normalizeList(applicationsRes.data))
      setError('')
    } catch (err) {
      console.error('Admin dashboard load failed:', err.response?.data || err.message)
      setError('Unable to load admin dashboard.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [navigate])

  const updateUser = async (userId, payload) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/`, payload, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin user update failed:', err.response?.data || err.message)
      setError('Unable to update user.')
    }
  }

  const updateJob = async (jobId, payload) => {
    try {
      await axios.patch(`/api/admin/jobs/${jobId}/`, payload, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin job update failed:', err.response?.data || err.message)
      setError('Unable to update job.')
    }
  }

  const updateApplication = async (applicationId, status) => {
    try {
      await axios.patch(`/api/admin/applications/${applicationId}/`, { status }, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin application update failed:', err.response?.data || err.message)
      setError('Unable to update application.')
    }
  }

  const deleteCompany = async (companyId) => {
    try {
      await axios.delete(`/api/admin/companies/${companyId}/`, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin company delete failed:', err.response?.data || err.message)
      setError('Unable to delete company.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="display-font mt-5 text-4xl font-bold sm:text-5xl">Platform control panel</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                Manage users, jobs, companies, and applications from one place.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4">
              <p className="text-xs text-blue-100/80">Signed in as</p>
              <p className="mt-2 text-lg font-bold">{profile?.email}</p>
              <button
                onClick={() => fetchAll({ silent: true })}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cardConfig.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.key} className="section-frame rounded-[1.75rem] p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{stats[item.key] || 0}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-10 grid gap-8">
          <div className="section-frame overflow-hidden rounded-[2rem]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-600">{user.role}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {user.is_verified ? 'Verified' : 'Pending'}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                            {user.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateUser(user.id, { is_verified: !user.is_verified })}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          >
                            {user.is_verified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                            className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {user.is_active ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-frame overflow-hidden rounded-[2rem]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Jobs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Employer</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 10).map((job) => (
                    <tr key={job.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">{job.title}</td>
                      <td className="px-6 py-4 text-slate-600">{job.employer_name || job.employer_email}</td>
                      <td className="px-6 py-4 text-slate-600">{job.category_name || 'Uncategorized'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateJob(job.id, { is_active: !job.is_active })}
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {job.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-frame overflow-hidden rounded-[2rem]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Companies</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.slice(0, 10).map((company) => (
                    <tr key={company.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">{company.name}</td>
                      <td className="px-6 py-4 text-slate-600">{company.owner_email}</td>
                      <td className="px-6 py-4 text-slate-600">{company.location}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteCompany(company.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-frame overflow-hidden rounded-[2rem]">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Applications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/80 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Job</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 10).map((application) => (
                    <tr key={application.id} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{application.full_name || application.applicant_name}</p>
                        <p className="text-xs text-slate-500">{application.applicant_email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{application.job_title}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplication(application.id, e.target.value)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="waitlist">Waitlist</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-700" size={20} />
            <div>
              <h2 className="font-bold text-slate-900">How to use this admin dashboard</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review stats at the top, then manage users, jobs, companies, and applications from the tables below.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
