import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Globe,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  MessageSquarePlus,
  Loader2,
  X,
  Building2,
  ShieldCheck,
} from 'lucide-react'
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
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('jobs')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    job_title: '',
    pros: '',
    cons: '',
    salary_feedback: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const isLoggedIn = !!localStorage.getItem('access_token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyRes = await axios.get(`/api/companies/${id}/`)
        const companyData = companyRes.data
        setCompany(companyData)

        const [jobsData, reviewsRes] = await Promise.all([
          fetchAllPages(`/api/jobs/?employer=${companyData.owner}`),
          axios.get(`/api/companies/${id}/reviews/`).catch(() => ({ data: [] })),
        ])
        setJobs(jobsData)
        setReviews(normalizeList(reviewsRes.data))
      } catch (err) {
        console.error('Company profile load failed:', err.response?.data || err.message)
        setError('Unable to load company details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    setSubmittingReview(true)

    const token = localStorage.getItem('access_token')
    if (!token) {
      setReviewError('Please log in to submit a company review.')
      setSubmittingReview(false)
      return
    }

    try {
      const res = await axios.post(
        `/api/companies/${id}/reviews/create/`,
        reviewForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setReviews((prev) => [res.data, ...prev])
      setReviewSuccess('Review submitted successfully! Thank you for sharing your experience.')
      setTimeout(() => {
        setShowReviewModal(false)
        setReviewSuccess('')
        setReviewForm({
          rating: 5,
          title: '',
          job_title: '',
          pros: '',
          cons: '',
          salary_feedback: '',
        })
      }, 1200)
    } catch (err) {
      console.error('Review submit failed:', err.response?.data || err.message)
      setReviewError(err.response?.data?.detail || 'Failed to submit review. Please check all fields.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  if (error) {
    return <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 text-red-600 font-medium">{error}</div>
  }
  if (!company) {
    return <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Company not found.</div>
  }

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-28 pb-16">
      <div className="relative w-[98%] max-w-[1600px] mx-auto z-10 px-2 sm:px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Company Header Card */}
        <div className="rounded-[2rem] border border-blue-100 bg-white/95 p-8 sm:p-10 shadow-[0_18px_45px_rgba(37,99,235,0.08)] mb-8 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 rounded-2xl border border-blue-100 p-2.5 shadow-md bg-white">
              <img
                src={resolveMediaUrl(company.logo_url || company.logo) || 'https://via.placeholder.com/120'}
                alt={company.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-white"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 shadow-sm">
                    <ShieldCheck size={14} className="text-blue-600 fill-blue-100" />
                    Verified Employer
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-4">
                <span className="inline-flex items-center gap-1.5 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100 text-blue-700 font-semibold text-xs">
                  <MapPin size={13} className="text-blue-500" /> {company.location || 'Location not set'}
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-blue-700 font-semibold text-xs"
                  >
                    <Globe size={13} className="text-blue-500" /> Website <ExternalLink size={12} className="text-blue-400" />
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100 text-blue-700 font-semibold text-xs">
                  <Briefcase size={13} className="text-blue-500" /> {jobs.length} Open Roles
                </span>
                {avgRating && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-amber-800 font-bold text-xs">
                    <Star size={13} className="text-amber-500 fill-amber-500" /> {avgRating} / 5.0 ({reviews.length} reviews)
                  </span>
                )}
              </div>
              
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About the Company</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {company.description || 'No description provided for this organization yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
              }`}
            >
              Open Roles ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
              }`}
            >
              Reviews & Salaries ({reviews.length})
            </button>
          </div>

          {activeTab === 'reviews' && (
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login')
                } else {
                  setShowReviewModal(true)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,_#2563eb,_#1d4ed8)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all"
            >
              <MessageSquarePlus size={14} />
              Write a Review
            </button>
          )}
        </div>

        {/* Tab 1: Open Positions */}
        {activeTab === 'jobs' && (
          <div className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 sm:p-8 shadow-sm">
            {jobs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Briefcase className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <p className="text-slate-500 text-sm font-medium">No active openings published right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                          {job.job_type}
                        </span>
                      </div>

                      {job.experience_required === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 mb-2">
                          🎓 Open for Students / Freshers
                        </span>
                      )}

                      <div className="space-y-1 mt-2">
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin size={13} className="text-blue-400" /> {job.location}
                        </p>
                        <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-flex items-center px-2 py-0.5 rounded mt-1">
                          ₹{typeof job.salary === 'number' ? job.salary.toLocaleString('en-IN') : job.salary} / year
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        View Details & AI Match →
                      </Link>
                      <Link
                        to={`/apply/${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,_#2563eb,_#1d4ed8)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
                      >
                        ⚡ Apply Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews & Salaries */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Overview Score Box */}
            <div className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white font-extrabold text-2xl shadow-md">
                  {avgRating || '—'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        className={s <= Math.round(avgRating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Based on {reviews.length} verified employee & applicant ratings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all"
              >
                Share Your Feedback
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8">
                  <Star className="mx-auto h-8 w-8 text-amber-400 mb-3" />
                  <p className="text-slate-600 text-sm font-semibold">No reviews yet for {company.name}.</p>
                  <p className="text-slate-400 text-xs mt-1">Be the first to share your salary insights and workplace experience!</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                              />
                            ))}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{rev.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {rev.job_title ? `${rev.job_title} • ` : ''}Reviewed by {rev.reviewer_name || 'Anonymous Employee'} on {new Date(rev.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {rev.salary_feedback && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <DollarSign size={13} /> {rev.salary_feedback}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {rev.pros && (
                        <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                          <p className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                            <ThumbsUp size={13} className="text-emerald-600" /> Pros
                          </p>
                          <p className="text-emerald-800/90 leading-relaxed">{rev.pros}</p>
                        </div>
                      )}
                      {rev.cons && (
                        <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-3.5">
                          <p className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                            <ThumbsDown size={13} className="text-rose-600" /> Cons
                          </p>
                          <p className="text-rose-800/90 leading-relaxed">{rev.cons}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Write Review Modal */}
        <AnimatePresence>
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Review {company.name}</h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                  {reviewError && (
                    <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                      {reviewError}
                    </p>
                  )}
                  {reviewSuccess && (
                    <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                      {reviewSuccess}
                    </p>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={star <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{reviewForm.rating} of 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                    <input
                      required
                      placeholder="e.g. Great culture and high learning curve"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Job Role</label>
                      <input
                        placeholder="e.g. Frontend Developer"
                        value={reviewForm.job_title}
                        onChange={(e) => setReviewForm((p) => ({ ...p, job_title: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Salary Insight (Optional)</label>
                      <input
                        placeholder="e.g. ₹8-12 LPA or Competitive"
                        value={reviewForm.salary_feedback}
                        onChange={(e) => setReviewForm((p) => ({ ...p, salary_feedback: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">Pros / What you like</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Flexible hours, good mentorship, transparent management"
                      value={reviewForm.pros}
                      onChange={(e) => setReviewForm((p) => ({ ...p, pros: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">Cons / Room for Improvement</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Fast-paced deadlines during releases"
                      value={reviewForm.cons}
                      onChange={(e) => setReviewForm((p) => ({ ...p, cons: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submittingReview ? <Loader2 size={13} className="animate-spin" /> : null}
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CompanyProfile
