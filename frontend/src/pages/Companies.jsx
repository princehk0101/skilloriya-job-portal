import React, { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, Briefcase, Star, Globe2 } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { resolveMediaUrl } from '../utils/media'
import { Link } from 'react-router-dom'

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

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [jobCountByEmployer, setJobCountByEmployer] = useState({})
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyList, jobs] = await Promise.all([
          fetchAllPages('/api/companies/'),
          fetchAllPages('/api/jobs/'),
        ])

        const counts = jobs.reduce((acc, job) => {
          const key = job.employer_email || ''
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})

        setCompanies(companyList)
        setJobCountByEmployer(counts)
      } catch (err) {
        console.error('Companies load failed:', err.response?.data || err.message)
        setCompanies([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((company) => (
      company.name?.toLowerCase().includes(q) ||
      company.location?.toLowerCase().includes(q) ||
      company.description?.toLowerCase().includes(q)
    ))
  }, [companies, search])

  return (
    <div className="min-h-screen pt-24">
      <section className="pb-10">
        <div className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
          <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="display-font mt-6 text-4xl font-bold leading-tight sm:text-6xl">Find companies that are hiring now.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                  Browse company profiles, check locations, and view active job openings before you apply.
                </p>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/8">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
                  alt="Professional office environment"
                  className="h-72 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4 pb-12">
        <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="display-font text-3xl font-bold text-slate-900 sm:text-5xl">Top companies hiring now</h2>
            <p className="mt-2 text-base text-slate-600">Company logos, details, and active openings in one easy view.</p>
          </div>
          <div className="relative max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, city, or keywords..."
              className="block w-full rounded-2xl border border-gray-200 bg-white py-4 pl-11 pr-4 shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading companies...</p>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center text-slate-600 shadow-sm">
            No companies match your search right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company, idx) => (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white/92 shadow-[0_18px_45px_rgba(37,99,235,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(37,99,235,0.14)]"
              >
                <div className="h-28 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)]" />
                <div className="px-6 pb-6">
                  <div className="-mt-10 flex items-start justify-between gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white p-2 shadow-md">
                      <img
                        src={resolveMediaUrl(company.logo_url || company.logo) || 'https://via.placeholder.com/64'}
                        alt={company.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                    <div className={`mt-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${company.reviews_count ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {company.reviews_count ? <><Star size={13} fill="currentColor" /><span>{Number(company.average_rating).toFixed(1)} ({company.reviews_count})</span></> : <span>No reviews yet</span>}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-2xl font-black text-slate-900 transition-colors group-hover:text-blue-700">
                      {company.name}
                    </h3>
                    <p className="mt-3 min-h-[52px] text-sm leading-7 text-slate-600">
                      {company.description || 'View company details, location, and current openings.'}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      <span>{company.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-600" />
                      <span>{jobCountByEmployer[company.owner_email] || 0} Active Openings</span>
                    </div>
                    {company.website ? (
                      <div className="flex items-center gap-2">
                        <Globe2 size={16} className="text-cyan-600" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    ) : null}
                  </div>

                  <Link
                    to={`/companies/${company.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    View Company
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Companies
