import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { KeyRound, MailCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const VerifyResetOTP = () => {
  const [otp, setOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      navigate('/forget-password')
    }
  }, [email, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!otp) {
      setErrorMessage('Please enter OTP.')
      return
    }

    localStorage.setItem('reset_email', email)
    localStorage.setItem('reset_otp', otp)
    navigate('/reset-password')
  }

  return (
    <AuthShell
      badge="Recovery verification"
      title="Confirm your reset code and continue to the new password step."
      description="Enter the code from your inbox to keep moving through the recovery flow."
      sideTitle="Check your inbox"
      sideDescription={email ? `OTP sent to ${email}.` : 'Email information is missing, so you will be sent back to password recovery.'}
      highlights={[
        'Clear reset progression from email to code to new password.',
        'Focused layout with no extra distractions.',
        'Follows the same account recovery flow used across the platform.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Entered the wrong email?</span>
          <Link to="/forget-password" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Start over
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            <span>{email || 'Email not available.'}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <KeyRound className="h-4 w-4 text-blue-600" />
            Reset OTP
          </span>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value)
              if (errorMessage) {
                setErrorMessage('')
              }
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-xl font-bold tracking-[0.45em] text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!email}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue to Reset Password
        </button>
      </form>
    </AuthShell>
  )
}

export default VerifyResetOTP
