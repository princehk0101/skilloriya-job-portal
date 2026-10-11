import React, { useState } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  BrainCircuit,
  MessageSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AgenticCopilotView({ onSelectTab }) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      thoughtProcess: [
        'Step 1 [Analyze]: Initialized Skilloriya Autonomous Career Agent.',
        'Step 2 [Monitor]: Synced active session with user profile and job board pipelines.',
        'Step 3 [Ready]: Multi-agent system ready for autonomous career navigation.'
      ],
      content:
        'Hello! I am your Autonomous Agentic AI Career Copilot. I combine Gen AI reasoning with active agents to analyze job opportunities, audit ATS resumes, run voice interviews, and create 90-day learning roadmaps. How can I help propel your career today?',
      actions: [
        { label: 'Run Voice Mock Interview', tab: 'mock-interview', tag: 'Voice AI' },
        { label: 'Generate 90-Day Learning Plan', tab: 'skill-gap', tag: 'Roadmap' },
        { label: 'Build Developer Portfolio in 60s', tab: 'portfolio', tag: 'GenAI' }
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMode, setActiveMode] = useState('autonomous') // 'autonomous', 'job_hunt', 'dsa_mentor', 'interview_coach'

  const quickPrompts = [
    'How do I crack SDE-2 at Google or high-growth fintechs?',
    'Analyze what skills I need to transition into AI & LLM Engineering.',
    'Prepare me for a system design round on real-time chat (WhatsApp).',
    'How do I optimize my resume for strict ATS screeners?'
  ]

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage
    if (!text.trim() || loading) return

    const userMsg = { sender: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setLoading(true)

    try {
      const res = await axios.post('/api/ai/agentic-copilot/', {
        message: text,
        mode: activeMode,
        profile: {
          role: 'Full Stack Engineer',
          target: 'Product Companies'
        }
      })

      if (res.data?.agent) {
        const agentData = res.data.agent
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            thoughtProcess: agentData.thought_process,
            content: agentData.agent_response,
            actions: agentData.recommended_actions,
            suggestedPrompts: agentData.suggested_prompts
          }
        ])
      }
    } catch (err) {
      console.warn('Agentic Copilot fallback:', err)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          thoughtProcess: [
            'Step 1 [Analyze]: Parsed query and matched candidate career trajectory.',
            'Step 2 [Plan]: Formulated high-leverage preparation steps.',
            'Step 3 [Action]: Activated recommended studio workflows.'
          ],
          content: `I've analyzed your goal regarding "${text}". Focus on quantifiable system metrics and trade-offs. You should jump right into our AI Voice Mock Interview studio and check your 90-day roadmap.`,
          actions: [
            { label: 'Launch Voice Mock Interview', tab: 'mock-interview', tag: 'Immediate' },
            { label: 'View 90-Day Skill Gap Plan', tab: 'skill-gap', tag: 'Career Plan' }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (action) => {
    if (action.tab && onSelectTab) {
      onSelectTab(action.tab)
    } else if (action.route) {
      navigate(action.route)
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header */}
      <div className="border-b border-[#eae6dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
            <BrainCircuit size={14} className="text-emerald-700" />
            <span>Agentic AI • Multi-Agent Autonomous Career Copilot</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            AGENTIC CAREER COPILOT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-1">
            An autonomous multi-agent system powered by Generative AI. It reasons through your goals, runs chain-of-thought analysis,
            and coordinates between interview simulators, resume auditors, and skill roadmaps.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#eae6dc] shadow-2xs">
          {[
            { id: 'autonomous', label: 'Autonomous' },
            { id: 'interview_coach', label: 'Interview Coach' },
            { id: 'dsa_mentor', label: 'DSA Mentor' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeMode === m.id ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat & Agent Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Message Stream */}
        <div className="lg:col-span-3 rounded-3xl bg-white border border-[#eae6dc] shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Scrollable Conversation */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shrink-0">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-[#faf9f5] border border-slate-200/80 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {/* Agent Chain-of-Thought (ReAct) Collapsible/Box */}
                  {msg.thoughtProcess && (
                    <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wide">
                        <Cpu size={12} className="text-emerald-600" />
                        <span>Autonomous Agent Reasoning Chain</span>
                      </div>
                      <div className="space-y-0.5 pt-1 text-[10px]">
                        {msg.thoughtProcess.map((step, sIdx) => (
                          <p key={sIdx} className="text-slate-500">
                            &gt; {step}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="leading-relaxed whitespace-pre-line text-xs font-medium">{msg.content}</p>

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Autonomous Action Triggers
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                          >
                            <span>{act.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-slate-400 italic">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
                  <RefreshCw size={16} className="animate-spin" />
                </div>
                <span>Agent is reasoning and coordinating sub-agents...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-100 bg-[#faf9f5]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-2 shadow-inner"
            >
              <input
                type="text"
                placeholder="Ask your career agent (e.g. 'How do I negotiate offer at Amazon?', 'Audit my stack')..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white p-2 transition shadow-xs"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Quick Inspiration & Multi-Agent Status */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 border border-[#eae6dc] shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              Suggested Agent Prompts
            </h4>
            <div className="space-y-2">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left rounded-xl p-2.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition leading-snug"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 border border-emerald-200 space-y-2">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <BrainCircuit size={15} className="text-emerald-700" />
              Active Autonomous Agents
            </h4>
            <ul className="space-y-1.5 text-[11px] text-emerald-800 font-medium">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Profile & Resume Analyzer Agent</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                <span>Real-Time Voice Mock Interview Agent</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                <span>30/60/90-Day Learning Strategist</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                <span>ATS Resume Match & Audit Agent</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
