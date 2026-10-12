import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Palette,
  Code,
  Megaphone,
  CircleDollarSign,
  Briefcase,
  BarChart3,
  LifeBuoy,
  Users,
  Database,
  Layers3,
} from 'lucide-react'
import axios from 'axios'

const iconMap = {
  design: Palette,
  development: Code,
  marketing: Megaphone,
  finance: CircleDollarSign,
  management: Briefcase,
  sales: BarChart3,
  'customer support': LifeBuoy,
  'human resource': Users,
  'data analytics': Database,
}

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

const CategoryCard = () => {
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allCategories, allJobs] = await Promise.all([
          fetchAllPages('/api/jobs/categories/'),
          fetchAllPages('/api/jobs/'),
        ])
        setCategories(allCategories)
        setJobs(allJobs)
      } catch (error) {
        console.error('Failed to load categories:', error.response?.data || error.message)
        setCategories([])
        setJobs([])
      }
    }

    loadData()
  }, [])

  const categoryCards = useMemo(() => {
    const counts = jobs.reduce((acc, job) => {
      if (!job.category) return acc
      const key = String(job.category)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return categories.map((cat) => ({
      ...cat,
      count: counts[String(cat.id)] || 0,
      icon: iconMap[cat.name?.toLowerCase()] || Layers3,
    }))
  }, [categories, jobs])

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute right-[-5%] top-0 h-[400px] w-[400px] rounded-full bg-blue-300/16 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 left-[-5%] h-[300px] w-[300px] rounded-full bg-amber-300/16 blur-[100px]" />

      <div className="relative z-10 mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
        <div className="mb-8 sm:mb-14 flex flex-col items-start justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="display-font mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Top categories
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-600">Browse roles by domain.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/categories" className="group hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold tracking-wide text-blue-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md md:inline-flex">
              View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {categoryCards.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 text-center text-sm font-medium text-slate-500 shadow-sm">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 xl:gap-6">
            {categoryCards.map((cat, idx) => {
              const IconComp = cat.icon
              return (
                <Link key={cat.id} to={`/categories?category=${encodeURIComponent(cat.slug || cat.id)}`} className="block h-full outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.4 }}
                    viewport={{ once: true, margin: '-20px' }}
                    className="group flex h-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:gap-4 sm:rounded-3xl sm:p-7 text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="rounded-xl sm:rounded-2xl bg-blue-50/80 border border-blue-100/70 p-3 sm:p-4 text-blue-600 shadow-none transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-105">
                      <IconComp className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="w-full">
                      <h3 className="mb-1 sm:mb-2 text-sm sm:text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-1">{cat.name}</h3>
                      <p className="inline-flex items-center rounded-full bg-slate-100/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                        {cat.count} {cat.count === 1 ? 'Job' : 'Jobs'}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center md:hidden">
          <Link to="/categories" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-300">
            View All Categories <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoryCard
