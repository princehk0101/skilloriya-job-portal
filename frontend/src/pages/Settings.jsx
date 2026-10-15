import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Bell, Loader2, Save, Shield, Sparkles } from 'lucide-react'

const Settings = () => {
  const [jobEmailAlerts, setJobEmailAlerts] = useState(true)
  const [savedValue, setSavedValue] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  })

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await axios.get('/api/users/profile/', getAuthConfig())
        const enabled = response.data?.job_email_alerts !== false
        setJobEmailAlerts(enabled)
        setSavedValue(enabled)
      } catch (error) {
        setMessage('Sign in to load and manage your email alert preferences.')
      } finally {
        setLoading(false)
      }
    }
    loadPreferences()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await axios.patch('/api/users/profile/', { job_email_alerts: jobEmailAlerts }, getAuthConfig())
      setSavedValue(jobEmailAlerts)
      setMessage(jobEmailAlerts
        ? 'Personalized vacancy emails are turned on.'
        : 'Personalized vacancy emails are turned off.')
    } catch (error) {
      setMessage('Could not save this preference. Please sign in and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Centered Header with No BG */}
        <div className="text-center max-w-2xl mx-auto mb-8 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Sparkles size={14} />
            Account Preferences
          </span>
          <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            Email preferences
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl mx-auto">
            Choose whether Skilloriya should email you about new roles that fit your interests.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Personalized job alerts</h2>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setJobEmailAlerts((current) => !current)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white px-4 py-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50"
                aria-pressed={jobEmailAlerts}
              >
                <span>
                  <span className="flex items-center gap-2 font-semibold text-slate-800"><Bell size={17} className="text-blue-600" /> Email me matching vacancies</span>
                  <span className="mt-1 block pl-6 text-xs leading-5 text-slate-500">We use skills from your profile and roles you have applied for. We email you when an employer posts a relevant opening.</span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${jobEmailAlerts ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {jobEmailAlerts ? 'ON' : 'OFF'}
                </span>
              </button>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <Shield size={14} className="mt-0.5 shrink-0 text-blue-600" />
                This preference is saved to your account and stays the same when you sign in with an OTP.
              </p>

              {message ? <p role="status" className="mt-4 text-sm text-slate-600">{message}</p> : null}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || jobEmailAlerts === savedValue}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving…' : 'Save preference'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
