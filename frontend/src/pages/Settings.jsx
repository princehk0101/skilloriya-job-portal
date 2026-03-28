import React, { useState } from 'react'
import { Shield, Bell, Moon, Globe, Save } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    email_notifications: true,
    job_alerts: true,
    profile_visibility: true,
    dark_mode: false,
  })

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#06b6d4)] p-8 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)]">
          <h1 className="text-3xl font-extrabold">Settings</h1>
          <p className="mt-2 text-blue-100">Control your account preferences and privacy.</p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <button onClick={() => handleToggle('email_notifications')} className="w-full flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
              <span className="inline-flex items-center gap-2 text-slate-700"><Bell size={16} className="text-blue-600" /> Email Notifications</span>
              <span className={`text-sm font-semibold ${settings.email_notifications ? 'text-cyan-600' : 'text-slate-400'}`}>{settings.email_notifications ? 'ON' : 'OFF'}</span>
            </button>
            <button onClick={() => handleToggle('job_alerts')} className="w-full flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
              <span className="inline-flex items-center gap-2 text-slate-700"><Globe size={16} className="text-blue-600" /> Job Alerts</span>
              <span className={`text-sm font-semibold ${settings.job_alerts ? 'text-cyan-600' : 'text-slate-400'}`}>{settings.job_alerts ? 'ON' : 'OFF'}</span>
            </button>
            <button onClick={() => handleToggle('profile_visibility')} className="w-full flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
              <span className="inline-flex items-center gap-2 text-slate-700"><Shield size={16} className="text-blue-600" /> Profile Visibility</span>
              <span className={`text-sm font-semibold ${settings.profile_visibility ? 'text-cyan-600' : 'text-slate-400'}`}>{settings.profile_visibility ? 'ON' : 'OFF'}</span>
            </button>
            <button onClick={() => handleToggle('dark_mode')} className="w-full flex items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
              <span className="inline-flex items-center gap-2 text-slate-700"><Moon size={16} className="text-blue-600" /> Dark Mode</span>
              <span className={`text-sm font-semibold ${settings.dark_mode ? 'text-cyan-600' : 'text-slate-400'}`}>{settings.dark_mode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-white font-semibold hover:bg-blue-800">
            <Save size={16} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
