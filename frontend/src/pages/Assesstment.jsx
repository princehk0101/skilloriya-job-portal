import React from 'react'
import { Code, Database, Layout, Server, Terminal, Cpu, CheckCircle, Clock, FileText, Sparkles } from 'lucide-react'

const assessments = [
  {
    id: 1,
    title: 'Frontend Development',
    icon: Layout,
    questions: 15,
    time: '30 mins',
    level: 'Intermediate',
    description: 'Test your knowledge of HTML, CSS, JavaScript, and React.',
  },
  {
    id: 2,
    title: 'Backend Development',
    icon: Server,
    questions: 20,
    time: '45 mins',
    level: 'Advanced',
    description: 'Test your knowledge of backend concepts, services, and application logic.',
  },
  {
    id: 3,
    title: 'Data Structures',
    icon: Code,
    questions: 10,
    time: '25 mins',
    level: 'Hard',
    description: 'Practice algorithms, problem solving, and core data structure concepts.',
  },
  {
    id: 4,
    title: 'Database Management',
    icon: Database,
    questions: 15,
    time: '30 mins',
    level: 'Intermediate',
    description: 'Evaluate your understanding of queries, schemas, and database design.',
  },
  {
    id: 5,
    title: 'Python Programming',
    icon: Terminal,
    questions: 15,
    time: '30 mins',
    level: 'Beginner',
    description: 'Cover core Python concepts, syntax, and practical programming basics.',
  },
  {
    id: 6,
    title: 'System Design',
    icon: Cpu,
    questions: 10,
    time: '40 mins',
    level: 'Expert',
    description: 'Review architecture, scalability, and common design decisions used in software systems.',
  },
]

const Assesstment = () => {
  return (
    <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(35,85,217,0.16)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <h1 className="display-font mt-6 text-4xl font-bold leading-tight sm:text-6xl">Show your skills with job-ready assessments.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                Complete assessments to highlight your strengths and add more value to your profile.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
                <CheckCircle size={22} className="text-amber-200" />
                <p className="mt-4 text-2xl font-extrabold">6</p>
                <p className="mt-1 text-sm text-blue-100">Tracks available</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
                <Clock size={22} className="text-amber-200" />
                <p className="mt-4 text-2xl font-extrabold">25-45</p>
                <p className="mt-1 text-sm text-blue-100">Minutes each</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
                <FileText size={22} className="text-amber-200" />
                <p className="mt-4 text-2xl font-extrabold">10+</p>
                <p className="mt-1 text-sm text-blue-100">Questions minimum</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="section-frame rounded-[1.8rem] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Get Verified</h3>
            <p className="mt-2 text-sm text-gray-500">Complete tests and highlight your strengths on your profile.</p>
          </div>
          <div className="section-frame rounded-[1.8rem] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Stand Out</h3>
            <p className="mt-2 text-sm text-gray-500">Show recruiters the skills that match the roles you want.</p>
          </div>
          <div className="section-frame rounded-[1.8rem] p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">Retake Anytime</h3>
            <p className="mt-2 text-sm text-gray-500">Retake assessments when you want to improve your score.</p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="display-font mb-8 text-3xl font-bold text-gray-900 sm:text-5xl">Available tests</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((test) => (
              <div key={test.id} className="section-frame group rounded-[1.75rem] p-6 transition-all hover:-translate-y-1 hover:border-blue-200">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <test.icon size={24} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    test.level === 'Beginner' ? 'bg-cyan-100 text-cyan-700' :
                    test.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {test.level}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{test.description}</p>

                <div className="mb-6 mt-5 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FileText size={16} />
                    <span>{test.questions} Qs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{test.time}</span>
                  </div>
                </div>

                <button className="w-full rounded-2xl bg-gray-900 py-3 font-bold text-white transition-colors hover:bg-blue-600">
                  Start Assessment
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Assesstment
