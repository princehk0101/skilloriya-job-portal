import React from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Search,
  Video,
  Building2,
  BarChart3,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const SidebarLayout = ({ children, title, role, profile }) => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)
  const currentTab = searchParams.get('tab') || 'overview'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    navigate('/login')
  }

  const adminSections = [
    {
      title: 'Management',
      links: [
        { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Admin Console' },
      ],
    },
  ]

  const employerSections = [
    {
      title: 'COMMAND HUB',
      links: [
        { to: '/employer', tab: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { to: '/employer?tab=jobs', tab: 'jobs', icon: Briefcase, label: 'My Job Postings' },
        { to: '/post-job', tab: 'post-job', icon: PlusCircle, label: 'Post New Job' },
      ],
    },
    {
      title: 'CANDIDATES & ATS',
      links: [
        { to: '/employer?tab=pipeline', tab: 'pipeline', icon: Users, label: 'Candidate Pipeline' },
        { to: '/employer?tab=talent', tab: 'talent', icon: Search, label: 'Search Talent (Resdex)' },
        { to: '/employer?tab=interviews', tab: 'interviews', icon: Video, label: 'Video Interviews' },
      ],
    },
    {
      title: 'ORGANIZATION',
      links: [
        { to: '/employer?tab=company', tab: 'company', icon: Building2, label: 'Company Profile' },
        { to: '/employer?tab=analytics', tab: 'analytics', icon: BarChart3, label: 'Hiring Analytics' },
      ],
    },
  ]

  const sections = role === 'admin' ? adminSections : employerSections

  const isLinkActive = (link) => {
    if (role === 'admin') {
      return location.pathname === link.to
    }
    if (link.to === '/post-job') {
      return location.pathname === '/post-job'
    }
    if (location.pathname === '/employer') {
      return currentTab === (link.tab || 'overview')
    }
    return location.pathname === link.to
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full bg-white border-r border-slate-200/80 transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : ''} shadow-lg lg:shadow-none flex flex-col`}>
        {/* Header */}
        <div className="flex h-20 items-center px-6 border-b border-slate-100 justify-between bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold shadow-md">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">Skilloria</span>
                <span className="rounded-md bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
                  {role === 'admin' ? 'Admin' : 'Recruiter'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                {role === 'admin' ? 'Control Center' : 'Naukri RMS Edition'}
              </p>
            </div>
          </Link>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon
                  const active = isLinkActive(link)
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={active ? 'text-white' : 'text-slate-500'} />
                        <span>{link.label}</span>
                      </div>
                      {link.tab === 'talent' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          Resdex
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Footer Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
              {profile?.first_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'R'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {profile?.company_name || profile?.first_name ? `${profile?.first_name} ${profile?.last_name || ''}`.trim() : profile?.email}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-100"
          >
            <LogOut size={14} />
            Logout from Recruiter Hub
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header for Mobile */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold">{title}</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_#eff6ff,_#f8fbff)]">
          {children}
        </main>
      </div>
    </div>
  )
}
export default SidebarLayout
