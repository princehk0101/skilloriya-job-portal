import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  Briefcase,
  Target,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

export default function ProgressView() {
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('devsunite_streak') || '5', 10)
  })
  const [checkedToday, setCheckedToday] = useState(() => {
    return localStorage.getItem('devsunite_streak_logged') === 'true'
  })

  const [dailyGoals, setDailyGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('devsunite_daily_goals')
      return saved
        ? JSON.parse(saved)
        : [
            { id: 1, text: 'Solve 2 LeetCode Mediums (Sliding Window / Graphs)', done: true },
            { id: 2, text: 'Review 1 System Design architectural case study', done: true },
            { id: 3, text: 'Apply to 3 tailored software engineer roles', done: false },
            { id: 4, text: 'Run 1 AI Mock Interview question on React / Systems', done: false },
          ]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('devsunite_daily_goals', JSON.stringify(dailyGoals))
  }, [dailyGoals])

  const toggleGoal = (id) => {
    setDailyGoals(
      dailyGoals.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    )
  }

  const handleLogStreak = () => {
    if (!checkedToday) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setCheckedToday(true)
      localStorage.setItem('devsunite_streak', newStreak.toString())
      localStorage.setItem('devsunite_streak_logged', 'true')
    }
  }

  const completedGoalsCount = dailyGoals.filter((g) => g.done).length

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
          JOB PREPARATION & PROGRESS
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
          Monitor your interview prep velocity, daily streaks, sheet completion rates, and application pipelines all in
          one unified dashboard.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Daily Streak</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Flame size={20} className="fill-amber-500" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950">{streak}</span>
              <span className="text-xs font-bold text-amber-700">Days Active</span>
            </div>
            <button
              onClick={handleLogStreak}
              disabled={checkedToday}
              className={`mt-3 w-full rounded-xl py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                checkedToday
                  ? 'bg-amber-200/80 text-amber-900 cursor-default'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
              }`}
            >
              {checkedToday ? '✓ Logged for Today' : '+ Log Today\'s Study Session'}
            </button>
          </div>
        </div>

        {/* DSA Solved */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">DSA Sheet Progress</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Target size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-950">42</span>
              <span className="text-xs font-bold text-blue-700">/ 75 Problems</span>
            </div>
            <div className="mt-3 w-full bg-blue-200/80 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: '56%' }}></div>
            </div>
            <p className="mt-2 text-[10px] text-blue-800 font-semibold">56% of essential patterns mastered</p>
          </div>
        </div>

        {/* System Design & Core */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Interview Readiness</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Award size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">84%</span>
              <span className="text-xs font-bold text-emerald-700">Match Index</span>
            </div>
            <div className="mt-3 w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: '84%' }}></div>
            </div>
            <p className="mt-2 text-[10px] text-emerald-800 font-semibold">Ready for Top Product Companies</p>
          </div>
        </div>

        {/* Job Applications */}
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Active Pipeline</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Briefcase size={20} />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-950">12</span>
              <span className="text-xs font-bold text-purple-700">Applications</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-purple-800">
              <span className="rounded bg-purple-200 px-1.5 py-0.5">3 Interviews</span>
              <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-emerald-800">1 Offer</span>
            </div>
            <p className="mt-2 text-[10px] text-purple-800 font-semibold">Last synced with Skilloriya job portal</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Focus Checklist + Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Goals Checklist */}
        <div className="rounded-2xl bg-white p-6 border border-[#eae6dc] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Today's Daily Target</h3>
            </div>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
              {completedGoalsCount} of {dailyGoals.length} Complete
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                  goal.done
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                    : 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800 shadow-2xs'
                }`}
              >
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => {}}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-semibold leading-relaxed flex-1">{goal.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic text-center pt-2">
            Click any target item to mark completed. Data persists locally.
          </p>
        </div>

        {/* Breakdown by Domain */}
        <div className="rounded-2xl bg-white p-6 border border-[#eae6dc] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Curriculum Proficiency</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Self Assessment</span>
          </div>

          <div className="space-y-4">
            {[
              { subject: 'Data Structures & Algorithms', pct: 68, color: 'bg-indigo-600', level: 'Intermediate / Advanced' },
              { subject: 'System Design & Scalability', pct: 45, color: 'bg-blue-600', level: 'High Level Design Solid' },
              { subject: 'Core CS (OS, DBMS, Networks, OOP)', pct: 82, color: 'bg-emerald-600', level: 'Interview Ready' },
              { subject: 'Behavioral & Leadership Principles', pct: 75, color: 'bg-amber-600', level: 'STAR Method Formatted' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{item.subject}</span>
                  <span className="font-extrabold text-slate-900">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{item.level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
