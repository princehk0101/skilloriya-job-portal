import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await axios.post('/api/users/forgot-password/', { email })
      navigate('/verify-reset-otp', { state: { email } })
    } catch (error) {
      console.error('Forgot password failed:', error.response?.data || error.message)
      setErrorMessage(error.response?.data?.detail || error.response?.data?.message || 'Failed to send OTP. Please check your email address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Recovery access"
      title="Start password recovery without extra friction."
      description="Enter your registered email and we will guide you into a short reset flow."
      sideTitle="Password recovery"
      sideDescription="Use the email linked to your account. The next step will confirm your code before you set a new password."
      highlights={[
        'Single-purpose screen with a clear next step.',
        'Cleaner visual continuity with the rest of the auth flow.',
        'Quick return to login if you remember your password midway.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Remembered your password?</span>
          <Link to="/login" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Back to login
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Mail className="h-4 w-4 text-blue-600" />
            Registered email
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

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ForgetPassword
