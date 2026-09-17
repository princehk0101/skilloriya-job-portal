import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Check, Sparkles, Zap, Shield, Crown, Building2, User, Loader2, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Pricing = () => {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [currentPlan, setCurrentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'annual'
  const [loading, setLoading] = useState(true)
  const [activatingId, setActivatingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/users/subscriptions/', getAuthConfig())
      setPlans(res.data.plans || [])
      setCurrentPlan(res.data.current_plan || 'free')
    } catch {
      // Fallback local plans if offline
      setPlans([
        {
          id: 'free',
          name: 'Free Starter',
          price: 0,
          billing: 'Forever free',
          role_target: 'both',
          popular: false,
          features: [
            'Search and apply to unlimited standard jobs',
            'Basic profile with portfolio & resume upload',
            'Take skill assessments and earn badges',
            'Basic job alerts and notification bell'
          ]
        },
        {
          id: 'pro_seeker',
          name: 'Pro Seeker',
          price: 499,
          billing: 'per month',
          role_target: 'seeker',
          popular: true,
          features: [
            'AI Resume Parser & Auto Profile Enhancer',
            'Real-time AI Match Score on every job',
            'Highlighted Gold Candidate badge on applications',
            'Direct in-app messaging with recruiters',
            'Priority applicant ranking in recruiter lists'
          ]
        },
        {
          id: 'recruiter_pro',
          name: 'Recruiter Pro',
          price: 1999,
          billing: 'per month',
          role_target: 'employer',
          popular: true,
          features: [
            'Post unlimited active job listings',
            '3 Featured / Boosted job listings included',
            'Interactive Kanban applicant pipeline',
            'Built-in WebRTC Video Interview Scheduler',
            'Direct chat with candidates'
          ]
        },
        {
          id: 'enterprise',
          name: 'Enterprise Unlimited',
          price: 4999,
          billing: 'per month',
          role_target: 'employer',
          popular: false,
          features: [
            'All Recruiter Pro features included',
            'Verified Employer Blue Badge',
            'Unlimited Boosted job listings',
            'Top search visibility across categories',
            'Dedicated hiring manager support'
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleActivate = async (planId) => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    setActivatingId(planId)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await axios.post(
        '/api/users/subscriptions/activate/',
        { plan_id: planId },
        getAuthConfig()
      )
      setCurrentPlan(res.data.plan)
      setSuccessMsg(res.data.message || 'Subscription updated successfully!')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Unable to update subscription.')
    } finally {
      setActivatingId(null)
    }
  }

  const getPlanIcon = (id) => {
    switch (id) {
      case 'pro_seeker':
        return <Sparkles className="text-cyan-400" size={24} />
      case 'recruiter_pro':
        return <Zap className="text-amber-400" size={24} />
      case 'enterprise':
        return <Crown className="text-purple-400" size={24} />
      default:
        return <Shield className="text-blue-400" size={24} />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8 bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Sparkles size={14} />
            Skilloria Membership & Monetization
          </span>
          <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            Supercharge your career & hiring with <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">Skilloria Pro</span>
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Choose the plan that fits your growth. Unlock AI parsing, real-time match recommendations, video interviews, and priority hiring.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing <span className="ml-1 text-[10px] text-cyan-200 uppercase font-black tracking-wider">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-semibold text-emerald-800 shadow-sm">
            ✓ {successMsg}
          </div>
        ) : null}
        {errorMsg ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm font-semibold text-rose-800 shadow-sm">
            {errorMsg}
          </div>
        ) : null}

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const price =
              billingCycle === 'annual' && plan.price > 0
                ? Math.round(plan.price * 0.8)
                : plan.price

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-300 ${
                  plan.popular
                    ? 'border-2 border-blue-500 bg-[linear-gradient(135deg,_#10203a,_#1e40af,_#0ea5e9)] text-white shadow-[0_24px_60px_rgba(37,99,235,0.22)] -translate-y-2'
                    : 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {plan.popular ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-md">
                    Most Popular
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      plan.popular ? 'bg-white/10' : 'bg-blue-50'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    {isCurrent ? (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        Active Plan
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      ₹{price.toLocaleString()}
                    </span>
                    <span className={`text-xs ${plan.popular ? 'text-blue-100' : 'text-slate-500'}`}>
                      {plan.price === 0 ? 'forever' : `/${billingCycle === 'annual' ? 'mo (billed yearly)' : 'month'}`}
                    </span>
                  </div>

                  <div className={`mt-6 h-px w-full ${plan.popular ? 'bg-white/15' : 'bg-slate-100'}`} />

                  {/* Features Checklist */}
                  <ul className="mt-6 space-y-3.5 text-sm">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          plan.popular ? 'bg-cyan-400/20 text-cyan-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className={plan.popular ? 'text-blue-50' : 'text-slate-600'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-2xl bg-white/20 py-3.5 text-center text-sm font-bold text-white cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(plan.id)}
                      disabled={activatingId === plan.id}
                      className={`w-full rounded-2xl py-3.5 text-center text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                        plan.popular
                          ? 'bg-white text-blue-800 hover:bg-blue-50'
                          : 'bg-slate-900 text-white hover:bg-blue-600'
                      }`}
                    >
                      {activatingId === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>{plan.price === 0 ? 'Switch to Free' : 'Upgrade Plan'}</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust & FAQ Section */}
        <div className="mt-20 rounded-[2.5rem] border border-blue-100 bg-white/90 p-8 sm:p-12 shadow-sm">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="p-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Shield size={24} />
              </div>
              <h4 className="mt-4 font-bold text-slate-900">Secure & Instant</h4>
              <p className="mt-1 text-sm text-slate-500">Upgrade anytime. Instant feature activation on your profile.</p>
            </div>
            <div className="p-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                <Zap size={24} />
              </div>
              <h4 className="mt-4 font-bold text-slate-900">AI Powered Efficiency</h4>
              <p className="mt-1 text-sm text-slate-500">Save 80% time parsing resumes & matching suitable roles.</p>
            </div>
            <div className="p-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Sparkles size={24} />
              </div>
              <h4 className="mt-4 font-bold text-slate-900">100% Satisfaction</h4>
              <p className="mt-1 text-sm text-slate-500">Cancel or switch your tier anytime with single-click ease.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
