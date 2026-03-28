import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Briefcase, Search, MapPin, ArrowRight, BadgeCheck } from 'lucide-react'
import axios from 'axios'
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
  let nextUrl = url
  let pages = 0
  const items = []
  while (nextUrl && pages < 20) {
    const res = await axios.get(nextUrl)
    const data = res.data
    items.push(...normalizeList(data))
    nextUrl = data?.next || null
    pages += 1
  }
  return items
}

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [appliedJobsMap, setAppliedJobsMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCategories, allJobs, applications] = await Promise.all([
          fetchAllPages('/api/jobs/categories/'),
          fetchAllPages('/api/jobs/'),
          fetchMyApplications(),
        ])
        setCategories(allCategories)
        setJobs(allJobs)
        setAppliedJobsMap(createAppliedJobsMap(applications))
      } catch (err) {
        console.error('Categories page load failed:', err.response?.data || err.message)
        setCategories([])
        setJobs([])
        setAppliedJobsMap({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const jobsByCategory = useMemo(() => {
    const grouped = {}
    jobs.forEach((job) => {
      const key = job.category ? String(job.category) : 'uncategorized'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(job)
    })
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    })
    return grouped
  }, [jobs])

  const displayCategories = useMemo(() => {
    const map = new Map()

    categories.forEach((cat) => {
      map.set(String(cat.id), { ...cat, id: String(cat.id) })
    })

    jobs.forEach((job) => {
      if (job.category) {
        const key = String(job.category)
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: job.category_name || `Category ${job.category}`,
            derived: true,
          })
        }
        return
      }

      if (!map.has('uncategorized')) {
        map.set('uncategorized', {
          id: 'uncategorized',
          name: 'Uncategorized',
          derived: true,
        })
      }
    })

    return Array.from(map.values())
  }, [categories, jobs])

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return displayCategories
    return displayCategories.filter((cat) => cat.name?.toLowerCase().includes(q))
  }, [displayCategories, search])

  const categoryFilteredList = useMemo(() => {
    const queryCategory = searchParams.get('category')?.toLowerCase()
    if (!queryCategory) return filteredCategories

    return filteredCategories.filter((cat) => {
      const slug = String(cat.slug || '').toLowerCase()
      const id = String(cat.id || '').toLowerCase()
      const name = String(cat.name || '').toLowerCase()
      return slug === queryCategory || id === queryCategory || name === queryCategory
    })
  }, [filteredCategories, searchParams])

  const clearCategoryFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('category')
    setSearchParams(nextParams)
  }

  const toggleCategoryJobs = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
          <h1 className="display-font text-4xl font-bold md:text-6xl">
            Explore by <span className="text-amber-200">category</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50/85">
            Browse openings category-wise, scan active roles quickly, and expand any section to view more listings.
          </p>
          <div className="relative mx-auto mt-8 max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-white/40 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-200"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {searchParams.get('category') ? (
            <button
              onClick={clearCategoryFilter}
              className="mt-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Clear category filter
            </button>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading categories and jobs...</p>
        ) : categoryFilteredList.length === 0 ? (
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">No categories available</h2>
            <p className="mt-2 text-gray-600">
              Categories and related openings will appear here as soon as they are added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {categoryFilteredList.map((cat, idx) => {
              const categoryJobs = jobsByCategory[String(cat.id)] || []
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="section-frame rounded-[1.8rem] p-6"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{cat.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Recent openings in this category are listed below.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      <Briefcase size={14} />
                      {categoryJobs.length} Jobs
                    </span>
                  </div>

                  {categoryJobs.length === 0 ? (
                    <p className="text-sm text-gray-500">No jobs currently in this category.</p>
                  ) : (
                    <div className="space-y-3">
                      {(expandedCategories[cat.id] ? categoryJobs : categoryJobs.slice(0, 2)).map((job) => (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="block rounded-[1.25rem] border border-gray-100 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{job.title}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                <span>{job.job_type_display || job.job_type}</span>
                              </div>
                            </div>
                            {appliedJobsMap[String(job.id)] ? (
                              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${getApplicationStatusClass(appliedJobsMap[String(job.id)].status)}`}>
                                <BadgeCheck size={12} />
                                {getApplicationStatusLabel(appliedJobsMap[String(job.id)].status)}
                              </span>
                            ) : null}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {categoryJobs.length > 2 ? (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        onClick={() => toggleCategoryJobs(cat.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        {expandedCategories[cat.id] ? 'Show Less' : `Show More Jobs (${categoryJobs.length - 2})`}
                        <ArrowRight size={15} className={expandedCategories[cat.id] ? 'rotate-90' : ''} />
                      </button>
                      <span className="text-xs text-slate-500">
                        Updated {categoryJobs[0]?.created_at ? new Date(categoryJobs[0].created_at).toLocaleDateString() : 'recently'}
                      </span>
                    </div>
                  ) : null}
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Categories
