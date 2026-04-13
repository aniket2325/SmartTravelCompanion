import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Map, Shield, Wallet, FileText,
  Globe, Plane, Users, Cloud, Trophy, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Sparkles, Coins, Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/planner', icon: Sparkles, label: 'AI Planner' },
  { to: '/dashboard/maps', icon: Map, label: 'GPS Finder' },
  { to: '/dashboard/safety', icon: Shield, label: 'SOS Safety' },
  { to: '/dashboard/budget', icon: Wallet, label: 'Budget' },
  { to: '/dashboard/docs', icon: FileText, label: 'Doc Vault' },
  { to: '/dashboard/visa', icon: Globe, label: 'Visa Checker' },
  { to: '/dashboard/group', icon: Users, label: 'Group Travel' },
  { to: '/dashboard/weather', icon: Cloud, label: 'Weather' },
  { to: '/dashboard/currency', icon: Coins, label: 'Currency' },
  { to: '/dashboard/bookings', icon: Plane, label: 'Bookings' },
  { to: '/dashboard/rewards', icon: Trophy, label: 'Rewards' },
  { to: '/dashboard/profile', icon: Settings, label: 'Profile' },
]

const SidebarContent = ({ type, collapsed, user, setMobileOpen, handleSignOut }) => {
  const name = user?.name || 'Traveller'
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <div className="flex flex-col h-full relative">
      {/* Subtle gradient background in sidebar */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-[50%]"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.03))' }}
        />
      </div>

      {/* Logo */}
      <div className={clsx('flex items-center gap-3 p-6 border-b border-white/10 relative z-10', collapsed && 'justify-center')}>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
        >
          <Plane size={20} className="text-white rotate-45" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-display font-extrabold text-lg tracking-tight text-white leading-none">Smart Travel</span>
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-sky-300 mt-0.5">Companion</span>
          </motion.div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide relative z-10">
        {NAV_ITEMS.map(({ to, icon: Icon, label }, i) => (
          <NavLink
            key={`${type}-${to}`}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx('nav-item relative group', isActive && 'active', collapsed && 'justify-center px-0')
            }
          >
            <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Icon size={18} className="flex-shrink-0" />
            </motion.div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-[13px]"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/10 space-y-2 relative z-10">
        {!collapsed && user && (
          <div className="p-3.5 rounded-xl mb-2 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400/30 to-sky-400/10 border border-sky-400/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{capitalizedName}</p>
                <p className="text-sky-200/70 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={clsx('nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/10 mb-1', collapsed && 'justify-center px-0')}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sign out</span>}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => { signOut(); navigate('/signin') }

  return (
    <>
      <AnimatePresence>
        {/* Mobile toggle */}
        <motion.button
          key="mobile-nav-toggle"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setMobileOpen(v => !v)}
          className="lg:hidden fixed top-4 right-4 z-50 w-12 h-12 glass-card flex items-center justify-center bg-white/80"
        >
          {mobileOpen ? <X size={20} className="text-slate-900" key="x-icon" /> : <Menu size={20} className="text-slate-900" key="menu-icon" />}
        </motion.button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <motion.div key="mobile-nav-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md" onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <aside key="mobile-nav-drawer"
          className={clsx('lg:hidden fixed top-0 left-0 z-50 h-full w-72 border-r border-white/10 transition-transform duration-500 ease-in-out', mobileOpen ? 'translate-x-0' : '-translate-x-full')}
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)' }}
        >
          <SidebarContent type="mobile" collapsed={false} user={user} setMobileOpen={setMobileOpen} handleSignOut={handleSignOut} />
        </aside>
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/10 transition-all duration-500 ease-in-out z-30',
        collapsed ? 'w-[76px]' : 'w-[250px]'
      )} style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)', backdropFilter: 'blur(30px)' }}>
        <SidebarContent type="desktop" collapsed={collapsed} user={user} setMobileOpen={setMobileOpen} handleSignOut={handleSignOut} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-24 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all z-40 shadow-sm"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  )
}