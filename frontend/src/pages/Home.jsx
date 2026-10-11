import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import CategoryCard from '../components/CategoryCard'
import JobCard from '../components/JobCard'

const Home = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Hero />

      <CategoryCard />
      <JobCard />

      <section className="pb-24">
        <div className="mx-auto w-[98%] max-w-[1600px] px-2 sm:px-4">
          <div className="section-frame flex flex-col items-start justify-between gap-6 rounded-[2rem] px-8 py-10 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <h2 className="display-font text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Post roles and hire faster.
              </h2>
              <p className="text-sm font-medium text-slate-600">Manage listings and applicants from one dashboard.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Post a Job
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/companies"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:text-blue-700"
              >
                Explore Companies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
