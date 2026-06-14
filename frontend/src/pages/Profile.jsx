import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Loader2, Save, Upload } from "lucide-react"
import { resolveMediaUrl } from "../utils/media"

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  role: "",
  profile_image: null,
  profile_image_url: "",
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
  const [formData, setFormData] = useState(defaultForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
        })
      } catch (err) {
        console.error("Failed to fetch profile:", err.response?.data || err.message)
        setError("Unable to load profile. Please check your login session.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, profile_image: file }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsSaving(true)

    try {
      const token = localStorage.getItem("access_token")
      const payload = new FormData()
      ;[
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
      ].forEach((field) => {
        payload.append(field, formData[field] ?? "")
      })

      if (formData.profile_image instanceof File) {
        payload.append("profile_image", formData.profile_image)
      }

      const response = await axios.patch("/api/users/profile/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const updated = response.data || {}
      setFormData((prev) => ({
        ...prev,
        ...updated,
        profile_image: null,
        profile_image_url: updated.profile_image_url || prev.profile_image_url,
      }))
      localStorage.setItem("user_profile", JSON.stringify(updated))
      setSuccessMsg("Profile updated successfully.")
    } catch (err) {
      console.error("Profile update failed:", err.response?.data || err.message)
      setError("Unable to update profile. Please verify field values and image sizes.")
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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8,_#06b6d4)] p-6 text-white shadow-[0_24px_60px_rgba(37,99,235,0.16)] sm:p-8">
          <p className="text-xs text-blue-100">Profile</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {isEmployer ? "Employer Profile Settings" : "Seeker Profile Settings"}
          </h2>
          <p className="text-blue-100 mt-2">Keep your profile complete to improve discoverability and trust.</p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] backdrop-blur sm:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={imagePreview || "https://via.placeholder.com/110"}
                alt="Profile"
                className="w-28 h-28 rounded-2xl object-cover border border-slate-200"
              />
              <label className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-blue-700 p-2 text-white shadow-lg">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`.trim()
                  : formData.email}
              </h1>
              <p className="text-slate-500 text-sm capitalize mt-1">
                {formData.role || "user"} profile
              </p>
              <p className="text-slate-400 text-sm">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <p className="md:col-span-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Basic Details</p>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder={isEmployer ? "Hiring headline" : "Professional headline"}
              className="md:col-span-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="About"
              rows={4}
              className="md:col-span-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
            />

            {isEmployer ? (
              <>
                <p className="md:col-span-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mt-2">Company Details</p>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation (HR, Founder, etc.)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleChange}
                  placeholder="Company website"
                  className="md:col-span-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </>
            ) : (
              <>
                <p className="md:col-span-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mt-2">Career Details</p>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Skills (comma separated)"
                  className="md:col-span-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="Education"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="Experience years"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ""}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url || ""}
                  onChange={handleChange}
                  placeholder="GitHub URL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </>
            )}
          </div>

          {error ? <p className="mt-5 text-sm text-rose-600">{error}</p> : null}
          {successMsg ? <p className="mt-5 text-sm text-cyan-700">{successMsg}</p> : null}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-white font-semibold hover:bg-blue-800 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
