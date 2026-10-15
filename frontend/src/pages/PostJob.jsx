import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Loader2,
  MapPin,
  Sparkles,
  Wallet,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  FileCode,
  Tag,
  Clock,
  Layers,
} from 'lucide-react'
import SidebarLayout from '../components/SidebarLayout'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const PostJob = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    practical_challenge: '',
    location: '',
    salary: '',
    job_type: 'remote',
    experience_required: 0,
    category: '',
  })

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  useEffect(() => {
    const loadPage = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/employer/login')
        return
      }

      try {
        const [profileRes, categoriesRes] = await Promise.all([
          axios.get('/api/users/profile/', getAuthConfig()),
          axios.get('/api/jobs/categories/'),
        ])

        if (profileRes.data?.role !== 'employer') {
          navigate('/employer/login')
          return
        }

        localStorage.setItem('user_role', 'employer')
        localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
        setUser(profileRes.data)
        setCategories(normalizeList(categoriesRes.data))
      } catch (err) {
        console.error('Post job page load failed:', err.response?.data || err.message)
        setError('Unable to open the post job page right now. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: formData.required_skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        practical_challenge: formData.practical_challenge.trim(),
        location: formData.location.trim(),
        salary: Number(formData.salary),
        job_type: formData.job_type,
        experience_required: Number(formData.experience_required),
        category: formData.category ? Number(formData.category) : null,
      }

      await axios.post('/api/jobs/create/', payload, getAuthConfig())
      setSuccessMsg('Job posted successfully! Opening your active jobs list...')
      setFormData({
        title: '',
        description: '',
        required_skills: '',
        practical_challenge: '',
        location: '',
        salary: '',
        job_type: 'remote',
        experience_required: 0,
        category: '',
      })
      setTimeout(() => navigate('/employer?tab=jobs'), 800)
    } catch (err) {
      console.error('Post job failed:', err.response?.data || err.message)
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          'Unable to post job. Please verify required fields.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <SidebarLayout title="Post New Job Opening" role="employer" profile={user}>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Centered Header with No BG */}
          <div className="mb-10 text-center max-w-3xl mx-auto pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
              <Sparkles size={14} />
              New Opening Wizard
            </span>
            <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
              Publish a Job Opening
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl mx-auto">
              Fill in the role details, skills, compensation, and practical challenges to reach top tech talent instantly.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/employer?tab=jobs"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                View Active Jobs ({user?.company_name || 'My Jobs'})
              </Link>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information Section */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase size={18} className="text-blue-600" />
                  1. Role Details
                </h2>
                <p className="text-xs text-slate-500">Specify the position title, category, and workplace mode.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Backend Engineer (Django / Python)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Workplace Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="remote">Remote (Work from Anywhere)</option>
                    <option value="hybrid">Hybrid (Office + Remote)</option>
                    <option value="onsite">Onsite (Full Office)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Compensation & Location Section */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wallet size={18} className="text-blue-600" />
                  2. Compensation & Location
                </h2>
                <p className="text-xs text-slate-500">Provide realistic salary and office location expectations.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Annual Salary (INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      name="salary"
                      min="0"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="800000"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Gross Annual CTC</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_required"
                    min="0"
                    value={formData.experience_required}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">0 for Freshers / Interns</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Bengaluru / Remote"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400">City, State or Remote</p>
                </div>
              </div>
            </div>

            {/* 3. Skills & Assessment Challenge Section */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode size={18} className="text-blue-600" />
                  3. Required Skills & Practical Challenge
                </h2>
                <p className="text-xs text-slate-500">Filter qualified applicants by testing concrete skills.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Key Technical Skills <span className="text-slate-400 font-normal">(Comma Separated)</span>
                  </label>
                  <input
                    type="text"
                    name="required_skills"
                    value={formData.required_skills}
                    onChange={handleChange}
                    placeholder="Python, Django, PostgreSQL, Docker, Redis"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Optional Practical Challenge Prompt
                  </label>
                  <textarea
                    name="practical_challenge"
                    value={formData.practical_challenge}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. Share a GitHub link or Loom video demonstration of an API or project you built recently."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Candidates can submit artifacts, repositories, or proof links with their application.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Detailed Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Describe role responsibilities, team structure, tech stack, and growth opportunities..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 leading-relaxed"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error / Success Toast */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-semibold text-emerald-700">
                ✓ {successMsg}
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">
                Once published, this role will be active and visible to candidates on Skilloria immediately.
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/employer?tab=jobs"
                  className="w-full sm:w-auto text-center rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Publishing Opening...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={15} />
                      Publish Job Live
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default PostJob
