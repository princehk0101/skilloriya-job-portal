import React, { useEffect, useMemo, useState } from 'react'
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
  Search,
  Filter,
  X,
  Plus,
  Eye,
  ExternalLink,
  FileCheck,
} from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Modals for Admin Additions
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false)
  const [showAddJobModal, setShowAddJobModal] = useState(false)
  const [showAppModal, setShowAppModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const [companyForm, setCompanyForm] = useState({
    name: '',
    owner_email: '',
    location: '',
    website: '',
    description: '',
    is_verified: true,
    is_featured: false,
  })

  const [jobForm, setJobForm] = useState({
    title: '',
    company_id: '',
    location: 'Remote',
    salary: 1500000,
    job_type: 'remote',
    experience_required: 0,
    description: '',
    is_featured: false,
    is_active: true,
  })

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

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job listing (e.g. fake/scam job)?')) {
      return
    }
    try {
      await axios.delete(`/api/admin/jobs/${jobId}/delete/`, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin job delete failed:', err.response?.data || err.message)
      setError('Unable to delete job.')
    }
  }

  const updateCompany = async (companyId, payload) => {
    try {
      await axios.patch(`/api/admin/companies/${companyId}/`, payload, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin company update failed:', err.response?.data || err.message)
      setError('Unable to update company.')
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
    if (!window.confirm('Are you sure you want to remove this company?')) {
      return
    }
    try {
      await axios.delete(`/api/admin/companies/${companyId}/delete/`, getAuthConfig())
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Admin company delete failed:', err.response?.data || err.message)
      setError('Unable to delete company.')
    }
  }

  const handleCreateCompany = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalSubmitting(true)
    try {
      await axios.post('/api/admin/companies/create/', companyForm, getAuthConfig())
      setShowAddCompanyModal(false)
      setCompanyForm({
        name: '',
        owner_email: '',
        location: '',
        website: '',
        description: '',
        is_verified: true,
        is_featured: false,
      })
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Create company failed:', err.response?.data || err.message)
      setModalError(err.response?.data?.error || 'Failed to create company. Please check all fields.')
    } finally {
      setModalSubmitting(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalSubmitting(true)
    try {
      await axios.post('/api/admin/jobs/create/', jobForm, getAuthConfig())
      setShowAddJobModal(false)
      setJobForm({
        title: '',
        company_id: '',
        location: 'Remote',
        salary: 1500000,
        job_type: 'remote',
        experience_required: 0,
        description: '',
        is_featured: false,
        is_active: true,
      })
      await fetchAll({ silent: true })
    } catch (err) {
      console.error('Create job failed:', err.response?.data || err.message)
      setModalError(err.response?.data?.error || 'Failed to post job. Please check all fields.')
    } finally {
      setModalSubmitting(false)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const q = searchTerm.toLowerCase()
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.company_name?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.phone_number?.toLowerCase().includes(q)
    )
  }, [users, searchTerm])

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs
    const q = searchTerm.toLowerCase()
    return jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.employer_name?.toLowerCase().includes(q) ||
        j.employer_email?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.category_name?.toLowerCase().includes(q) ||
        j.job_type?.toLowerCase().includes(q)
    )
  }, [jobs, searchTerm])

  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies
    const q = searchTerm.toLowerCase()
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.owner_email?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    )
  }, [companies, searchTerm])

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) return applications
    const q = searchTerm.toLowerCase()
    return applications.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.applicant_name?.toLowerCase().includes(q) ||
        a.applicant_email?.toLowerCase().includes(q) ||
        a.job_title?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q) ||
        a.college_name?.toLowerCase().includes(q) ||
        a.skills?.toLowerCase().includes(q)
    )
  }, [applications, searchTerm])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  const showUsers = activeTab === 'all' || activeTab === 'users'
  const showJobs = activeTab === 'all' || activeTab === 'jobs'
  const showCompanies = activeTab === 'all' || activeTab === 'companies'
  const showApplications = activeTab === 'all' || activeTab === 'applications'

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8 bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="display-font mt-5 text-4xl font-bold sm:text-5xl">Platform Control Panel</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
                Manage users, jobs, companies, and applications from one place with instant real-time search.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4">
              <p className="text-xs text-blue-100/80">Signed in as Admin</p>
              <p className="mt-2 text-lg font-bold">{profile?.email}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddCompanyModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 shadow-sm"
                >
                  <Plus size={14} />
                  Add Company
                </button>
                <button
                  onClick={() => setShowAddJobModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-cyan-600 shadow-sm"
                >
                  <Plus size={14} />
                  Post Job
                </button>
                <button
                  onClick={() => fetchAll({ silent: true })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 shadow-sm"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
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
              <div key={item.key} className="section-frame rounded-[1.75rem] p-5 bg-white/90 border border-blue-100 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{stats[item.key] || 0}</p>
              </div>
            )
          })}
        </section>

        {/* Live Search & Filter Bar */}
        <section className="mt-8 rounded-[2rem] border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across users, jobs, companies, skills, emails, locations..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Users ({filteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'jobs'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                Jobs ({filteredJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'companies'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Companies ({filteredCompanies.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'applications'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Applications ({filteredApplications.length})
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8">
          {showUsers ? (
            <div className="section-frame overflow-hidden rounded-[2rem] border border-blue-100 bg-white/95 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Users size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Users ({filteredUsers.length})</h2>
                </div>
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
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          No users matched your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t border-slate-100">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                            {user.phone_number ? (
                              <p className="text-xs text-slate-400">{user.phone_number}</p>
                            ) : null}
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
                                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition"
                              >
                                {user.is_verified ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                              >
                                {user.is_active ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {showJobs ? (
            <div className="section-frame overflow-hidden rounded-[2rem] border border-blue-100 bg-white/95 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                    <Briefcase size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Jobs Moderation ({filteredJobs.length})</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Employer</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No jobs matched your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="border-t border-slate-100">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{job.title}</p>
                            <p className="text-xs text-slate-500">{job.location} • {job.job_type}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{job.employer_name || job.employer_email}</td>
                          <td className="px-6 py-4 text-slate-600">{job.category_name || 'Uncategorized'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${job.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                {job.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {job.is_featured ? (
                                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                                  ★ Featured
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => updateJob(job.id, { is_active: !job.is_active })}
                                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition"
                              >
                                {job.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => updateJob(job.id, { is_featured: !job.is_featured })}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                  job.is_featured
                                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {job.is_featured ? 'Unboost' : 'Boost / Feature'}
                              </button>
                              <button
                                onClick={() => deleteJob(job.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition"
                                title="Remove Fake / Scam Job"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {showCompanies ? (
            <div className="section-frame overflow-hidden rounded-[2rem] border border-blue-100 bg-white/95 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Building2 size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Companies & Verification ({filteredCompanies.length})</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Owner</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No companies matched your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((company) => (
                        <tr key={company.id} className="border-t border-slate-100">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{company.name}</p>
                            {company.website ? (
                              <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                {company.website}
                              </a>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{company.owner_email}</td>
                          <td className="px-6 py-4 text-slate-600">{company.location}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${company.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                {company.is_verified ? '✓ Verified' : 'Unverified'}
                              </span>
                              {company.is_featured ? (
                                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                                  ★ Featured
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => updateCompany(company.id, { is_verified: !company.is_verified })}
                                className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition"
                              >
                                {company.is_verified ? 'Unverify' : 'Verify Badge'}
                              </button>
                              <button
                                onClick={() => updateCompany(company.id, { is_featured: !company.is_featured })}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                  company.is_featured
                                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {company.is_featured ? 'Unboost' : 'Boost'}
                              </button>
                              <button
                                onClick={() => deleteCompany(company.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {showApplications ? (
            <div className="section-frame overflow-hidden rounded-[2rem] border border-blue-100 bg-white/95 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <FileText size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Applications ({filteredApplications.length})</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Candidate</th>
                      <th className="px-6 py-3">Job</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Review & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          No applications matched your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((application) => (
                        <tr key={application.id} className="border-t border-slate-100">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{application.full_name || application.applicant_name}</p>
                            <p className="text-xs text-slate-500">{application.applicant_email}</p>
                            {application.college_name && (
                              <p className="text-xs text-slate-400">College: {application.college_name}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{application.job_title}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedApp(application)
                                  setShowAppModal(true)
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                              >
                                <Eye size={13} />
                                View Details & Resume
                              </button>
                              <select
                                value={application.status}
                                onChange={(e) => updateApplication(application.id, e.target.value)}
                                className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs bg-white font-medium"
                              >
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="waitlist">Waitlist</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-700" size={20} />
            <div>
              <h2 className="font-bold text-slate-900">How to use this Admin Dashboard</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use the search box above to instantly find candidates, companies, jobs, or applications. You can also add new companies and post new jobs using the buttons above.
              </p>
            </div>
          </div>
        </section>

        {/* Modal: Add Company */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-600" /> Add New Company
                </h3>
                <button onClick={() => setShowAddCompanyModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="mt-5 space-y-4">
                {modalError && (
                  <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                    {modalError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    required
                    placeholder="e.g. OpenAI India Labs"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. hiring@company.com"
                      value={companyForm.owner_email}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, owner_email: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      placeholder="e.g. Bangalore, India (Remote)"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://company.ai"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, website: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">About Company</label>
                  <textarea
                    rows={3}
                    placeholder="Description of the organization..."
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={companyForm.is_verified}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, is_verified: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Verified Employer Badge
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={companyForm.is_featured}
                      onChange={(e) => setCompanyForm((p) => ({ ...p, is_featured: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Featured / Boosted
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddCompanyModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {modalSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                    {modalSubmitting ? 'Creating...' : 'Create Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Post Job */}
        {showAddJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase size={18} className="text-cyan-600" /> Post New Job
                </h3>
                <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="mt-5 space-y-4">
                {modalError && (
                  <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                    {modalError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                  <input
                    required
                    placeholder="e.g. GenAI Engineer (RAG & LangChain)"
                    value={jobForm.title}
                    onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Company (Optional)</label>
                  <select
                    value={jobForm.company_id}
                    onChange={(e) => setJobForm((p) => ({ ...p, company_id: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Post on platform behalf (Admin)</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.owner_email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      placeholder="e.g. Remote / Bangalore"
                      value={jobForm.location}
                      onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Annual Salary (INR)</label>
                    <input
                      type="number"
                      placeholder="1500000"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm((p) => ({ ...p, salary: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                    <select
                      value={jobForm.job_type}
                      onChange={(e) => setJobForm((p) => ({ ...p, job_type: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
                    >
                      <option value="remote">Remote</option>
                      <option value="onsite">Onsite</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required (Years)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0 (Student/Fresher)"
                      value={jobForm.experience_required}
                      onChange={(e) => setJobForm((p) => ({ ...p, experience_required: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Skills</label>
                  <textarea
                    rows={4}
                    placeholder="Describe role, required skills (Python, LangChain, React, etc.), and responsibilities..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={jobForm.is_featured}
                      onChange={(e) => setJobForm((p) => ({ ...p, is_featured: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Featured / Boosted Job
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={jobForm.is_active}
                      onChange={(e) => setJobForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Active Listing
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddJobModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-700 disabled:opacity-60"
                  >
                    {modalSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                    {modalSubmitting ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Application Details & Cover Letter */}
        {showAppModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> Candidate Application Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Applied for: <span className="font-semibold text-slate-800">{selectedApp.job_title}</span></p>
                </div>
                <button onClick={() => setShowAppModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {/* Candidate Info Grid */}
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Candidate Name</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.full_name || selectedApp.applicant_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Email Address</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.applicant_email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Phone Number</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">College / University</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedApp.college_name || 'Not provided'}</p>
                  </div>
                </div>

                {/* Cover Letter Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-blue-600" /> Cover Letter
                  </h4>
                  {selectedApp.cover_letter && selectedApp.cover_letter.trim() ? (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {selectedApp.cover_letter}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400 text-center">
                      Candidate did not attach a separate cover letter (Optional).
                    </div>
                  )}
                </div>

                {/* Candidate Skills */}
                {selectedApp.skills && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.skills.split(',').map((skill, i) => (
                        <span key={i} className="rounded-lg bg-blue-100 text-blue-800 px-2.5 py-1 text-xs font-semibold">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Access Button */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Candidate Resume Attachment</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Click below to view or download candidate's uploaded resume PDF.</p>
                  </div>
                  {selectedApp.resume_url || selectedApp.resume ? (
                    <a
                      href={resolveMediaUrl(selectedApp.resume_url || selectedApp.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <ExternalLink size={13} /> View / Download Resume
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No resume file attached</span>
                  )}
                </div>

                {/* Status Updater inside Modal */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Update Status:</span>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value
                        updateApplication(selectedApp.id, nextStatus)
                        setSelectedApp((p) => ({ ...p, status: nextStatus }))
                      }}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold bg-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="waitlist">Waitlist</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAppModal(false)}
                    className="rounded-xl bg-slate-900 text-white px-5 py-2 text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
