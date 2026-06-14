import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-blue-100 bg-white/92 p-8 text-center shadow-[0_24px_60px_rgba(37,99,235,0.1)] backdrop-blur sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Compass size={28} />
        </div>
        <p className="mt-6 text-xs font-semibold text-blue-700">404</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page you are looking for is currently unavailable or has been moved. Let's return to the active portal.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <ArrowLeft size={16} />
            Go to Home
          </Link>
          <Link
            to="/companies"
            className="inline-flex items-center justify-center rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            Browse Companies
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
