import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { Briefcase, LockKeyhole, Mail } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const EmployerSignup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'employer', company_name: '' })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showLoginLink, setShowLoginLink] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const extractErrorMessage = (error) => {
    if (!error.response) {
      return 'We could not reach the server. Please try again in a moment.'
    }

    const data = error.response.data
    if (typeof data === 'string') {
      return data
    }

    const firstFieldError = Object.values(data || {}).find((value) => Array.isArray(value))
    if (firstFieldError?.length) {
      return firstFieldError[0]
    }

    return data?.detail || data?.message || 'Signup failed. Please verify your inputs.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setShowLoginLink(false)

    try {
      const payload = {
        role: formData.role,
        password: formData.password,
        email: formData.email,
        company_name: formData.company_name
      }
      const response = await axios.post('/api/users/register/', payload)
      if (response.data?.access) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        const role = response.data?.user?.role || formData.role || 'employer'
        localStorage.setItem('user_role', role)

        try {
          const profileRes = await axios.get('/api/users/profile/', {
            headers: { Authorization: `Bearer ${response.data.access}` },
          })
          localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
        } catch {
          if (response.data?.user) {
            localStorage.setItem('user_profile', JSON.stringify(response.data.user))
          }
        }

        navigate(role === 'employer' ? '/employer' : '/dashboard')
        return
      }

      if (response.data.verification_email_sent === false) {
        setErrorMessage(response.data.message)
        setShowLoginLink(true)
      } else {
        navigate('/VerifyOTP', { state: { email: formData.email } })
      }
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message)
      const message = extractErrorMessage(error)
      setErrorMessage(message)
      setShowLoginLink(
        message.toLowerCase().includes('already exists') || error.response?.status === 429,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.post('/api/users/google-login/', {
        token: credentialResponse.credential,
        role: formData.role,
      })
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      const role = response.data?.user?.role || formData.role || 'seeker'
      localStorage.setItem('user_role', role)
      navigate(role === 'employer' ? '/employer' : '/dashboard')
    } catch (error) {
      console.error('Google Login Backend Error:', error.response?.data || error.message)
      const backendMessage = error.response?.data?.error || 'Google signup could not be completed. Please try again.'
      setErrorMessage(backendMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Employer Registration"
      title="Create your Recruiter account."
      description="Register your company to start posting jobs and hiring talent."
      sideTitle="Start your hiring journey"
      sideDescription="Enter your details and company name to get started."
      highlights={[
        'Post job listings easily.',
        'Review and manage applicants.',
        'Wait for admin approval before posting.',
      ]}
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Already registered?</span>
          <Link to="/employer/login" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Employer Login
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Mail className="h-4 w-4 text-blue-600" />
            Email
          </span>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <LockKeyhole className="h-4 w-4 text-cyan-600" />
            Password
          </span>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            required
          />
        </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              Company Name
            </span>
            <input
              type="text"
              name="company_name"
              placeholder="e.g. Acme Corp"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>

        {errorMessage ? (
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p>{errorMessage}</p>
            {showLoginLink ? (
              <Link to="/login" className="inline-block font-bold text-blue-700 underline">
                {errorMessage.toLowerCase().includes('already exists')
                  ? 'This email already has an account. Sign in instead.'
                  : 'Already have an account? Try signing in.'}
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Or continue with
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setErrorMessage('Failed to initiate Google login. Please try again.')}
          theme="outline"
          shape="pill"
          text="signup_with"
          width="100%"
        />
      </div>
    </AuthShell>
  )
}

export default EmployerSignup
