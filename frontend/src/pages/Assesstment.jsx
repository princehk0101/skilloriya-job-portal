import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Code,
  Database,
  Layout,
  Server,
  Terminal,
  Cpu,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Award,
  ArrowRight,
  Loader2,
  X,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'

const iconMap = {
  Layout: Layout,
  Server: Server,
  Database: Database,
  Code: Code,
  Terminal: Terminal,
  Cpu: Cpu,
}

const Assesstment = () => {
  const [assessments, setAssessments] = useState([])
  const [myBadges, setMyBadges] = useState([])
  const [loading, setLoading] = useState(true)

  // Active Test State
  const [activeTest, setActiveTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const getAuthConfig = () => {
    const token = localStorage.getItem('access_token')
    return token ? { headers: { Authorization: `Bearer ${token}` } } : null
  }

  const loadData = async () => {
    try {
      const auth = getAuthConfig()
      const [testsRes, badgesRes] = await Promise.allSettled([
        axios.get('/api/skills/assessments/', auth || {}),
        auth ? axios.get('/api/skills/my-badges/', auth) : Promise.resolve({ data: [] }),
      ])

      setAssessments(testsRes.status === 'fulfilled' ? testsRes.value.data : [])
      setMyBadges(badgesRes.status === 'fulfilled' ? badgesRes.value.data : [])
    } catch (err) {
      console.error('Failed to load assessments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeTest || testResult || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeTest, testResult, timeLeft])

  const startAssessment = async (testId, forceDynamic = true) => {
    const auth = getAuthConfig()
    if (!auth) {
      alert('Please login to take skill assessments.')
      return
    }

    try {
      setLoading(true)
      const url = `/api/skills/assessments/${testId}/?dynamic=true&t=${Date.now()}`
      const res = await axios.get(url, auth)
      setActiveTest(res.data.assessment)
      setQuestions(res.data.questions || [])
      setCurrentQIndex(0)
      setUserAnswers({})
      setTestResult(null)
      setTimeLeft((res.data.assessment.time_minutes || 20) * 60)
    } catch (err) {
      alert('Unable to start assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (questionId, optionLetter) => {
    setUserAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionLetter,
    }))
  }

  const handleSubmitTest = async () => {
    if (isSubmitting || !activeTest) return
    setIsSubmitting(true)

    try {
      const auth = getAuthConfig()
      const res = await axios.post(
        `/api/skills/assessments/${activeTest.id}/submit/`,
        { answers: userAnswers },
        auth
      )
      setTestResult(res.data)
      loadData()
    } catch (err) {
      alert('Failed to submit test results. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeTestModal = () => {
    setActiveTest(null)
    setQuestions([])
    setTestResult(null)
  }

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (loading && !activeTest) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 pt-24 bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
      <div className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
        {/* Banner */}
        <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-cyan-200">
                <Sparkles size={14} />
                Skilloria Assessment & Certification Engine
              </span>
              <h1 className="display-font mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
                Prove your skills with industry-standard tests.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                Pass skill assessments to earn verified badges on your profile. Verified candidates are 3x more likely to be shortlisted by recruiters.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur text-center">
                <Award size={24} className="mx-auto text-amber-300" />
                <p className="mt-3 text-2xl font-black">{assessments.length}</p>
                <p className="text-xs text-blue-100">Skill Tracks</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur text-center">
                <Clock size={24} className="mx-auto text-cyan-300" />
                <p className="mt-3 text-2xl font-black">20-30</p>
                <p className="text-xs text-blue-100">Minutes Each</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur text-center">
                <CheckCircle2 size={24} className="mx-auto text-emerald-300" />
                <p className="mt-3 text-2xl font-black">{myBadges.length}</p>
                <p className="text-xs text-blue-100">Badges Earned</p>
              </div>
            </div>
          </div>
        </section>

        {/* My Earned Badges Section */}
        {myBadges.length > 0 ? (
          <section className="mt-12 rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              My Verified Skill Badges ({myBadges.length})
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {myBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-md">
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{badge.badge_title || badge.assessment_title}</h4>
                    <p className="text-xs text-slate-500">Score: {badge.score_percentage}% • {new Date(badge.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Available Assessments Grid */}
        <section className="mt-14">
          <h2 className="display-font text-2xl font-bold text-slate-900 sm:text-4xl">Available Skill Assessments</h2>
          <p className="mt-1 text-sm text-slate-500">Pick a track and complete the multiple-choice test to get certified.</p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((test) => {
              const IconComponent = iconMap[test.icon_name] || Code
              const userStat = test.user_status

              return (
                <div
                  key={test.id}
                  className="group relative flex flex-col justify-between rounded-[2rem] border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                        <IconComponent size={22} />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        test.level === 'Beginner' ? 'bg-cyan-100 text-cyan-800' :
                        test.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {test.level}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">{test.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{test.description}</p>

                    <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} />
                        <span>{test.questions_count || 5} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{test.time_minutes} Mins</span>
                      </div>
                    </div>

                    {userStat?.passed ? (
                      <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Passed with {userStat.best_score}%</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 pt-2">
                    <button
                      onClick={() => startAssessment(test.id)}
                      className="w-full rounded-2xl bg-slate-900 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-600 shadow-sm"
                    >
                      {userStat?.passed ? 'Retake Assessment' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Live Quiz Modal */}
        {activeTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-blue-200 bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white">
                <div>
                  <h3 className="text-base font-bold">{activeTest.title} Assessment</h3>
                  <p className="text-xs text-blue-100">Passing criteria: {activeTest.passing_score}% score</p>
                </div>
                <div className="flex items-center gap-4">
                  {!testResult ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-mono font-bold">
                      <Clock size={14} />
                      {formatTimer(timeLeft)}
                    </div>
                  ) : null}
                  <button onClick={closeTestModal} className="rounded-full p-1 text-blue-100 hover:bg-white/20">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Quiz Body or Results */}
              {!testResult ? (
                <div className="p-6 sm:p-8">
                  {questions.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">Loading questions...</p>
                  ) : (
                    <div>
                      {/* Question Progress */}
                      <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span>Question {currentQIndex + 1} of {questions.length}</span>
                        <span>{Object.keys(userAnswers).length} answered</span>
                      </div>

                      {/* Question Text */}
                      <h4 className="text-lg font-bold text-slate-900 leading-snug">
                        {questions[currentQIndex]?.question_text}
                      </h4>

                      {/* Options */}
                      <div className="mt-6 space-y-3">
                        {['A', 'B', 'C', 'D'].map((letter) => {
                          const optionKey = `option_${letter.toLowerCase()}`
                          const optionText = questions[currentQIndex]?.[optionKey]
                          if (!optionText) return null

                          const currentQId = String(questions[currentQIndex]?.id)
                          const isSelected = userAnswers[currentQId] === letter

                          return (
                            <button
                              key={letter}
                              onClick={() => handleSelectOption(currentQId, letter)}
                              className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left text-sm font-medium transition ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {letter}
                              </span>
                              <span>{optionText}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Navigation buttons */}
                      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                        <button
                          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentQIndex === 0}
                          className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          Previous
                        </button>

                        {currentQIndex < questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQIndex((prev) => prev + 1)}
                            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600 shadow-sm"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitTest}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Submit Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Test Result Summary */
                <div className="p-8 text-center">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                    testResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {testResult.passed ? <Award size={36} /> : <AlertCircle size={36} />}
                  </div>

                  <h3 className="mt-4 text-2xl font-extrabold text-slate-900">
                    {testResult.passed ? 'Congratulations! You Passed!' : 'Assessment Incomplete'}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    You scored <strong className="text-slate-900 font-bold">{testResult.score_percentage}%</strong> ({testResult.correct_answers} of {testResult.total_questions} correct).
                  </p>

                  {testResult.passed ? (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 border border-amber-300">
                      <Award size={16} className="text-amber-600" />
                      Earned Badge: {testResult.badge_title}
                    </div>
                  ) : null}

                  {/* Action buttons */}
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={closeTestModal}
                      className="rounded-2xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600 shadow-sm"
                    >
                      Done & Return
                    </button>
                    <button
                      onClick={() => startAssessment(activeTest.id, true)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                    >
                      <RotateCcw size={14} />
                      <span>Retake with Fresh Dynamic AI Questions</span>
                    </button>
                  </div>

                  {/* Detailed Solutions & Explanations Section */}
                  <div className="mt-6 border-t border-slate-100 pt-5 text-left">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        Full Solutions & Deep Explanations
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">
                        {testResult.correct_answers} of {testResult.total_questions} Solved Correctly
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                      {testResult.feedback?.map((fb, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-4 text-xs transition ${
                            fb.is_correct
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/60 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-slate-900">
                              Q{idx + 1}: {fb.question_text}
                            </p>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                fb.is_correct
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-rose-200 text-rose-900'
                              }`}
                            >
                              {fb.is_correct ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>

                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                            <div className="rounded-lg bg-white/80 p-2 border border-slate-200">
                              <span className="text-slate-400 font-bold block">Your Answer:</span>
                              <span className={fb.is_correct ? 'font-bold text-emerald-700' : 'font-bold text-rose-600'}>
                                Option {fb.user_answer || 'Skipped'}
                              </span>
                            </div>
                            <div className="rounded-lg bg-white/80 p-2 border border-slate-200">
                              <span className="text-slate-400 font-bold block">Correct Solution:</span>
                              <span className="font-bold text-emerald-700">
                                Option {fb.correct_answer}
                              </span>
                            </div>
                          </div>

                          {fb.explanation && (
                            <div className="mt-2.5 rounded-xl bg-white/90 p-2.5 border border-slate-200/80 text-[11px] text-slate-700">
                              <strong className="text-slate-900">Solution Breakdown: </strong>
                              {fb.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Assesstment
