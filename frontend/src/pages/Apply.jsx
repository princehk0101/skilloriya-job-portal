import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Briefcase, Loader2, Sparkles, ShieldCheck, UploadCloud } from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import {
  fetchMyApplications,
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from '../utils/applications'

const Apply = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [existingApplication, setExistingApplication] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    college_name: '',
    phone_number: '',
    skills: '',
    cover_letter: '',
    resume: null,
  })

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token')
      const role = localStorage.getItem('user_role')

      if (!token) {
        navigate('/login')
        return
      }

      if (role === 'employer') {
        navigate('/employer', {
          state: {
            notice: 'Employer accounts cannot submit applications. Please sign in with a candidate account to apply.',
          },
        })
        return
      }

      try {
        const [jobRes, profileRes, applications] = await Promise.all([
          axios.get(`/api/jobs/${id}/`),
          axios.get('/api/users/profile/', { headers: { Authorization: `Bearer ${token}` } }),
          fetchMyApplications(),
        ])
        const profile = profileRes.data || {}
        if (profile.is_staff || profile.is_superuser) {
          navigate('/admin-dashboard')
          return
        }
        if (profile.role === 'employer') {
          navigate('/employer', {
            state: {
              notice: 'Employer accounts cannot submit applications. Please sign in with a candidate account to apply.',
            },
          })
          return
        }
        const appliedRecord = applications.find((application) => Number(application.job) === Number(id)) || null
        setJob(jobRes.data)
        setExistingApplication(appliedRecord)
        setFormData((prev) => ({
          ...prev,
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          phone_number: profile.phone_number || '',
          skills: profile.skills || '',
        }))
      } catch (err) {
        console.error('Apply page load failed:', err.response?.data || err.message)
        setError('Unable to load the application page.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id, navigate])

  const skillsPreview = useMemo(() => (
    formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  ), [formData.skills])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (existingApplication) return
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      const payload = new FormData()
      payload.append('full_name', formData.full_name)
      payload.append('college_name', formData.college_name)
      payload.append('phone_number', formData.phone_number)
      payload.append('skills', formData.skills)
      payload.append('cover_letter', formData.cover_letter)
      if (formData.resume) {
        payload.append('resume', formData.resume)
      }

      await axios.post(`/api/applications/apply/${id}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMessage('Application submitted successfully.')
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      const data = err.response?.data
      console.error('Apply failed:', data || err.message)

      let nextMessage = 'Application failed. Please verify your Resume PDF and required details.'
      if (typeof data === 'string') {
        nextMessage = data
      } else if (data?.message) {
        nextMessage = data.message
      } else if (data?.detail) {
        nextMessage = data.detail
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstVal = data[firstKey]
        if (Array.isArray(firstVal) && firstVal.length > 0) {
          nextMessage = `${firstKey}: ${firstVal[0]}`
        } else if (typeof firstVal === 'string') {
          nextMessage = `${firstKey}: ${firstVal}`
        }
      }

      setError(nextMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-blue-100 bg-white/92 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-700">Job application</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Submit your application for this job.</h1>
            </div>

            {existingApplication ? (
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">You have already applied for this job</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        Application submitted on {new Date(existingApplication.applied_at).toLocaleDateString()}.
                      </p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getApplicationStatusClass(existingApplication.status)}`}>
                      {getApplicationStatusLabel(existingApplication.status)}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-600">
                    Your earlier application is already under process. You can review the latest status from your dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#0891b2)] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(37,99,235,0.24)] transition hover:brightness-110"
                >
                  <Sparkles size={18} />
                  Go to My Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <input
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  placeholder="College name"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Skills (comma separated) e.g. React, Django, SQL"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {skillsPreview.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsPreview.map((skill) => (
                      <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
                <textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  placeholder="Write a short cover letter for this job."
                  rows={6}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <label className="block rounded-[1.5rem] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-6 text-center">
                  <UploadCloud className="mx-auto text-blue-700" size={26} />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {formData.resume ? formData.resume.name : 'Upload resume PDF'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Only PDF resumes are accepted for this application.</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFormData((prev) => ({ ...prev, resume: e.target.files?.[0] || null }))}
                    required
                    className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
                  />
                </label>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {message ? <p className="text-sm text-cyan-700">{message}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#0891b2)] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(37,99,235,0.24)] transition hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"
                alt="Applicant preparing documents"
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-900">Job Summary</h2>
                {job ? (
                  <>
                    <div className="mb-4 mt-4 flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(job.employer_image_url)}
                        alt={job.employer_name || job.employer_email}
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.employer_name || job.employer_email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="inline-flex items-center gap-2"><Briefcase size={14} /> {job.job_type_display || job.job_type}</p>
                      <p>{job.location}</p>
                      <p>Salary: {job.salary}</p>
                      <p>Category: {job.category_name || 'Uncategorized'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Job info unavailable.</p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#06b6d4)] p-6 text-white shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
                <ShieldCheck size={14} />
                Application tips
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-blue-100">
                <li>Upload an updated PDF resume.</li>
                <li>Keep your cover letter relevant to the job role.</li>
                <li>Make sure your contact details are correct before submitting.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Apply
