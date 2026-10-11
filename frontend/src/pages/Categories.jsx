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

const doesJobMatchSearch = (job, jobSearch, locationSearch) => {
  const searchableText = `${job.title || ''} ${job.description || ''} ${job.employer_name || ''} ${job.category_name || ''}`.toLowerCase()
  return (!jobSearch || searchableText.includes(jobSearch))
    && (!locationSearch || String(job.location || '').toLowerCase().includes(locationSearch))
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

  const jobSearch = (searchParams.get('q') || '').trim().toLowerCase()
  const locationSearch = (searchParams.get('location') || '').trim().toLowerCase()

  const categoryFilteredList = useMemo(() => {
    const queryCategory = searchParams.get('category')?.toLowerCase()
    return filteredCategories.filter((cat) => {
      if (queryCategory) {
        const slug = String(cat.slug || '').toLowerCase()
        const id = String(cat.id || '').toLowerCase()
        const name = String(cat.name || '').toLowerCase()
        if (slug !== queryCategory && id !== queryCategory && name !== queryCategory) return false
      }
      if (jobSearch || locationSearch) {
        const matchingJobs = (jobsByCategory[String(cat.id)] || []).some((job) => doesJobMatchSearch(job, jobSearch, locationSearch))
        if (!matchingJobs) return false
      }
      return true
    })
  }, [filteredCategories, searchParams, jobsByCategory, jobSearch, locationSearch])

  const clearCategoryFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('category')
    nextParams.delete('q')
    nextParams.delete('location')
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
      <section className="pb-10">
        <div className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
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
            {searchParams.get('category') || jobSearch || locationSearch ? (
              <button
                onClick={clearCategoryFilter}
                className="mt-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                Clear job filters
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
        {isLoading ? (
            <p className="text-center text-gray-500">Loading categories and jobs...</p>
        ) : categoryFilteredList.length === 0 ? (
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">{jobSearch || locationSearch ? 'No matching jobs found' : 'No categories available'}</h2>
            <p className="mt-2 text-gray-600">
              {jobSearch || locationSearch ? 'Try a different title, skill, or location.' : 'Categories and related openings will appear here as soon as they are added.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {categoryFilteredList.map((cat, idx) => {
              const categoryJobs = (jobsByCategory[String(cat.id)] || []).filter((job) => doesJobMatchSearch(job, jobSearch, locationSearch))
              return (
                <Link
                  key={cat.id}
                  to={`/jobs?category=${cat.id}`}
                  className="block h-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="section-frame rounded-[1.8rem] p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(35,85,217,0.12)] cursor-pointer bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{cat.name}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {categoryJobs.length > 0 ? `${categoryJobs.length} active openings available. Click to explore.` : 'No active jobs right now.'}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        <Briefcase size={14} />
                        {categoryJobs.length} Jobs
                      </span>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Categories
