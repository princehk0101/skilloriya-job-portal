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
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export default VideoInterview
