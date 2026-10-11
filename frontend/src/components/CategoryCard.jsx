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
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="display-font mb-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Top categories
            </h2>
            <p className="text-base font-medium text-slate-600">Browse roles by domain.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/categories" className="group hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-3 text-sm font-bold tracking-wide text-blue-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg md:inline-flex">
              View All <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {categoryCards.length === 0 ? (
          <div className="section-frame rounded-[2rem] px-6 py-12 text-center text-sm font-medium text-slate-500">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
            {categoryCards.map((cat, idx) => {
              const IconComp = cat.icon
              return (
                <Link key={cat.id} to={`/categories?category=${encodeURIComponent(cat.slug || cat.id)}`} className="block h-full outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true, margin: '-50px' }}
                    className="group section-frame flex h-full cursor-pointer flex-col items-center gap-5 rounded-[2rem] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_24px_60px_rgba(35,85,217,0.12)]"
                  >
                    <div className="rounded-[1.4rem] bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4 text-blue-600 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:from-blue-700 group-hover:to-cyan-500 group-hover:text-white">
                      <IconComp size={32} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-extrabold text-slate-900 transition-colors group-hover:text-blue-700">{cat.name}</h3>
                      <p className="inline-flex items-center rounded-full bg-slate-100/80 px-4 py-1.5 text-xs font-bold tracking-wide text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                        {cat.count} {cat.count === 1 ? 'Job' : 'Jobs'}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoryCard
