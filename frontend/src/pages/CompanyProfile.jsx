import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { MapPin, Globe, Briefcase, ArrowLeft, ExternalLink } from 'lucide-react'
import { resolveMediaUrl } from '../utils/media'

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

const CompanyProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await axios.get(`/api/companies/${id}/`)
        const companyData = companyRes.data
        setCompany(companyData)

        const jobsData = await fetchAllPages(`/api/jobs/?employer=${companyData.owner}`)
        setJobs(jobsData)
      } catch (err) {
        console.error('Company profile load failed:', err.response?.data || err.message)
        setError('Unable to load company details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  if (error) {
    return <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50/50 text-red-600 font-medium">{error}</div>
  }
  if (!company) {
    return <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50/50 text-slate-500 font-medium">Company not found.</div>
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <div className="relative max-w-5xl mx-auto z-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </motion.button>

        {/* Company Header Card - Professional & Crisp */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm mb-10 hover:border-blue-200 transition-colors"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 rounded-xl border border-slate-100 p-2 shadow-sm bg-white">
              <img
                src={resolveMediaUrl(company.logo_url || company.logo) || 'https://via.placeholder.com/120'}
                alt={company.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover bg-white"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{company.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-blue-700 font-medium">
                  <MapPin size={14} className="text-blue-500" /> {company.location || 'Location not set'}
                </span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors text-blue-700 font-medium">
                    <Globe size={14} className="text-blue-500" /> Website <ExternalLink size={12} className="text-blue-400" />
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 text-blue-700 font-medium">
                  <Briefcase size={14} className="text-blue-500" /> {jobs.length} Openings
                </span>
              </div>
              
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">About Company</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {company.description || 'No description provided for this company yet.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Open Positions</h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold">{jobs.length} roles</span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80">
              <Briefcase className="mx-auto h-8 w-8 text-slate-400 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No open positions available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                >
                  <Link
                    to={`/jobs/${job.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <h3 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <div className="shrink-0 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {job.job_type}
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <MapPin size={14} className="text-blue-400" /> {job.location}
                      </p>
                      <p className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 inline-flex items-center px-2 py-1 rounded mt-2">
                        {job.salary}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default CompanyProfile
