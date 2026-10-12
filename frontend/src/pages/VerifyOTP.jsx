import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { KeyRound, MailCheck, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const VerifyOTP = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState(location.state?.message || '')
  const [resendCooldown, setResendCooldown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      setCanResend(false)
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    } else {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const res = await axios.post('/api/users/verify-otp/', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      })

      if (res.data?.access) {
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        const role = res.data?.user?.role || location.state?.role || 'seeker'
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
        navigate('/login')
      }
    } catch (error) {
      console.error('Verify OTP failed:', error.response?.data || error.message)
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Invalid or expired code. Please verify or request a new OTP.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || !email) return
    setLoading(true)
    setErrorMessage('')
    setNotice('')

    try {
      await axios.post('/api/users/resend-verification-otp/', {
        email: email.trim().toLowerCase(),
      })
      setNotice('A fresh verification code was sent to your email. Please check your inbox & spam.')
      setResendCooldown(45)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Could not resend verification OTP right now. Please try again shortly.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Account Verification"
      title="Verify your email to activate your account."
      description="Enter the 6-digit one-time code sent to your email address to unlock verified job applications and candidate features."
      sideTitle="Enter Verification Code"
      sideDescription={
        email
          ? `We sent a 6-digit verification code to ${email}.`
          : 'Please enter your registered email and verification code below.'
      }
      highlights={[
        'Protected authentication with zero-trust token generation.',
        'Immediate access to your personalized job portal.',
        'Verified status to boost recruiter confidence.',
      ]}
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Entered the wrong email?</span>
          <Link to="/signup" className="font-semibold text-blue-700 transition hover:text-blue-900">
            Restart signup
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleVerify}>
        {/* Email Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs sm:text-sm text-blue-800">
          <MailCheck className="h-4 w-4 shrink-0 text-blue-600" />
          <div className="flex-1 truncate">
            <span className="font-medium text-slate-600">Verification email: </span>
            <strong className="font-bold text-blue-900">{email || 'Not provided'}</strong>
          </div>
        </div>

        {/* OTP Input */}
        <div>
          <label className="mb-2 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800">
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-600" />
              6-Digit OTP Code
            </span>
            <span className="text-xs font-normal text-slate-500">Check Inbox or Spam</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoFocus
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-2xl font-black tracking-[0.4em] text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            required
          />
        </div>

        {notice ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800">
            {notice}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Verifying Code...' : 'Verify & Continue'}
          <ArrowRight size={16} />
        </button>

        {/* Resend Action */}
        <div className="text-center pt-2">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Resend verification code
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-500">
              Resend code in <strong className="text-slate-800">{resendCooldown}s</strong>
            </span>
          )}
        </div>
      </form>
    </AuthShell>
  )
}

export default VerifyOTP

