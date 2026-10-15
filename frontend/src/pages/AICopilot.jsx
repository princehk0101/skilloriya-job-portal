import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FileText, Bot, Chrome, ExternalLink, Zap } from 'lucide-react'

const AICopilot = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Centered Header with No BG */}
        <div className="text-center max-w-3xl mx-auto mb-12 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Sparkles size={14} />
            AI Workspace & Career Copilot
          </span>
          <h1 className="display-font mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            AI Copilot Dashboard
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg max-w-2xl mx-auto">
            Track your AI-powered career growth. Monitor job matches, tailored cover letters, and interview performance in one place.
          </p>
          <div className="mt-6 flex justify-center">
            <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
              <Sparkles size={15} />
              Analyse New Job
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="rounded-[2rem] bg-white border border-purple-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 text-purple-600 transition-transform group-hover:scale-110">
              <FileText size={120} />
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Cover Letter</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[250px]">Generate tailored, high-conversion cover letters for any job in seconds.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600">
              BEGIN <ExternalLink size={14} />
            </button>
          </motion.div>

          <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="rounded-[2rem] bg-white border border-emerald-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 text-emerald-600 transition-transform group-hover:scale-110">
              <Bot size={120} />
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Mock Interview</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[250px]">Practice with role-specific AI interviews and get detailed behavioral feedback.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              START SESSION <ExternalLink size={14} />
            </button>
          </motion.div>

          <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}} className="rounded-[2rem] bg-white border border-blue-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 text-blue-600 transition-transform group-hover:scale-110">
              <Chrome size={120} />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Chrome size={24} />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full uppercase">Free for all users</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Auto-Apply</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-[250px]">Apply to jobs 10x faster. Our extension fills applications across any portal using your profile.</p>
            <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              INSTALL — IT'S FREE <ExternalLink size={14} />
            </button>
          </motion.div>
        </div>

        {/* Usage & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText size={18} className="text-emerald-600" /> Usage Limits <span className="text-slate-400 font-normal text-sm">(monthly)</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase">FREE</span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700">Matches</span>
                <span className="font-bold text-slate-900">0 / 4</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '0%' }}></div>
              </div>
              
              <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Letters</span>
                <span className="font-bold text-slate-900">0 / 3</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: '0%' }}></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Interviews</span>
                <span className="font-bold text-slate-900">0 / 3</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: '0%' }}></div>
              </div>

              <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Auto Apply</span>
                <span className="font-bold text-slate-900">0 / 2</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  <FileText size={14} /> Recent Letters
                </h4>
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 h-32 flex items-center justify-center">
                  <p className="text-sm font-bold text-slate-400">NO DOCUMENTS</p>
                </div>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  <Bot size={14} /> Recent Mock Sessions
                </h4>
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 h-32 flex items-center justify-center">
                  <p className="text-sm font-bold text-slate-400">NO SESSIONS</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 mt-8">
                <Bot size={20} className="text-blue-500" /> Recent Activity
              </h4>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-48 flex items-center justify-center">
                <p className="text-sm font-medium text-slate-400">No recent AI activity found.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AICopilot
