import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, Users, CheckCircle2, Clock3, LogOut, Plus, Building2, Upload } from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const statusBadgeClass = (status) => {
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
  const [isPostingJob, setIsPostingJob] = useState(false)
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [company, setCompany] = useState(null)
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    job_type: 'remote',
    experience_required: 0,
  })
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
      setError('Unable to load your employer dashboard right now. Please try again in a moment.')
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
    if (location.state?.notice) {
      setSuccessMsg(location.state.notice)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    loadApplicants(selectedJobId)
  }, [selectedJobId])

  useEffect(() => {
    return () => {
      if (companyForm.logo instanceof File && companyLogoPreview) {
        URL.revokeObjectURL(companyLogoPreview)
      }
    }
  }, [companyLogoPreview, companyForm.logo])

  const handleJobFormChange = (e) => {
    const { name, value } = e.target
    setJobForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target
    setCompanyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyLogoChange = (e) => {
    const file = e.target.files?.[0] || null
    setCompanyForm((prev) => ({ ...prev, logo: file }))
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsPostingJob(true)

    try {
      const payload = {
        title: jobForm.title.trim(),
        description: jobForm.description.trim(),
        location: jobForm.location.trim(),
        salary: Number(jobForm.salary),
        job_type: jobForm.job_type,
        experience_required: Number(jobForm.experience_required),
      }

      await axios.post('/api/jobs/create/', payload, getAuthConfig())
      setSuccessMsg('Job posted successfully.')
      setJobForm({
        title: '',
        description: '',
        location: '',
        salary: '',
        job_type: 'remote',
        experience_required: 0,
      })
      await loadEmployerData()
    } catch (err) {
      console.error('Job post failed:', err.response?.data || err.message)
      setError('Unable to post job. Please verify required fields.')
    } finally {
      setIsPostingJob(false)
    }
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
      setError('Unable to save company details. Please check required fields.')
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
      setError('Unable to update the application status right now. Please try again.')
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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#0ea5e9)] px-6 py-7 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)] md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img
              src={resolveMediaUrl(user?.profile_image_url) || 'https://via.placeholder.com/56'}
              alt="Employer"
              className="h-14 w-14 rounded-2xl border border-white/20 object-cover"
            />
            <div>
            <h1 className="text-3xl font-extrabold text-white">
              Employer Panel {user?.first_name ? `- ${user.first_name}` : ''}
            </h1>
            <p className="mt-1 text-blue-100">Post jobs, review applicants, and select candidates.</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold text-white transition-all hover:bg-white/15"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm text-cyan-700">
            {successMsg}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="rounded-2xl border border-blue-100 bg-white/88 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.total_applications}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/88 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Clock3 size={20} />
            </div>
            <p className="text-sm text-slate-500">Waitlist</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.waitlist}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/88 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Briefcase size={20} />
            </div>
            <p className="text-sm text-slate-500">Shortlisted</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.shortlisted}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/88 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)] backdrop-blur">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm text-slate-500">Accepted</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.accepted}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#0ea5e9)] p-6 text-white shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-blue-100">
                Hiring Action
              </div>
              <h2 className="text-2xl font-bold">Publish a new opening</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Create a fresh job post, attach category, and push it directly to the live job feed.
              </p>
              <Link
                to="/post-job"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Plus size={16} />
                Open Post Job Page
              </Link>
            </div>

            <form
              onSubmit={handleSaveCompany}
              className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Company Profile</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage your logo, description, and public company details from here.</p>
                </div>
                {company?.id ? (
                  <Link to={`/companies/${company.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    View
                  </Link>
                ) : null}
              </div>

              <div className="mb-5 flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                    {companyLogoPreview ? (
                      <img src={companyLogoPreview} alt="Company" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={22} className="text-blue-500" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-blue-700 p-2 text-white shadow-lg">
                    <Upload size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCompanyLogoChange} />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{companyForm.name || 'Your company branding'}</p>
                  <p className="text-sm text-slate-500">Keep this complete so seekers trust the listing faster.</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  name="name"
                  value={companyForm.name}
                  onChange={handleCompanyFormChange}
                  placeholder="Company name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
                <input
                  name="location"
                  value={companyForm.location}
                  onChange={handleCompanyFormChange}
                  placeholder="Company location"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
                <input
                  name="website"
                  value={companyForm.website}
                  onChange={handleCompanyFormChange}
                  placeholder="https://company-site.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <textarea
                  name="description"
                  value={companyForm.description}
                  onChange={handleCompanyFormChange}
                  placeholder="What does your company do?"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingCompany ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
            </form>

            <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 mb-4">My Posted Jobs</h2>
              <div className="space-y-2">
                {jobs.length === 0 ? (
                  <p className="text-sm text-slate-500">No jobs posted yet.</p>
                ) : (
                  jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                        selectedJobId === job.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.location} - {job.job_type}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Applicants {selectedJobId ? `for Job #${selectedJobId}` : ''}
            </h2>
            {!selectedJobId ? (
              <p className="text-sm text-slate-500">Select a job to view applicants.</p>
            ) : applicants.length === 0 ? (
              <p className="text-sm text-slate-500">No applicants yet for this job.</p>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={resolveMediaUrl(app.applicant_profile_image_url) || 'https://via.placeholder.com/44'}
                          alt={app.applicant_name || app.full_name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                        <p className="font-semibold text-slate-900">{app.full_name || app.applicant_name}</p>
                        <p className="text-sm text-slate-500">{app.applicant_email}</p>
                        <p className="text-sm text-slate-500">{app.college_name}</p>
                        <p className="text-sm text-slate-500">{app.phone_number}</p>
                        {app.skills ? (
                          <p className="text-sm text-slate-500"><span className="font-semibold">Skills:</span> {app.skills}</p>
                        ) : null}
                        {app.resume_url || app.resume ? (
                          <a
                            href={resolveMediaUrl(app.resume_url || app.resume)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`${statusBadgeClass(app.status)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                          {app.status}
                        </span>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        >
                          <option value="waitlist">Waitlist</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    {app.cover_letter ? (
                      <p className="mt-3 text-sm text-slate-600">
                        <span className="font-semibold">Cover Letter:</span> {app.cover_letter}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
