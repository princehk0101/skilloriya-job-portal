import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, Send } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const LoginWithOTP = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await axios.post('/api/users/login-otp/request/', { email })
      navigate('/login-otp/verify', { state: { email } })
    } catch (error) {
      console.error('Login OTP request failed:', error.response?.data || error.message)
      const data = error.response?.data
      const firstFieldError = Object.values(data || {}).find((value) => Array.isArray(value))
      setErrorMessage(
        firstFieldError?.[0] ||
        data?.detail ||
        data?.message ||
        data?.error ||
        'Failed to send OTP. Please verify your email.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="OTP access"
      title="Login without a password using a one-time email code."
      description="If you do not remember your password right now, you can still sign in quickly with a code sent to your email."
      sideTitle="Request login OTP"
      sideDescription="Enter your registered email, receive a one-time code, and continue securely."
      highlights={[
        'Quick access when password is not available.',
        'Request a code and sign in quickly.',
        'Works smoothly for both job seekers and employers.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Prefer password login?</span>
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
            Verified email
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
          {loading ? 'Sending OTP...' : 'Send Login OTP'}
        </button>
      </form>
    </AuthShell>
  )
}

export default LoginWithOTP
