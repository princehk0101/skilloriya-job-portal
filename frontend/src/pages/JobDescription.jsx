import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { MapPin, Clock, DollarSign, Briefcase, ArrowLeft, Sparkles, Building2, BadgeCheck } from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'
import {
  createAppliedJobsMap,
  fetchMyApplications,
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from '../utils/applications'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        const [response, applications] = await Promise.all([
          axios.get(`/api/jobs/${id}/`),
          fetchMyApplications(),
        ])
        const jobData = response.data
        const nextAppliedJobsMap = createAppliedJobsMap(applications)
        setJob(jobData)
        setAppliedJobsMap(nextAppliedJobsMap)

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
      : 'Apply Now'

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-24">Loading...</div>
  if (error) return <div className="flex min-h-screen items-center justify-center pt-24 text-red-500">{error}</div>
  if (!job) return <div className="flex min-h-screen items-center justify-center pt-24">Job not found</div>

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_55px_rgba(35,85,217,0.1)] backdrop-blur">
          <div className="bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-8 py-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-5">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3">
                  <img
                    src={resolveMediaUrl(job.employer_image_url) || 'https://via.placeholder.com/80'}
                    alt={job.employer_name || job.employer_email}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
                <div>
                  <h1 className="display-font mt-4 text-4xl font-bold leading-tight sm:text-5xl">{job.title}</h1>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
                    <span className="inline-flex items-center gap-2 font-semibold text-white">
                      <Building2 size={16} />
                      {job.employer_name || job.employer_email}
                    </span>
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {job.location}</span>
                    <span className="inline-flex items-center gap-2"><Clock size={16} /> {job.job_type_display || job.job_type}</span>
                    <span className="inline-flex items-center gap-2"><DollarSign size={16} /> {job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <button
                  onClick={openApplyPage}
                  disabled={Boolean(currentApplication) || viewerRole === 'employer'}
                  className={`rounded-2xl px-8 py-3 text-sm font-bold transition ${
                    currentApplication || viewerRole === 'employer'
                      ? 'cursor-not-allowed bg-white/20 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {applyButtonLabel}
                </button>
                <p className="mt-3 text-xs text-blue-100">
                  {currentApplication
                    ? `Applied on ${new Date(currentApplication.applied_at).toLocaleDateString()}`
                    : 'Quick apply with resume and profile details'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 p-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-8">
              {currentApplication ? (
                <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Application already submitted</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        You applied for this role on {new Date(currentApplication.applied_at).toLocaleDateString()}.
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getApplicationStatusClass(currentApplication.status)}`}>
                      <BadgeCheck size={16} />
                      {getApplicationStatusLabel(currentApplication.status)}
                    </span>
                  </div>
                </section>
              ) : null}

              <section className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6">
                <h2 className="text-xl font-black text-slate-900">Job Description</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600">{job.description}</p>
              </section>

              <section className="rounded-[1.5rem] border border-slate-100 bg-white p-6">
                <h2 className="text-2xl font-black text-slate-900">Suggested Related Jobs</h2>
                {relatedJobs.length === 0 ? (
                  <p className="mt-4 text-slate-500">No related jobs found right now.</p>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {relatedJobs.map((item) => (
                      <Link
                        key={item.id}
                        to={`/jobs/${item.id}`}
                        className="rounded-2xl border border-gray-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="mt-2 text-sm text-gray-500">{item.location}</p>
                            <p className="text-sm text-gray-500">{item.job_type_display || item.job_type} | {item.salary}</p>
                          </div>
                          {appliedJobsMap[String(item.id)] ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${getApplicationStatusClass(appliedJobsMap[String(item.id)].status)}`}>
                              <BadgeCheck size={12} />
                              {getApplicationStatusLabel(appliedJobsMap[String(item.id)].status)}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-6">
                <h3 className="text-lg font-black text-slate-900">Job Overview</h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Job Type</p>
                      <p className="font-medium text-gray-900">{job.job_type_display || job.job_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p className="font-medium text-gray-900">{job.salary}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium text-gray-900">{new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-1 text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Experience Required</p>
                      <p className="font-medium text-gray-900">{job.experience_required} years</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 text-cyan-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{job.category_name || 'Uncategorized'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200"
                  alt="Professional workspace"
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-sm font-semibold text-blue-700">Why apply here</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Review the role details, company information, and requirements before you apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDescription
