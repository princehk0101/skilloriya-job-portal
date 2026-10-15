import React, { useState } from 'react'
import {
  Chrome,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  FileText,
  User,
  Briefcase
} from 'lucide-react'

export default function ExtensionView() {
  const [copiedKey, setCopiedKey] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulatedFields, setSimulatedFields] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    experience: '',
    skills: '',
    portfolio: ''
  })
  const [simulatedSuccess, setSimulatedSuccess] = useState(false)

  const candidateProfile = {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@skilloriya.dev',
    phone: '+91 98765 43210',
    linkedin: 'https://linkedin.com/in/rahul-sharma',
    github: 'https://github.com/rahul-dev',
    experience: '3 Years',
    skills: 'React, Node.js, Python, PostgreSQL, Docker, AWS',
    portfolio: 'https://skilloriya.com/portfolio/rahul'
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText('sk_ext_live_99a8b7c6d5e4f3a2b1')
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleSimulateAutoFill = () => {
    setIsSimulating(true)
    setSimulatedSuccess(false)
    setSimulatedFields({
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      experience: '',
      skills: '',
      portfolio: ''
    })

    const keys = Object.keys(candidateProfile)
    keys.forEach((key, index) => {
      setTimeout(() => {
        setSimulatedFields(prev => ({
          ...prev,
          [key]: candidateProfile[key]
        }))
        if (index === keys.length - 1) {
          setIsSimulating(false)
          setSimulatedSuccess(true)
        }
      }, (index + 1) * 200)
    })
  }

  const handleDownloadExtension = () => {
    const dummyManifest = {
      name: "Skilloriya Auto-Fill & 1-Click Apply",
      version: "2.4.0",
      description: "Auto-fill job applications across LinkedIn, Indeed, Greenhouse, Lever, Workday with your Skilloriya profile.",
      manifest_version: 3
    }
    const blob = new Blob([JSON.stringify(dummyManifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'skilloriya-extension-v2.4.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-sm mb-4">
            <Chrome size={14} className="text-blue-300" />
            <span>Official Skilloriya Extension • v2.4.0 Live</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Auto-Fill Job Applications in 1-Click
          </h2>
          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed mb-6 max-w-2xl">
            Never type your name, skills, LinkedIn, or experience manually again. Our smart browser extension detects application forms across 50+ job boards and auto-fills them in 0.5 seconds.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadExtension}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-900 shadow-md transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95"
            >
              <Download size={16} className="text-blue-700" />
              Download Extension Package
            </button>
            <button
              onClick={handleSimulateAutoFill}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-300/40 bg-blue-700/40 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-blue-700/60 active:scale-95"
            >
              <Zap size={16} className="text-amber-300" />
              {isSimulating ? 'Simulating Autofill...' : 'Try Interactive Demo'}
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none text-white">
          <Chrome size={280} />
        </div>
      </div>

      {/* Interactive Simulator & Sync Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Extension Settings & Token */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[1.75rem] border border-[#e5e0d4] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Extension Sync Token
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste this token once into the extension popup to sync your Skilloriya profile and saved resumes.
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <code className="text-xs font-mono text-slate-800 flex-1 truncate">
                sk_ext_live_99a8b7c6d5e4f3a2b1
              </code>
              <button
                onClick={handleCopyToken}
                className="shrink-0 flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
              >
                {copiedKey ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Profile Synced
                </span>
                <span className="font-semibold text-slate-800">Ready</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Default Resume
                </span>
                <span className="font-semibold text-slate-800">Master_Resume.pdf</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> AI Cover Letter
                </span>
                <span className="font-semibold text-emerald-700">Enabled</span>
              </div>
            </div>
          </div>

          {/* Supported Portals */}
          <div className="rounded-[1.75rem] border border-[#e5e0d4] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              Supported Job Boards & ATS
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Workday', 'Wellfound', 'Naukri', 'Skilloriya Native'].map((board) => (
                <div key={board} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 font-medium text-slate-700">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>{board}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Demo Box */}
        <div className="lg:col-span-7">
          <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 md:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <span className="inline-block text-[10px] font-bold tracking-wider text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                  Live Preview Simulator
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Sample Job Application Form
                </h3>
              </div>

              <button
                onClick={handleSimulateAutoFill}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
              >
                <Zap size={14} className="text-amber-300" />
                {isSimulating ? 'Filling Form...' : 'Click to Auto-Fill'}
              </button>
            </div>

            {simulatedSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Form successfully auto-filled in 0.4 seconds from your Skilloriya profile!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={simulatedFields.fullName}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={simulatedFields.email}
                    placeholder="e.g. rahul@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    readOnly
                    value={simulatedFields.phone}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Total Experience</label>
                  <input
                    type="text"
                    readOnly
                    value={simulatedFields.experience}
                    placeholder="3 Years"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    readOnly
                    value={simulatedFields.linkedin}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GitHub / Portfolio</label>
                  <input
                    type="text"
                    readOnly
                    value={simulatedFields.github}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Key Skills & Technologies</label>
                <input
                  type="text"
                  readOnly
                  value={simulatedFields.skills}
                  placeholder="React, Python, AWS, Docker..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500">
                <FileText size={16} className="mx-auto mb-1 text-slate-400" />
                Resume Attached: <span className="font-semibold text-slate-700">{simulatedFields.fullName ? 'Master_Resume_Rahul_Sharma.pdf (Auto-attached)' : 'No file attached'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="rounded-[1.75rem] border border-[#e5e0d4] bg-white p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Laptop size={20} className="text-blue-600" />
          Easy 3-Step Browser Setup
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Download Package</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click the download button above to get the latest Skilloriya browser extension package and extract it to a folder.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Enable Developer Mode</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open Chrome and navigate to <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">chrome://extensions</code>, then toggle the "Developer mode" switch in the top-right.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Load & Auto-Apply</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click "Load unpacked", choose the folder, and enter your Sync Token. Any job portal form will now show the 1-click Auto-Fill button!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
