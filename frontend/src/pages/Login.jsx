import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const redirectByProfile = (profileData, role) => {
    if (profileData?.is_staff || profileData?.is_superuser) {
      navigate('/admin-dashboard')
      return
    }
    if (role === 'employer') {
      navigate('/employer')
      return
    }
    navigate('/dashboard')
  }

  const saveSessionAndRole = async (data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)

    let role = data?.user?.role
    if (data?.access) {
      try {
        const profileRes = await axios.get('/api/users/profile/', {
          headers: { Authorization: `Bearer ${data.access}` },
        })
        role = profileRes.data?.role || role
        localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
        redirectByProfile(profileRes.data, role)
        return
      } catch {
        role = role || null
      }
    }

    if (role) {
      localStorage.setItem('user_role', role)
    }

    redirectByProfile(null, role)
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
    return data?.detail || data?.message || 'Login failed. Please verify your credentials.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.post('/api/users/login/', { email, password })
      await saveSessionAndRole(response.data)
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message)
      setErrorMessage(extractErrorMessage(error))
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
      })
      await saveSessionAndRole(response.data)
    } catch (error) {
      console.error('Google Login Backend Error:', error.response?.data || error.message)
      setErrorMessage('Google sign-in could not be completed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Account access"
      title="Sign in to your account."
      description="Access your profile, job applications, and account settings from one place."
      sideTitle="Welcome back"
      sideDescription="Use your email and password or continue with Google to sign in."
      highlights={[
        'Sign in with email and password.',
        'Use Google for quick access.',
        'Available for job seekers and employers.',
      ]}
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>New here? Build your account in one step.</span>
          <Link to="/signup" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Create account
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
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            required
          />
        </label>

        <div className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            Secure session
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login-otp" className="inline-flex items-center gap-1 font-semibold text-blue-700 transition hover:text-cyan-600">
              <KeyRound className="h-4 w-4" />
              Login with OTP
            </Link>
            <Link to="/forget-password" className="font-semibold text-slate-700 transition hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
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
          text="signin_with"
          width="100%"
        />
      </div>
    </AuthShell>
  )
}

export default Login
