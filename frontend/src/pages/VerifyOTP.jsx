import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { KeyRound, MailCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const res = await axios.post('/api/users/verify-otp/', { email, otp })
      if (res.data?.access) {
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        const role = res.data?.user?.role || 'seeker'
        localStorage.setItem('user_role', role)

        try {
          const profileRes = await axios.get('/api/users/profile/', {
            headers: { Authorization: `Bearer ${res.data.access}` },
          })
          localStorage.setItem('user_profile', JSON.stringify(profileRes.data))
        } catch {
          if (res.data?.user) {
            localStorage.setItem('user_profile', JSON.stringify(res.data.user))
          }
        }

        navigate(role === 'employer' ? '/employer' : '/dashboard')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Verify OTP failed:', error.response?.data || error.message)
      setErrorMessage(error.response?.data?.detail || error.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setErrorMessage('')
    setNotice('')
    try {
      await axios.post('/api/users/resend-verification-otp/', { email })
      setNotice('A new verification code has been sent. Check your inbox and spam folder.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not resend the code. Check the email and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Email verification"
      title="One quick verification step before your account goes live."
      description="Confirm the code sent to your email and move straight into login once your account is verified."
      sideTitle="Verify email"
      sideDescription={email ? `Verification code sent to ${email}.` : 'Signup email is missing. Please return and restart the signup flow.'}
      highlights={[
        'Focused verification screen with clear hierarchy.',
        'Fast path into login once the code is confirmed.',
        'Stable layout across desktop and mobile.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Need a different account?</span>
          <Link to="/signup" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Back to signup
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleVerify}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            <span>{email || 'We could not find your email details. Please start signup again.'}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <KeyRound className="h-4 w-4 text-blue-600" />
            Enter OTP
          </span>
          <input
            type="text"
            placeholder="6 digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {notice ? <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button type="button" onClick={handleResend} disabled={loading || !email} className="w-full text-sm font-semibold text-blue-700 hover:text-cyan-700 disabled:opacity-50">
          {loading ? 'Sending…' : 'Resend verification OTP'}
        </button>
      </form>
    </AuthShell>
  )
}

export default VerifyOTP
