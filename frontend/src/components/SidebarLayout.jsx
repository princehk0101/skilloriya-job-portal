import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, LogOut, ArrowLeft, Menu, X } from 'lucide-react'

const SidebarLayout = ({ children, title, role, profile }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_profile')
    navigate('/login')
  }

  const adminLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/', icon: ArrowLeft, label: 'Back to Home' }
  ]

  const employerLinks = [
    { to: '/employer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/post-job', icon: Briefcase, label: 'Post Job' },
    { to: '/', icon: ArrowLeft, label: 'Back to Home' }
  ]

  const links = role === 'admin' ? adminLinks : employerLinks

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 -translate-x-full bg-white border-r border-slate-200 transition-transform lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : ''}`}>
        <div className="flex h-16 items-center px-6 border-b border-slate-100 justify-between">
          <Link to="/" className="text-xl font-bold text-blue-700">Skilloria {role === 'admin' ? 'Admin' : 'Employer'}</Link>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>
        <div className="p-4 flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const active = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 border-t border-slate-100">
            <div className="px-3 mb-4">
              <p className="text-sm font-bold truncate">{profile?.email || 'My Account'}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
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
