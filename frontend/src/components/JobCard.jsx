import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  MapPin,
  Clock,
  IndianRupee,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import axios from 'axios'
import { Link, useSearchParams } from 'react-router-dom'
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

const fetchAllPages = async (url) => {
  const items = []
  let nextUrl = url
  let pageCount = 0
  while (nextUrl && pageCount < 20) {
    const response = await axios.get(nextUrl)
    items.push(...normalizeList(response.data))
    nextUrl = response.data?.next || null
    pageCount += 1
  }
  return items
}

const JobCard = ({ fullPage = false }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [appliedJobsMap, setAppliedJobsMap] = useState({})
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    min_salary: searchParams.get('min_salary') || '',
    max_salary: searchParams.get('max_salary') || '',
    sort: searchParams.get('sort') || '',
  })

  const selectedCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      job_type: searchParams.get('job_type') || '',
      min_salary: searchParams.get('min_salary') || '',
      max_salary: searchParams.get('max_salary') || '',
      sort: searchParams.get('sort') || '',
    })
  }, [searchParams])

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null
  }

  const fetchData = async () => {
    try {
      const auth = getAuthConfig()
      const requests = [
        fetchAllPages('/api/jobs/'),
        fetchAllPages('/api/jobs/categories/'),
        fetchMyApplications(),
      ]

      if (auth) {
        requests.push(axios.get('/api/jobs/saved/', auth))
      }

      const results = await Promise.allSettled(requests)
      const jobsData = results[0].status === 'fulfilled' ? results[0].value : []
      const catData = results[1].status === 'fulfilled' ? results[1].value : []
      const appData = results[2].status === 'fulfilled' ? results[2].value : []
      const savedData = results[3]?.status === 'fulfilled' ? results[3].value.data : []

      const fetchedJobs = jobsData
      setJobs(fetchedJobs)
      setCategories(catData)
      setAppliedJobsMap(createAppliedJobsMap(appData))

      const savedIds = new Set()
      normalizeList(savedData).forEach((item) => {
        if (item.job) savedIds.add(item.job)
      })
      fetchedJobs.forEach((j) => {
        if (j.is_saved) savedIds.add(j.id)
      })
      setSavedJobIds(savedIds)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleSave = async (e, jobId) => {
    e.preventDefault()
    e.stopPropagation()
    const auth = getAuthConfig()
    if (!auth) {
      alert('Please login to bookmark jobs.')
      return
    }

    try {
      await axios.post(`/api/jobs/${jobId}/save/`, {}, auth)
      setSavedJobIds((prev) => {
        const next = new Set(prev)
        if (next.has(jobId)) {
          next.delete(jobId)
        } else {
          next.add(jobId)
        }
        return next
      })
    } catch (err) {
      console.error('Failed to toggle save job:', err)
    }
  }

  const filterOptions = useMemo(() => {
    const counts = jobs.reduce((acc, job) => {
      const key = job.category ? String(job.category) : 'uncategorized'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const options = [
      {
        id: 'all',
        label: 'All Jobs',
        count: jobs.length,
      },
      ...categories.map((category) => ({
        id: String(category.id),
        label: category.name,
        count: counts[String(category.id)] || 0,
      })),
    ]

    if (counts.uncategorized) {
      options.push({
        id: 'uncategorized',
        label: 'Uncategorized',
        count: counts.uncategorized,
      })
    }

    return options.filter((option, index, arr) => arr.findIndex((item) => item.id === option.id) === index)
  }, [categories, jobs])

  const filteredJobs = useMemo(() => {
    const query = (searchParams.get('q') || '').trim().toLowerCase()
    const location = (searchParams.get('location') || '').trim().toLowerCase()
    const jobType = searchParams.get('job_type') || ''
    const minSalary = Number(searchParams.get('min_salary') || 0)
    const maxSalary = Number(searchParams.get('max_salary') || 0)
    const sort = searchParams.get('sort') || ''
    let results = jobs.filter((job) => {
      const categoryMatch = selectedCategory === 'all'
        || (selectedCategory === 'uncategorized' ? !job.category : String(job.category) === selectedCategory)
      const searchable = `${job.title || ''} ${job.description || ''} ${job.employer_name || ''} ${job.category_name || ''}`.toLowerCase()
      const salary = Number(job.salary || 0)
      return categoryMatch
        && (!query || searchable.includes(query))
        && (!location || String(job.location || '').toLowerCase().includes(location))
        && (!jobType || job.job_type === jobType)
        && (!minSalary || salary >= minSalary)
        && (!maxSalary || salary <= maxSalary)
    })

    if (sort === 'salary_high') results = [...results].sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0))
    if (sort === 'salary_low') results = [...results].sort((a, b) => Number(a.salary || 0) - Number(b.salary || 0))
    if (sort === 'newest') results = [...results].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    return results
  }, [jobs, selectedCategory, searchParams])

  const visibleJobs = fullPage ? filteredJobs : filteredJobs.slice(0, 9)

  const applyFilters = (event) => {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(filters).forEach(([key, value]) => {
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
    })
    setSearchParams(nextParams)
  }

  const clearFilters = () => {
    setFilters({ q: '', location: '', job_type: '', min_salary: '', max_salary: '', sort: '' })
    const nextParams = new URLSearchParams(searchParams)
    ;['q', 'location', 'job_type', 'min_salary', 'max_salary', 'sort', 'category'].forEach((key) => nextParams.delete(key))
    setSearchParams(nextParams)
  }

  const handleCategoryFilter = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams)
    if (categoryId === 'all') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', categoryId)
    }
    setSearchParams(nextParams)
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="display-font text-3xl font-extrabold text-slate-900 sm:text-5xl">
                {fullPage ? 'All Jobs' : 'Latest Jobs'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Browse through our curated collection of tech jobs from top companies
              </p>
            </div>
            {/* Toggle switch for All Jobs / New Jobs */}
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button className="rounded-xl bg-blue-100 px-5 py-2 text-sm font-bold text-blue-700 shadow-sm transition-all">All Jobs</button>
              <button className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all">
                <Sparkles size={14} className="text-amber-500" /> New Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips Sections */}
        <div className="mb-8 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Browse Jobs by Category</h3>
            <div className="flex flex-wrap gap-2.5">
              {filterOptions.slice(1).map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCategoryFilter(option.id)}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${
                    selectedCategory === option.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Locations (Mocked from image for now, can be wired up later) */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Browse Jobs by Location</h3>
            <div className="flex flex-wrap gap-2.5">
              {['Bangalore', 'Mumbai and Pune', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Kolkata', 'Kochi', 'Gujarat', 'Remote', 'USA', 'UK', 'Canada'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFilters({ ...filters, location: loc === 'Remote' ? 'remote' : loc })}
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${
                    (filters.location || '').toLowerCase() === (loc === 'Remote' ? 'remote' : loc.toLowerCase())
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={applyFilters} className="mb-10 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              aria-label="Job title, company, or skill" 
              value={filters.q} 
              onChange={(e) => setFilters({ ...filters, q: e.target.value })} 
              placeholder="Search jobs, companies, or locations..." 
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50" 
            />
          </div>
          
          <div className="flex shrink-0 gap-3 overflow-x-auto pb-1 md:pb-0">
            <select aria-label="Country" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 hover:bg-slate-50 min-w-[120px]">
              <option value="india">India</option>
              <option value="global">Global</option>
            </select>
            <select aria-label="Work style" value={filters.job_type} onChange={(e) => setFilters({ ...filters, job_type: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 hover:bg-slate-50 min-w-[130px]">
              <option value="">All Types</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            <select aria-label="Experience" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500 hover:bg-slate-50 min-w-[150px]">
              <option value="">All Experience</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
        </form>
        
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">{filteredJobs.length} <span className="font-medium text-slate-500">jobs match this filter</span></p>
          <div className="flex gap-2">
             <button type="button" onClick={applyFilters} className="hidden rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800 md:block">Apply Filters</button>
             <button type="button" onClick={clearFilters} className="hidden rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 md:block">Clear</button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-[2rem] border border-blue-100 bg-white p-12 text-center text-slate-500 shadow-sm">
            No jobs match these filters. Try a different title, location, or salary range.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleJobs.map((job, idx) => {
              const isSaved = savedJobIds.has(job.id)

              return (
                <motion.article
                  key={job.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative flex h-full flex-col justify-between rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 ${
                    job.is_featured
                      ? 'border-blue-300 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50 shadow-[0_16px_40px_rgba(37,99,235,0.12)]'
                      : 'border-slate-200/80 bg-white/95 shadow-sm hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {job.is_featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                          <Zap size={10} />
                          Featured
                        </span>
                      ) : null}

                      {job.company_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Verified
                        </span>
                      ) : null}

                      {appliedJobsMap[String(job.id)] ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getApplicationStatusClass(appliedJobsMap[String(job.id)].status)}`}>
                          <BadgeCheck size={12} />
                          {getApplicationStatusLabel(appliedJobsMap[String(job.id)].status)}
                        </span>
                      ) : null}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => handleToggleSave(e, job.id)}
                      className={`rounded-full p-2 transition ${
                        isSaved
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title={isSaved ? 'Remove from Saved Jobs' : 'Save Job'}
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>

                  {/* Company & Title Header */}
                  <div>
                    <div className="mb-4 flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
                        <img
                          src={resolveMediaUrl(job.employer_image_url) || 'https://via.placeholder.com/48'}
                          alt={job.employer_name || job.employer_email}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h3>
                        <p className="truncate text-xs text-slate-500">{job.employer_name || job.employer_email}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-blue-600">{job.category_name || 'General'}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6 flex flex-wrap gap-x-3 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span className="capitalize">{job.job_type_display || job.job_type || 'Full-time'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <IndianRupee size={13} className="text-emerald-600" />
                        <span>{job.salary ? `₹${Number(job.salary).toLocaleString('en-IN')} / year` : 'Pay not listed'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <span className="text-[11px] text-slate-400">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Just now'}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-600 shadow-sm"
                    >
                      View Details
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
        {!fullPage && filteredJobs.length > visibleJobs.length ? (
          <div className="mt-9 text-center">
            <Link to={`/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              View all {filteredJobs.length} matching jobs <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default JobCard
