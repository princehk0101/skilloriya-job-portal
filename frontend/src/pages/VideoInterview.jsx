import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Briefcase,
  FileText,
  Loader2,
  ExternalLink,
  Shield,
} from 'lucide-react'

const VideoInterview = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesMessage, setNotesMessage] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [feedbackDraft, setFeedbackDraft] = useState({ rating: 5, feedback: '' })
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || 'null')
    } catch {
      return null
    }
  })

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  useEffect(() => {
    const fetchInterview = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const res = await axios.get(`/api/applications/interviews/${roomId}/`, getAuthConfig())
        setInterview(res.data)
        setNotes(res.data.notes || '')
        if (res.data.feedback) {
          setFeedbackDraft({ rating: res.data.feedback.rating, feedback: res.data.feedback.feedback })
        }
      } catch (err) {
        console.error('Failed to load interview room:', err)
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      fetchInterview()
    }
  }, [roomId, navigate])

  const copyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const saveFeedback = async (event) => {
    event.preventDefault()
    setSavingFeedback(true)
    setFeedbackMessage('')
    try {
      const response = await axios.post(
        `/api/applications/interviews/${interview.id}/feedback/`,
        feedbackDraft,
        getAuthConfig()
      )
      setInterview((current) => ({ ...current, feedback: response.data }))
      setFeedbackMessage('Feedback saved as a draft. Approve it when you are ready to share it with the candidate.')
    } catch (err) {
      setFeedbackMessage(err.response?.data?.detail || 'Unable to save interview feedback.')
    } finally {
      setSavingFeedback(false)
    }
  }

  const saveInterviewNotes = async () => {
    setSavingNotes(true)
    setNotesMessage('')
    try {
      await axios.patch(`/api/applications/interviews/${roomId}/notes/`, { notes }, getAuthConfig())
      setNotesMessage('Private interviewer notes saved.')
    } catch (err) {
      setNotesMessage(err.response?.data?.error || 'Unable to save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  const approveFeedback = async () => {
    try {
      const response = await axios.patch(
        `/api/applications/interviews/${interview.id}/feedback/`,
        { approve: true },
        getAuthConfig()
      )
      setInterview((current) => ({ ...current, feedback: response.data }))
      setFeedbackMessage('Feedback approved and shared with the candidate.')
    } catch (err) {
      setFeedbackMessage(err.response?.data?.detail || 'Unable to approve feedback.')
    }
  }

  const jitsiUrl = `https://meet.jit.si/${roomId}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false`

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 pt-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white pt-20">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-[98%] max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Video size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white sm:text-lg">
                  Live Video Interview Room
                </h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  Secured
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {interview?.job_title ? `Role: ${interview.job_title} • ` : ''}
                Candidate: {interview?.candidate_name || interview?.candidate_email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyRoomLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/20"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Link Copied!' : 'Copy Room Link'}
            </button>

            <button
              onClick={() => setIsNotesOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/20"
            >
              <FileText size={14} />
              {isNotesOpen ? 'Hide Notes' : 'Interview Notes'}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/90 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
            >
              <PhoneOff size={14} />
              Leave Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 bg-slate-900">
          <iframe
            src={jitsiUrl}
            title="Video Conference"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="h-full w-full border-0"
            style={{ minHeight: 'calc(100vh - 140px)' }}
          />
        </div>

        {/* Sidebar Notes & Candidate Info */}
        {isNotesOpen ? (
          <aside className="w-80 border-l border-white/10 bg-slate-900/95 p-5 backdrop-blur overflow-y-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Interview Brief
            </h3>

            <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
              <div>
                <span className="text-slate-400">Job Title</span>
                <p className="font-semibold text-white">{interview?.job_title || 'Software Engineer'}</p>
              </div>
              <div>
                <span className="text-slate-400">Candidate</span>
                <p className="font-semibold text-white">{interview?.candidate_name || interview?.candidate_email}</p>
              </div>
              <div>
                <span className="text-slate-400">Recruiter</span>
                <p className="font-semibold text-white">{interview?.employer_email}</p>
              </div>
              <div>
                <span className="text-slate-400">Scheduled Time</span>
                <p className="font-semibold text-white">
                  {interview?.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : 'Now'}
                </p>
              </div>
            </div>

            <h4 className="mt-6 text-sm font-bold text-slate-300">Quick Interviewer Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record candidate answers, technical strengths, culture fit, and rating..."
              rows={10}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-950 p-3 text-xs text-slate-100 outline-none focus:border-blue-500"
            />
            {userProfile?.role === 'employer' ? (
              <div className="mt-2">
                <button type="button" onClick={saveInterviewNotes} disabled={savingNotes} className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-60">{savingNotes ? 'Saving...' : 'Save private notes'}</button>
                {notesMessage ? <p role="status" className="mt-2 text-xs text-cyan-200">{notesMessage}</p> : null}
              </div>
            ) : null}

            <div className="mt-7 border-t border-white/10 pt-5">
              <h4 className="text-sm font-bold text-slate-200">Interview Feedback</h4>
              {userProfile?.role === 'employer' ? (
                <form onSubmit={saveFeedback} className="mt-3 space-y-3">
                  <label className="block text-xs text-slate-400">
                    Candidate rating
                    <select value={feedbackDraft.rating} onChange={(e) => setFeedbackDraft((current) => ({ ...current, rating: Number(e.target.value) }))} className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white">
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                    </select>
                  </label>
                  <textarea value={feedbackDraft.feedback} onChange={(e) => setFeedbackDraft((current) => ({ ...current, feedback: e.target.value }))} required minLength={10} maxLength={4000} rows={5} placeholder="Share concise, constructive interview feedback..." className="w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500" />
                  <button disabled={savingFeedback} className="w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{savingFeedback ? 'Saving...' : 'Save feedback draft'}</button>
                  {interview?.feedback && !interview.feedback.is_approved ? <button type="button" onClick={approveFeedback} className="w-full rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">Approve and share with candidate</button> : null}
                  {interview?.feedback?.is_approved ? <p className="text-xs font-semibold text-emerald-300">Approved and visible to candidate</p> : null}
                </form>
              ) : interview?.feedback?.is_approved ? (
                <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                  <p className="text-xs font-bold text-emerald-300">Rating: {interview.feedback.rating}/5</p>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{interview.feedback.feedback}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">The interviewer has not shared feedback yet.</p>
              )}
              {feedbackMessage ? <p role="status" className="mt-2 text-xs text-cyan-200">{feedbackMessage}</p> : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export default VideoInterview
