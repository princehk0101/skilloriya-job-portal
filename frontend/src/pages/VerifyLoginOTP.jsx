import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { KeyRound, MailCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const VerifyLoginOTP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.post('/api/users/login-otp/verify/', { email, otp })
      await saveSessionAndRole(response.data)
    } catch (error) {
      console.error('OTP login verify failed:', error.response?.data || error.message)
      const data = error.response?.data
      const firstFieldError = Object.values(data || {}).find((value) => Array.isArray(value))
      setErrorMessage(
        firstFieldError?.[0] ||
        data?.detail ||
        data?.message ||
        data?.error ||
        'Failed to verify OTP. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Verify access"
      title="Enter the OTP and continue directly into your account."
      description="Confirm the code from your inbox and we will sign you in right away."
      sideTitle="Verify login OTP"
      sideDescription={email ? `OTP sent to ${email}.` : 'Email routing state is missing. Please restart the login OTP request flow.'}
      highlights={[
        'Sign in with the code sent to your email.',
        'No need to reset your password just to get back in.',
        'Works for both job seekers and employers.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Need a new OTP?</span>
          <Link to="/login-otp" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Back to request
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleVerify}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            <span>{email || 'We could not find your email details. Please request a new code.'}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <KeyRound className="h-4 w-4 text-blue-600" />
            Login OTP
          </span>
          <input
            type="text"
            placeholder="6 digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg tracking-[0.45em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Login with OTP'}
        </button>
      </form>
    </AuthShell>
  )
}

export default VerifyLoginOTP
