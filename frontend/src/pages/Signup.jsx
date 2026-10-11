import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { LockKeyhole, Mail } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'seeker', company_name: '' })
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
      badge="Job Seeker Registration"
      title="Create your account."
      description="Register as a job seeker to start applying for jobs."
      sideTitle="Start your career journey"
      sideDescription="Enter your details to create a job seeker account."
      highlights={[
        'Apply to top jobs in one click.',
        'Track application status in real time.',
        'Set up personalized job alerts.',
      ]}
      footer={
        <div className="flex flex-col gap-4 text-sm text-slate-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Already registered?</span>
            <Link to="/login" className="font-semibold text-blue-700 transition hover:text-cyan-600">
              Go to login
            </Link>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
            <span>Are you a recruiter?</span>
            <div className="flex gap-3">
              <Link to="/employer/login" className="font-semibold text-emerald-700 transition hover:text-emerald-600">
                Employer Login
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/employer/signup" className="font-semibold text-emerald-700 transition hover:text-emerald-600">
                Employer Signup
              </Link>
            </div>
          </div>
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

export default Signup
