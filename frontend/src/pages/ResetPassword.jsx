import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { LockKeyhole, MailCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const email = localStorage.getItem('reset_email')
  const otp = localStorage.getItem('reset_otp')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !otp || email === 'undefined') {
      navigate('/forget-password')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      await axios.post('/api/users/reset-password/', {
        email,
        otp,
        new_password: password.trim(),
      })
      localStorage.removeItem('reset_email')
      localStorage.removeItem('reset_otp')
      navigate('/login')
    } catch (error) {
      console.error('Reset Password Error:', error.response?.data || error.message)
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Error resetting password. Please try again.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Final step"
      title="Set a new password and complete account recovery."
      description="Create a new password below and return to login after the reset is complete."
      sideTitle="Create new password"
      sideDescription="Choose a strong password so your account stays secure and easy to access next time."
      highlights={[
        'Focused final step with no extra clutter.',
        'Ready for future password guidance if needed.',
        'Works with the same account recovery steps as the rest of the platform.',
      ]}
      footer={
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Want to restart recovery?</span>
          <Link to="/forget-password" className="font-semibold text-blue-700 transition hover:text-cyan-600">
            Back to forgot password
          </Link>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            <span>{email || 'Recovery session missing.'}</span>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <LockKeyhole className="h-4 w-4 text-blue-600" />
            New password
          </span>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ResetPassword
