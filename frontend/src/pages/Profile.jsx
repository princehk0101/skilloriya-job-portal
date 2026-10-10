import React, { useEffect, useMemo, useState, useRef } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import {
  Loader2,
  Save,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Briefcase,
  GraduationCap,
  Building2,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  Sparkles,
  Award,
  Zap,
} from "lucide-react"
import { resolveMediaUrl } from "../utils/media"

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  role: "",
  profile_image: null,
  profile_image_url: "",
  resume: null,
  resume_url: "",
  phone_number: "",
  location: "",
  headline: "",
  bio: "",
  skills: "",
  experience_years: 0,
  education: "",
  company_name: "",
  designation: "",
  website: "",
  linkedin_url: "",
  github_url: "",
}

const Profile = () => {
  const navigate = useNavigate()
  const aiFileInputRef = useRef(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isParsingAI, setIsParsingAI] = useState(false)
  const [badges, setBadges] = useState([])
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const isEmployer = formData.role === "employer"

  const imagePreview = useMemo(() => {
    if (formData.profile_image instanceof File) {
      return URL.createObjectURL(formData.profile_image)
    }
    return resolveMediaUrl(formData.profile_image_url)
  }, [formData.profile_image, formData.profile_image_url])

  useEffect(() => {
    return () => {
      if (formData.profile_image instanceof File) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview, formData.profile_image])

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await axios.get("/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = response.data || {}
        localStorage.setItem("user_role", data.role || "seeker")
        localStorage.setItem("user_profile", JSON.stringify(data))
        setFormData({
          ...defaultForm,
          ...data,
          profile_image: null,
          resume: null,
        })

        if (data.role !== 'employer') {
          try {
            const [badgesRes, recRes] = await Promise.allSettled([
              axios.get("/api/skills/my-badges/", { headers: { Authorization: `Bearer ${token}` } }),
              axios.get("/api/ai/recommended-jobs/", { headers: { Authorization: `Bearer ${token}` } }),
            ])
            if (badgesRes.status === 'fulfilled') {
              setBadges(badgesRes.value.data?.badges || [])
            }
            if (recRes.status === 'fulfilled') {
              setTopSuggestions(recRes.value.data || [])
            }
          } catch (bErr) {
            // Non-blocking
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err.response?.data || err.message)
        setError("Unable to load profile. Please check your login session.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const [topSuggestions, setTopSuggestions] = useState([])

  const handleAIResumeParse = async (fileToParse) => {
    const file = fileToParse || formData.resume
    if (!file) {
      if (aiFileInputRef.current) {
        aiFileInputRef.current.click()
      }
      return
    }

    setIsParsingAI(true)
    setError("")
    setSuccessMsg("")

    try {
      const token = localStorage.getItem("access_token")
      const payload = new FormData()
      payload.append("resume", file)

      const res = await axios.post("/api/users/resume-parse/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const extracted = res.data?.parsed_data || {}
      
      // Split name into first and last if needed
      let fName = formData.first_name
      let lName = formData.last_name
      if (extracted.name && (!fName || !lName)) {
        const parts = extracted.name.trim().split(" ")
        if (parts.length > 1) {
          fName = fName || parts[0]
          lName = lName || parts.slice(1).join(" ")
        } else {
          fName = fName || extracted.name
        }
      }

      const skillsStr = Array.isArray(extracted.skills)
        ? extracted.skills.join(", ")
        : extracted.skills || formData.skills

      setFormData((prev) => ({
        ...prev,
        first_name: fName || prev.first_name,
        last_name: lName || prev.last_name,
        email: extracted.email || prev.email,
        phone_number: extracted.phone || prev.phone_number,
        skills: skillsStr || prev.skills,
        education: extracted.education || prev.education,
        experience_years: extracted.experience_years !== undefined && extracted.experience_years !== null
          ? extracted.experience_years
          : prev.experience_years,
        headline: extracted.headline || prev.headline,
        bio: extracted.bio || prev.bio,
        resume: file,
      }))

      setSuccessMsg(`✨ AI Resume parsed! Auto-extracted skills (${extracted.skills?.length || 0} found), education & experience. We found top applicant jobs matching your skills below!`)

      // Auto fetch recommended jobs based on newly extracted skills
      try {
        const recRes = await axios.get("/api/ai/recommended-jobs/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTopSuggestions(recRes.data || [])
      } catch {
        // non-blocking
      }
    } catch (err) {
      console.error("AI Resume parsing failed:", err.response?.data || err.message)
      setError(err.response?.data?.message || "Failed to parse resume with AI. You can still enter details manually.")
    } finally {
      setIsParsingAI(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile image size exceeds 5MB limit.")
        return
      }
      setFormData((prev) => ({ ...prev, profile_image: file }))
      setError("")
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Resume file size exceeds 10MB limit.")
        return
      }
      const ext = file.name.split(".").pop().toLowerCase()
      if (!["pdf", "doc", "docx"].includes(ext)) {
        setError("Only PDF, DOC, or DOCX formats are allowed for resume.")
        return
      }
      setFormData((prev) => ({ ...prev, resume: file }))
      setError("")
    }
  }

  const removeSelectedResume = () => {
    setFormData((prev) => ({ ...prev, resume: null }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsSaving(true)

    try {
      const token = localStorage.getItem("access_token")
      const payload = new FormData()

      const fieldsToSend = [
        "first_name",
        "last_name",
        "phone_number",
        "location",
        "headline",
        "bio",
        "skills",
        "experience_years",
        "education",
        "company_name",
        "designation",
        "website",
        "linkedin_url",
        "github_url",
      ]

      fieldsToSend.forEach((field) => {
        const val = formData[field]
        payload.append(field, val !== null && val !== undefined ? String(val) : "")
      })

      if (formData.profile_image instanceof File) {
        payload.append("profile_image", formData.profile_image)
      }

      if (formData.resume instanceof File) {
        payload.append("resume", formData.resume)
      }

      const response = await axios.patch("/api/users/profile/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let axios set multipart boundary automatically
        },
      })

      const updated = response.data || {}
      setFormData((prev) => ({
        ...prev,
        ...updated,
        profile_image: null,
        resume: null,
        profile_image_url: updated.profile_image_url || prev.profile_image_url,
        resume_url: updated.resume_url || prev.resume_url,
      }))

      localStorage.setItem("user_profile", JSON.stringify(updated))
      setSuccessMsg("Profile & details updated successfully! 🎉")

      // Refresh top applicant recommendations based on updated skills
      if (updated.role !== 'employer') {
        axios.get("/api/ai/recommended-jobs/", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => setTopSuggestions(r.data || [])).catch(() => {})
      }
    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message)
      const data = err.response?.data
      let detailedMsg = "Unable to update profile. Please verify your entries."

      if (typeof data === "string") {
        detailedMsg = data
      } else if (data && typeof data === "object") {
        if (data.message) {
          detailedMsg = data.message
        } else if (data.detail) {
          detailedMsg = data.detail
        } else {
          const fieldErrors = Object.entries(data).map(([key, msgs]) => {
            const label = key.replace(/_/g, " ")
            const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs)
            return `${label}: ${text}`
          })
          if (fieldErrors.length > 0) {
            detailedMsg = fieldErrors.join(" | ")
          }
        }
      }
      setError(detailedMsg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner Header */}
        <div className="mb-6 rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#06b6d4)] p-6 sm:p-8 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                {isEmployer ? "Employer Account" : "Job Seeker Account"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                {isEmployer ? "Company & Recruiter Profile" : "Candidate Profile & Resume"}
              </h2>
              <p className="text-blue-100 mt-2 text-sm max-w-xl">
                {isEmployer
                  ? "Update your organization profile so job seekers know who is hiring."
                  : "Keep your skills, resume, and experience up-to-date for employers and fast 1-click applications."}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {formData.email}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-blue-100 bg-white/95 p-6 sm:p-8 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur"
        >
          {/* Avatar & Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group self-start sm:self-auto">
              <img
                src={imagePreview || "https://via.placeholder.com/120"}
                alt="Profile"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-200 shadow-md transition-all group-hover:opacity-90"
              />
              <label
                title="Upload profile picture"
                className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-blue-600 p-2.5 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              >
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`.trim()
                  : formData.email}
              </h1>
              <p className="text-slate-600 text-sm font-medium capitalize mt-1 flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {formData.role || "Seeker"}
                </span>
                {formData.headline && <span className="truncate">• {formData.headline}</span>}
              </p>
              <p className="text-slate-400 text-xs mt-1">{formData.email}</p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="mt-8 space-y-8">
            {/* Section 1: Basic Details */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                Basic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name</label>
                  <input
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
                  <input
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    placeholder="e.g. Doe"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Phone Number
                  </label>
                  <input
                    name="phone_number"
                    value={formData.phone_number || ""}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> Location / City
                  </label>
                  <input
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Headline</label>
                  <input
                    name="headline"
                    value={formData.headline || ""}
                    onChange={handleChange}
                    placeholder={isEmployer ? "e.g. Senior Tech Recruiter at Acorn Labs" : "e.g. Full-Stack Developer | Python & React Specialist"}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">About / Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                    placeholder="Brief overview about your professional background, goals, or hiring scope..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Seeker or Employer Specific Details */}
            {isEmployer ? (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Company & Role Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company Name</label>
                    <input
                      name="company_name"
                      value={formData.company_name || ""}
                      onChange={handleChange}
                      placeholder="e.g. Acme Tech Pvt Ltd"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Designation</label>
                    <input
                      name="designation"
                      value={formData.designation || ""}
                      onChange={handleChange}
                      placeholder="e.g. Talent Acquisition Lead"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <Globe size={13} className="text-slate-400" /> Company Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-600" />
                    Career, Education & Resume
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAIResumeParse()}
                    disabled={isParsingAI}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,_#2563eb,_#06b6d4)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {isParsingAI ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        AI Parsing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Auto-Fill with AI
                      </>
                    )}
                  </button>
                </h3>

                {/* Hidden input for AI parse from separate upload */}
                <input
                  type="file"
                  ref={aiFileInputRef}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleAIResumeParse(f)
                  }}
                />

                {/* Smart AI Resume Parser Card (Unified) */}
                <div className="mt-4 overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-[linear-gradient(135deg,_#eff6ff,_#f0fdf4)] p-6 transition-all hover:bg-blue-50/70 relative">
                  {isParsingAI && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Loader2 size={32} className="animate-spin text-blue-600" />
                          <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
                        </div>
                        <p className="mt-3 font-bold text-sm text-blue-900">AI is extracting your details...</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">Skills, Experience, Education</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-2xl bg-blue-600 p-3.5 text-white shadow-lg relative">
                        <Zap size={24} />
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1 border-2 border-white">
                          <Sparkles size={10} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                          Smart AI Resume Parser <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-200">Recommended</span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 max-w-md leading-relaxed">
                          Upload your resume to automatically extract and populate your key skills, education, experience, and bio in seconds!
                        </p>
                        
                        {/* Current Resume Status */}
                        {(formData.resume_url || formData.resume) && (
                          <div className="mt-3 pt-3 border-t border-blue-100/50 flex flex-wrap items-center gap-3">
                            {formData.resume_url && !formData.resume && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                  <FileCheck size={14} /> AI Parsed & Saved
                                </span>
                                <a
                                  href={resolveMediaUrl(formData.resume_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  View Current <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                            {formData.resume instanceof File && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-800">
                                  <FileText size={14} /> {formData.resume.name} ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <button
                                  type="button"
                                  onClick={removeSelectedResume}
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <label className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-blue-700 shadow-sm border-2 border-blue-200 cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-400 hover:shadow-md ${isParsingAI ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload size={16} />
                      {formData.resume_url || formData.resume ? "Replace & Parse Again" : "Select Resume"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleAIResumeParse(f)
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Key Skills (comma separated)
                    </label>
                    <input
                      name="skills"
                      value={formData.skills || ""}
                      onChange={handleChange}
                      placeholder="e.g. Python, Django, React, FastAPI, SQL, AWS, Docker"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-slate-400" /> College / Education
                    </label>
                    <input
                      name="education"
                      value={formData.education || ""}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech in CSE, Bundelkhand University"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      name="experience_years"
                      value={formData.experience_years ?? 0}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Verified Skill Badges Shelf */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Award size={15} className="text-amber-500" /> My Verified Skill Badges
                    </h4>
                    <Link
                      to="/assessments"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      Take Tests & Earn Badges →
                    </Link>
                  </div>

                  {badges.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
                      <p className="text-xs text-slate-500">No skill badges earned yet. Complete 10-minute skill tests to verify your expertise to recruiters!</p>
                      <Link
                        to="/assessments"
                        className="inline-flex items-center gap-1.5 mt-2.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                      >
                        <Award size={13} /> Browse Skill Assessments
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3"
                        >
                          <div className="rounded-lg bg-amber-500 text-white p-2 shadow-sm shrink-0">
                            <Award size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-xs text-slate-900 truncate">{b.assessment_title}</p>
                              <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                {b.score_percentage}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 capitalize">{b.level} Level • {new Date(b.passed_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Applicant Suggestions Shelf (Based on Resume / Skills) */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-cyan-500" />
                        🎯 Top Applicant Roles Based on Your Skills
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Positions where your resume & skill set give you a high match advantage. Test your skill to rank #1!
                      </p>
                    </div>
                    <Link
                      to="/assessments"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline shrink-0"
                    >
                      <Award size={13} /> Play Skill Test →
                    </Link>
                  </div>

                  {topSuggestions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 p-5 text-center">
                      <Sparkles size={28} className="mx-auto text-cyan-400 mb-2" />
                      <p className="text-xs font-bold text-slate-800">Unlock "Top Applicant" Match Suggestions</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                        Add your key technical skills above or use the "Auto-Fill with AI" button with your resume to see recommended roles and play skill tests.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {topSuggestions.slice(0, 4).map((job) => {
                        const match = job.ai_match || {}
                        const isTop = match.is_top_applicant || (match.match_score >= 60)
                        return (
                          <div
                            key={job.id}
                            className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-[linear-gradient(135deg,_#f8fbff,_#ffffff)] p-4 shadow-sm hover:border-blue-300 transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  isTop
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                                    : 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                                }`}>
                                  <Zap size={10} className="text-amber-600 fill-amber-500" />
                                  {isTop ? '🏆 Top Applicant' : 'Matched Candidate'} ({match.match_score || 75}%)
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700">
                                  ₹{Number(job.salary || 0).toLocaleString('en-IN')} / year
                                </span>
                              </div>

                              <h5 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{job.title}</h5>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {job.employer_name || 'Top AI Company'} • {job.location || 'Remote'}
                              </p>

                              {match.matched_skills && match.matched_skills.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1">
                                  {match.matched_skills.slice(0, 3).map((sk, idx) => (
                                    <span key={idx} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                                      ✓ {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <Link
                                to="/assessments"
                                className="inline-flex items-center gap-1 rounded-xl bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 transition-all"
                                title="Play skill test to rank #1"
                              >
                                🎯 Play Skill
                              </Link>
                              <Link
                                to={`/apply/${job.id}`}
                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-sm transition-all"
                              >
                                ⚡ Apply Now
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Social & Portfolio Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Globe size={16} className="text-blue-600" />
                Social & Portfolio Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Linkedin size={13} className="text-[#0A66C2]" /> LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Github size={13} className="text-slate-800" /> GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {error ? (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">Update Failed</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          ) : null}

          {successMsg ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          ) : null}

          {/* Submit Button */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#1d4ed8)] px-7 py-3 text-white font-bold text-sm shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.35)] hover:bg-blue-700 disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
