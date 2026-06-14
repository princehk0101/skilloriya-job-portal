import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Clock, IndianRupee, BadgeCheck } from 'lucide-react'
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

const JobCard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [appliedJobsMap, setAppliedJobsMap] = useState({})
  const [loading, setLoading] = useState(true)

  const selectedCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, categoriesRes, applications] = await Promise.all([
          axios.get('/api/jobs/'),
          axios.get('/api/jobs/categories/'),
          fetchMyApplications(),
        ])
        setJobs(normalizeList(jobsRes.data))
        setCategories(normalizeList(categoriesRes.data))
        setAppliedJobsMap(createAppliedJobsMap(applications))
      } catch (error) {
        console.error('Error fetching jobs:', error.response?.data || error.message)
        setJobs([])
        setCategories([])
        setAppliedJobsMap({})
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
    if (selectedCategory === 'all') return jobs
    if (selectedCategory === 'uncategorized') {
      return jobs.filter((job) => !job.category)
    }
    return jobs.filter((job) => String(job.category) === selectedCategory)
  }, [jobs, selectedCategory])

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
          <div>
            <h2 className="display-font mb-2 text-3xl font-bold text-gray-900 sm:text-5xl">
              Latest <span className="text-blue-700">job openings</span>
            </h2>
            <p className="text-gray-600">Filter by category.</p>
          </div>
          <Link to="/categories" className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-3 text-gray-700 transition-colors hover:border-blue-600 hover:text-blue-600 md:flex">
            Explore All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCategoryFilter(option.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === option.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'border border-white/80 bg-white/78 text-slate-700 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="section-frame rounded-[2rem] px-6 py-8 text-center text-slate-600">
            There are currently no jobs available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, idx) => (
              <motion.article
                key={job.id || idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="section-frame flex h-full flex-col rounded-[1.75rem] p-6 transition-all hover:-translate-y-1 hover:border-blue-200"
              >
                {appliedJobsMap[String(job.id)] ? (
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getApplicationStatusClass(appliedJobsMap[String(job.id)].status)}`}>
                      <BadgeCheck size={13} />
                      {getApplicationStatusLabel(appliedJobsMap[String(job.id)].status)}
                    </span>
                    <span className="text-xs text-slate-500">
                      Applied {new Date(appliedJobsMap[String(job.id)].applied_at).toLocaleDateString()}
                    </span>
                  </div>
                ) : null}

                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
                    <img
                      src={resolveMediaUrl(job.employer_image_url) || 'https://via.placeholder.com/50'}
                      alt={job.employer_name || job.employer_email}
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="line-clamp-1 font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.employer_name || job.employer_email}</p>
                    <p className="mt-1 text-xs font-semibold text-blue-600">{job.category_name || 'Uncategorized'}</p>
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    <span>{job.job_type_display || job.job_type || 'Full Time'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee size={16} className="text-gray-400" />
                    <span>{job.salary || 'Not disclosed'}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}</p>
                  <div className="flex items-center gap-3">
                    {appliedJobsMap[String(job.id)] ? (
                      <span className="text-xs font-semibold text-blue-700">Application submitted</span>
                    ) : null}
                    <Link to={`/jobs/${job.id}`} className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default JobCard
