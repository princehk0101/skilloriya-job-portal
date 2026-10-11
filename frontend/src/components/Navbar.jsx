import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  User,
  Menu,
  X,
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  Plus,
  Sparkles,
  MessageSquare,
  CreditCard,
  Award,
  FileText,
  TrendingUp,
  Layers,
  Cpu,
  BookOpenCheck,
  Rocket,
  Flame,
  Target,
  ShieldCheck,
  Globe,
  PenTool,
  Mic,
  Bot,
  Chrome,
  ListTodo,
  Zap,
  Bookmark,
} from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveMediaUrl } from '../utils/media'

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now'
  const now = Date.now()
  const t = new Date(dateString).getTime()
  if (Number.isNaN(t)) return 'Just now'
  const diffMin = Math.max(0, Math.floor((now - t) / 60000))
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const profileMenuRef = useRef(null)
  const notificationRef = useRef(null)

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [seenAt, setSeenAt] = useState(0)
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role'))
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || 'null')
    } catch {
      return null
    }
  })

  const isLoggedIn = !!localStorage.getItem('access_token')
  const isAdmin = isLoggedIn && !!(profile?.is_staff || profile?.is_superuser)
  const isEmployer = isLoggedIn && userRole === 'employer'
  const dashboardPath = isAdmin ? '/admin-dashboard' : isEmployer ? '/employer' : '/dashboard'
  const isHome = location.pathname === '/'

  const seenStorageKey = useMemo(() => {
    return profile?.email ? `notifications_seen_at:${profile.email}` : 'notifications_seen_at:guest'
  }, [profile?.email])

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => {
      const ts = item?.timestamp ? new Date(item.timestamp).getTime() : 0
      return ts > seenAt
    }).length
  }, [notifications, seenAt])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role'))
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
    setIsNotificationOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const persistedSeenAt = Number(localStorage.getItem(seenStorageKey) || 0)
    setSeenAt(Number.isNaN(persistedSeenAt) ? 0 : persistedSeenAt)
  }, [seenStorageKey])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) {
        setProfile(null)
        setNotifications([])
        localStorage.removeItem('user_profile')
        return
      }
      try {
        const token = localStorage.getItem('access_token')
        const res = await axios.get('/api/users/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile(res.data)
        localStorage.setItem('user_profile', JSON.stringify(res.data))
        if (res.data?.role) {
          localStorage.setItem('user_role', res.data.role)
          setUserRole(res.data.role)
        }
      } catch {
        // Keep cached profile if API fails.
      }
    }
    fetchProfile()
  }, [isLoggedIn, location.pathname])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn) return
      const token = localStorage.getItem('access_token')
      if (!token) return

      setNotificationsLoading(true)
      try {
        const role = localStorage.getItem('user_role') || profile?.role || 'seeker'
        let built = []

        if (isAdmin) {
          built = []
        } else if (role === 'employer') {
          const res = await axios.get('/api/applications/employer/dashboard/', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const recent = normalizeList(res.data?.recent_applications)
          built = recent.map((app) => ({
            id: `emp-${app.id}`,
            title: `New applicant for ${app.job_title || 'a role'}`,
            body: `${app.full_name || app.applicant_name || app.applicant_email || 'Candidate'}`,
            timestamp: app.applied_at,
            href: '/employer',
          }))
        } else {
          const res = await axios.get('/api/applications/my-applications/', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const apps = normalizeList(res.data)
          built = apps.map((app) => ({
            id: `seek-${app.id}`,
            title: ['applied', 'waitlist'].includes(app.status)
              ? 'Application received'
              : `Status updated: ${app.status}`,
            body: app.job_title || 'Job application',
            timestamp: app.applied_at,
            href: '/dashboard',
          }))
        }

        built.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
        setNotifications(built.slice(0, 12))
      } catch {
        setNotifications([])
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [isLoggedIn, isAdmin, profile?.role, profile?.email, location.pathname])

  const markNotificationsRead = () => {
    const now = Date.now()
    setSeenAt(now)
    localStorage.setItem(seenStorageKey, String(now))
  }

  const handleToggleNotification = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev
      if (next) {
        setIsProfileMenuOpen(false)
        markNotificationsRead()
      }
      return next
    })
  }

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat'))
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    setIsProfileMenuOpen(false)
    setIsNotificationOpen(false)
    setNotifications([])
    navigate('/login')
  }

  const navLinks = isAdmin
    ? [
        { to: '/admin-dashboard', label: 'Admin Panel' },
        { to: '/jobs', label: 'Job Feed' },
        { to: '/companies', label: 'Companies' },
        { to: '/pricing', label: 'Pricing' },
      ]
    : isEmployer
    ? [
        { to: '/employer', label: 'Employer Panel' },
        { to: '/jobs', label: 'Job Feed' },
        { to: '/companies', label: 'Companies' },
        { to: '/pricing', label: 'Pricing' },
      ]
    : [
        { to: '/jobs', label: 'Find Jobs' },
        { to: '/categories', label: 'Categories' },
        { to: '/companies', label: 'Companies' },
        { to: '/assessments', label: 'Skill Tests' },
        { to: '/pricing', label: 'Pricing' },
      ]

  const displayName = profile?.first_name || profile?.email || 'My Account'

  const isActiveRoute = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const hideNavbarRoutes = [
    '/admin-dashboard',
    '/employer',
    '/post-job',
    '/admin/login',
    '/employer/login',
    '/employer/signup',
    '/portfolio',
    '/ai-copilot',
    '/ai',
    '/dsa-sheets',
    '/task-board',
    '/progress',
    '/skill-gap',
  ]
  if (hideNavbarRoutes.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`))) {
    return null
  }

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled || !isHome ? 'pt-2' : 'pt-3'}`}>
      <div className="mx-auto flex w-[98%] max-w-[1600px] items-center justify-between px-2 sm:px-4">
        <div className={`glass-panel flex w-full items-center justify-between rounded-2xl px-4 py-2 transition-all duration-300 ${isScrolled || !isHome ? 'shadow-[0_10px_40px_rgba(16,32,58,0.1)]' : 'bg-white/75'}`}>
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-[linear-gradient(135deg,_#10203a,_#2355d9,_#0ea5b7)] text-white shadow-[0_10px_20px_rgba(35,85,217,0.2)] transition-all duration-300 group-hover:-translate-y-0.5">
              <Briefcase size={20} strokeWidth={2.4} />
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">Skilloria</span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/72 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActiveRoute(item.to)
                    ? 'bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.14)]'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Resources Mega Menu */}
            {!isAdmin && !isEmployer && (
              <div className="group relative">
                <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700">
                  Resources <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                  <div className="w-[850px] rounded-[1.75rem] border border-blue-100 bg-white p-8 shadow-[0_32px_64px_rgba(35,85,217,0.12)]">
                    <div className="grid grid-cols-3 gap-8 text-left">
                      {/* Column 1 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">Your Workspace</h4>
                        <div className="space-y-4">
                          <Link to="/resources" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <TrendingUp size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Resources Home</p>
                              <p className="text-xs text-slate-500 mt-0.5">See your prep progress</p>
                            </div>
                          </Link>
                          <Link to="/task-board" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <LayoutDashboard size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Task Board</p>
                              <p className="text-xs text-slate-500 mt-0.5">Organize what to study next</p>
                            </div>
                          </Link>
                          <Link to="/dsa-sheets" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Layers size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">DSA Sheets</p>
                              <p className="text-xs text-slate-500 mt-0.5">Choose a coding sheet</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                      
                      {/* Column 2 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">Interview Prep</h4>
                        <div className="space-y-4">
                          <Link to="/system-design" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Cpu size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">System Design Sheet</p>
                              <p className="text-xs text-slate-500 mt-0.5">Work through design topics</p>
                            </div>
                          </Link>
                          <Link to="/company-questions" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Briefcase size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Company Questions</p>
                              <p className="text-xs text-slate-500 mt-0.5">Practice by company</p>
                            </div>
                          </Link>
                          <Link to="/core-subjects" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <BookOpenCheck size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Core Subjects</p>
                              <p className="text-xs text-slate-500 mt-0.5">Review CS fundamentals</p>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">Popular DSA Sheets</h4>
                        <div className="space-y-4">
                          <Link to="/sheet/striver" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Rocket size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Striver A2Z</p>
                              <p className="text-xs text-slate-500 mt-0.5">433 problems</p>
                            </div>
                          </Link>
                          <Link to="/sheet/love-babbar" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Flame size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Love Babbar</p>
                              <p className="text-xs text-slate-500 mt-0.5">430 problems</p>
                            </div>
                          </Link>
                          <Link to="/sheet/neetcode" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <Target size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">NeetCode 150</p>
                              <p className="text-xs text-slate-500 mt-0.5">150 problems</p>
                            </div>
                          </Link>
                          <Link to="/sheet/rohit-negi" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors group-hover/item:bg-emerald-100">
                              <ShieldCheck size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Rohit Negi</p>
                              <p className="text-xs text-slate-500 mt-0.5">725 problems</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Mega Menu */}
            {!isAdmin && !isEmployer && (
              <div className="group relative">
                <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-700">
                  Products <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                  <div className="w-[880px] rounded-[1.75rem] border border-blue-100 bg-white p-8 shadow-[0_32px_64px_rgba(35,85,217,0.12)]">
                    <div className="grid grid-cols-3 gap-6 text-left">
                      {/* Column 1 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">Find Jobs</h4>
                        <div className="space-y-3">
                          <Link to="/jobs" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">All Jobs</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Browse developer roles</p>
                            </div>
                          </Link>
                          <Link to="/jobs?type=remote" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Globe size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Remote Jobs</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Work from anywhere</p>
                            </div>
                          </Link>
                          <Link to="/jobs?sort=newest" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Zap size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">New Jobs Today</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Freshest roles, updated hourly</p>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">AI Tools</h4>
                        <div className="space-y-3">
                          <Link to="/ai/resume-analysis" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Match Score & Resume Analysis</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Compare your resume with a job</p>
                            </div>
                          </Link>
                          <Link to="/ai/cover-letter" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <PenTool size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Cover Letter</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Write for a specific role</p>
                            </div>
                          </Link>
                          <Link to="/ai/mock-interview" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Mic size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Mock Interview</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Practice with role-based questions</p>
                            </div>
                          </Link>
                          <Link to="/ai/copilot" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Bot size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">AI Copilot</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Your job search workspace</p>
                            </div>
                          </Link>
                          <Link to="/portfolio" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <LayoutDashboard size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Portfolio Builder</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Publish your developer work</p>
                            </div>
                          </Link>
                          <Link to="/extension" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Chrome size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Chrome Auto-Fill Extension</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Fill applications with your profile</p>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">Prepare</h4>
                        <div className="space-y-3">
                          <Link to="/dsa-sheets" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Layers size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">DSA Sheets</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Structured coding practice</p>
                            </div>
                          </Link>
                          <Link to="/dsa-patterns" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <TrendingUp size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">DSA Patterns</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Learn common problem patterns</p>
                            </div>
                          </Link>
                          <Link to="/core-subjects" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <BookOpenCheck size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Core Subjects</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Review CS fundamentals</p>
                            </div>
                          </Link>
                          <Link to="/system-design" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Cpu size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">System Design</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Work through design topics</p>
                            </div>
                          </Link>
                          <Link to="/company-questions" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Company Questions</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Practice by company</p>
                            </div>
                          </Link>
                          <Link to="/task-board" className="group/item flex items-start gap-4 hover:bg-slate-50 p-2 rounded-xl transition-colors -ml-2">
                            <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 transition-colors group-hover/item:bg-blue-100">
                              <ListTodo size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">Task Board</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Plan your next steps</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isEmployer && !isAdmin ? (
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_#2355d9,_#0ea5b7)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(35,85,217,0.24)] transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                <Plus size={16} />
                Post Job
              </Link>
            ) : null}

            {isLoggedIn ? (
              <button
                onClick={handleOpenChat}
                className="relative rounded-full border border-slate-200/80 bg-white/90 p-2.5 text-slate-500 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
                title="Messages & Live Chat"
              >
                <MessageSquare size={18} strokeWidth={2.4} />
              </button>
            ) : null}

            {isLoggedIn ? (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleToggleNotification}
                  className="relative rounded-full border border-slate-200/80 bg-white/90 p-2.5 text-slate-500 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
                  title="Notifications"
                >
                  <Bell size={18} strokeWidth={2.5} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>

                <AnimatePresence>
                  {isNotificationOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-50 mt-3 w-80 origin-top-right rounded-[1.5rem] border border-blue-100/80 bg-white/92 p-2 shadow-[0_24px_60px_rgba(35,85,217,0.16)] backdrop-blur"
                    >
                      <div className="flex items-center justify-between border-b border-blue-50 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">Notifications</p>
                        <button onClick={markNotificationsRead} className="text-xs text-blue-600 hover:underline">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notificationsLoading ? (
                          <p className="px-3 py-4 text-sm text-slate-500">Loading...</p>
                        ) : notifications.length === 0 ? (
                          <p className="px-3 py-4 text-sm text-slate-500">No notifications yet.</p>
                        ) : (
                          notifications.map((note) => (
                            <Link
                              key={note.id}
                              to={note.href}
                              className="block rounded-2xl px-3 py-3 transition-colors hover:bg-blue-50"
                            >
                              <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{note.body}</p>
                              <p className="mt-1 text-[11px] text-slate-400">{formatTimeAgo(note.timestamp)}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}

            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen((prev) => !prev)
                    setIsNotificationOpen(false)
                  }}
                  className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/92 px-3 py-2 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/70"
                >
                  <img
                    src={resolveMediaUrl(profile?.profile_image_url) || 'https://via.placeholder.com/36'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-blue-100 object-cover"
                  />
                  <div className="hidden text-left sm:block">
                    <p className="text-xs text-slate-500">Signed in</p>
                    <p className="max-w-[120px] truncate text-sm font-bold text-slate-800">{displayName}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-3xl border border-blue-100/80 bg-white p-2 shadow-[0_24px_60px_rgba(35,85,217,0.16)] backdrop-blur"
                    >
                      <div className="border-b border-slate-100 px-3 py-3 mb-2">
                        <p className="max-w-[200px] truncate text-sm font-bold text-slate-800 uppercase tracking-wide">{profile?.first_name || 'My Account'}</p>
                        <p className="max-w-[200px] truncate text-xs text-slate-500 mt-0.5">{profile?.email}</p>
                      </div>

                      <div className="space-y-1">
                        <Link to="/ai-copilot" className="inline-flex w-full items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100">
                          <Bot size={16} />
                          AI Copilot
                        </Link>
                        <Link to="/saved-jobs" className="inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600">
                          <Bookmark size={16} />
                          Saved jobs
                        </Link>
                        <Link to="/profile" className="inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600">
                          <User size={16} />
                          Profile
                        </Link>
                        <Link to="/feedback" className="inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600">
                          <MessageSquare size={16} />
                          Send Feedback
                        </Link>
                      </div>

                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <button onClick={handleLogout} className="inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700">
                  <User size={16} />
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                  <Sparkles size={16} />
                  Create Account
                </Link>
              </>
            )}
          </div>

          <button className="rounded-full border border-slate-200 bg-white/88 p-2.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:hidden" onClick={() => setIsMobileMenuOpen((prev) => !prev)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 overflow-hidden px-4 pb-4 md:hidden"
          >
            <div className="glass-panel space-y-3 rounded-[1.75rem] p-4">
              {isEmployer && !isAdmin ? (
                <Link
                  to="/post-job"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#2355d9,_#0ea5b7)] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(35,85,217,0.2)]"
                >
                  <Plus size={16} />
                  Post Job
                </Link>
              ) : null}

              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActiveRoute(item.to) ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to={dashboardPath} className="block rounded-2xl px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Dashboard</Link>
                  <Link to="/profile" className="block rounded-2xl px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Profile</Link>
                  <Link to="/settings" className="block rounded-2xl px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Settings</Link>
                  <button onClick={handleLogout} className="block rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block rounded-2xl px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">Login</Link>
                  <Link to="/signup" className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white">Create Account</Link>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
