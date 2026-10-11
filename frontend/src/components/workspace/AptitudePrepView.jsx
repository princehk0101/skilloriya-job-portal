import React, { useState } from 'react'
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const APTITUDE_QUESTIONS = [
  {
    id: 1,
    category: 'Quantitative Aptitude',
    topic: 'Time and Work',
    question: 'A can do a piece of work in 12 days, and B can do it in 18 days. If they work together on it for 4 days, what fraction of the work remains to be done?',
    options: ['1/3', '2/5', '4/9', '5/9'],
    correctIndex: 2, // 4/9
    explanation: 'A\'s 1 day work = 1/12. B\'s 1 day work = 1/18.\nTogether in 1 day = 1/12 + 1/18 = (3 + 2)/36 = 5/36.\nIn 4 days they complete = 4 * (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.',
  },
  {
    id: 2,
    category: 'Quantitative Aptitude',
    topic: 'Speed, Time and Distance',
    question: 'A train running at a speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?',
    options: ['120 m', '150 m', '180 m', '324 m'],
    correctIndex: 1, // 150 m
    explanation: 'Speed in m/s = 60 * (5/18) = 50/3 m/s.\nDistance (Length of train) = Speed * Time = (50/3) * 9 = 150 meters.',
  },
  {
    id: 3,
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Cousin', 'Father'],
    correctIndex: 3, // Father
    explanation: 'The only son of Suresh\'s mother is Suresh himself. So the boy is the son of Suresh. Therefore, Suresh is his father.',
  },
  {
    id: 4,
    category: 'Logical Reasoning',
    topic: 'Number Series',
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
    correctIndex: 1, // (1/8)
    explanation: 'This is a geometric sequence where each number is divided by 2 (or multiplied by 1/2) to get the next number: (1/4) / 2 = 1/8.',
  },
  {
    id: 5,
    category: 'Verbal Ability',
    topic: 'Synonyms & Vocabulary',
    question: 'Choose the word which is most nearly the same in meaning to "PRAGMATIC":',
    options: ['Theoretical', 'Realistic & Practical', 'Idealistic', 'Impulsive'],
    correctIndex: 1, // Realistic & Practical
    explanation: 'Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
  },
]

export default function AptitudePrepView() {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']

  const handleSelectOption = (qId, optionIdx) => {
    if (selectedAnswers[qId] !== undefined) return // already answered
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx,
    })
  }

  const resetQuiz = () => {
    setSelectedAnswers({})
  }

  const filteredQuestions = APTITUDE_QUESTIONS.filter(
    (q) => activeCategory === 'All' || q.category === activeCategory
  )

  const answeredCount = Object.keys(selectedAnswers).length
  const correctCount = Object.entries(selectedAnswers).filter(([qId, ansIdx]) => {
    const q = APTITUDE_QUESTIONS.find((item) => item.id === parseInt(qId, 10))
    return q && q.correctIndex === ansIdx
  }).length

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Title */}
      <div className="border-b border-[#eae6dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            CAMPUS & COMPANY APTITUDE PREP
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
            Master Quantitative, Logical Reasoning, and Verbal ability tests required by TCS, Infosys, Wipro, Accenture,
            and top product companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white border border-[#eae6dc] px-4 py-2 text-right shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Your Score</span>
            <p className="text-sm font-black text-emerald-700">
              {correctCount} / {answeredCount} Correct
            </p>
          </div>
          <button
            onClick={resetQuiz}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === c
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-[#eae6dc] text-slate-700 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => {
          const userAns = selectedAnswers[q.id]
          const isAnswered = userAns !== undefined
          const isCorrect = userAns === q.correctIndex

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-[#eae6dc] bg-white p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-bold">
                    Question {idx + 1}
                  </span>
                  <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold border border-blue-200">
                    {q.topic}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">{q.category}</span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                {q.question}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {q.options.map((opt, optIdx) => {
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    } else if (optIdx === userAns) {
                      btnStyle = 'bg-red-50 border-red-500 text-red-900 font-bold'
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs text-left transition ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 font-bold text-[10px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && optIdx === userAns && optIdx !== q.correctIndex && (
                        <XCircle size={16} className="text-red-600 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation Drawer */}
              {isAnswered && (
                <div
                  className={`rounded-xl p-4 text-xs space-y-1.5 border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {isCorrect ? '✓ Correct Answer!' : '✗ Incorrect - Solution Walkthrough:'}
                  </p>
                  <p className="whitespace-pre-line leading-relaxed opacity-90">{q.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
