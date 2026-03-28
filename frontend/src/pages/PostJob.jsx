import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Loader2, MapPin, Sparkles, Wallet } from 'lucide-react'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const PostJob = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
        navigate('/login')
        return
      }

      try {
        const [profileRes, categoriesRes] = await Promise.all([
          axios.get('/api/users/profile/', getAuthConfig()),
          axios.get('/api/jobs/categories/'),
        ])

        if (profileRes.data?.role !== 'employer') {
          navigate('/dashboard')
          return
        }

        localStorage.setItem('user_role', 'employer')
        localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
        setCategories(normalizeList(categoriesRes.data))
      } catch (err) {
        console.error('Post job page load failed:', err.response?.data || err.message)
        setError('Unable to open the post job page right now. Please try again in a moment.')
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
        location: formData.location.trim(),
        salary: Number(formData.salary),
        job_type: formData.job_type,
        experience_required: Number(formData.experience_required),
        category: formData.category ? Number(formData.category) : null,
      }

      await axios.post('/api/jobs/create/', payload, getAuthConfig())
      setSuccessMsg('Job posted successfully.')
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        job_type: 'remote',
        experience_required: 0,
        category: '',
      })
      setTimeout(() => navigate('/employer'), 700)
    } catch (err) {
      console.error('Post job failed:', err.response?.data || err.message)
      setError(err.response?.data?.detail || 'Unable to post job. Please verify required fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/employer" className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700">
            <ArrowLeft size={16} />
            Back to Employer Panel
          </Link>
          <div className="rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
            Hiring Console
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(140deg,_#0f172a,_#1d4ed8,_#06b6d4)] p-8 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
              <Sparkles size={14} />
              Post faster
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">Create a job post that candidates actually respond to.</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-blue-100">
              Fill in the essentials, choose a category if available, and publish a role that looks clear, confident, and easy to understand.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                <p className="text-sm font-semibold">Better visibility</p>
                <p className="mt-1 text-sm text-blue-100">Category aur clear title se seekers ko relevant jobs jaldi milti hain.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                <p className="text-sm font-semibold">Direct applicant flow</p>
                <p className="mt-1 text-sm text-blue-100">As candidates apply, you can review interest and responses from your employer area.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Job details</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Publish a new opening</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Briefcase size={16} className="text-blue-600" />
                    Job title
                  </span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Frontend Developer Intern"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={16} className="text-blue-600" />
                    Location
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Remote / Delhi / Bangalore"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Wallet size={16} className="text-blue-600" />
                    Salary
                  </span>
                  <input
                    type="number"
                    name="salary"
                    min="0"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="25000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Job type</span>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Experience required</span>
                  <input
                    type="number"
                    name="experience_required"
                    min="0"
                    value={formData.experience_required}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Categories are not available right now, so this role will be posted without one.
                    </p>
                  ) : null}
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Role responsibilities, skills required, and candidate expectations..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </label>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {successMsg ? (
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                  {successMsg}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#0ea5e9)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase size={16} />}
                  {isSubmitting ? 'Publishing...' : 'Publish Job'}
                </button>

                <Link
                  to="/employer"
                  className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PostJob
