import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Shield, Wallet, Globe, Plane, Cloud,
  Bell, Search, ArrowUpRight, Sparkles, MapPin,
  CheckCircle2, LogOut, Trophy, Calendar, Zap,
  TrendingUp, Navigation, Compass, Star, Settings
} from 'lucide-react'
import clsx from 'clsx'
import { tripsAPI, documentsAPI, expensesAPI } from '../services/api'

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'AI Trip Planner', desc: 'Generate itinerary', route: '/dashboard/planner', gradient: 'from-blue-500 to-indigo-500', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600', shadow: 'hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]' },
  { icon: Shield, label: 'SOS Alert', desc: 'Emergency contacts', route: '/dashboard/safety', gradient: 'from-red-500 to-rose-500', iconBg: 'bg-red-500/10', iconColor: 'text-red-500', shadow: 'hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]' },
  { icon: Globe, label: 'Visa Checker', desc: 'Entry requirements', route: '/dashboard/visa', gradient: 'from-indigo-500 to-violet-500', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600', shadow: 'hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]' },
  { icon: Map, label: 'GPS Finder', desc: 'Nearby places', route: '/dashboard/maps', gradient: 'from-purple-500 to-fuchsia-500', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600', shadow: 'hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)]' },
  { icon: Wallet, label: 'Budget Tracker', desc: 'Track spending', route: '/dashboard/budget', gradient: 'from-amber-500 to-orange-500', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', shadow: 'hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]' },
  { icon: Cloud, label: 'Weather', desc: '7-day forecast', route: '/dashboard/weather', gradient: 'from-sky-500 to-cyan-500', iconBg: 'bg-sky-500/10', iconColor: 'text-sky-600', shadow: 'hover:shadow-[0_10px_30px_rgba(14,165,233,0.15)]' },
]

const statConfig = {
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-white/30', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(147,197,253,0.15) 50%, rgba(255,255,255,0.4) 100%)', hoverGlow: '0 8px 32px rgba(59,130,246,0.2)', accentColor: '#3b82f6' },
  indigo: { bg: 'bg-indigo-500/15', text: 'text-indigo-600', border: 'border-white/30', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(165,180,252,0.15) 50%, rgba(255,255,255,0.4) 100%)', hoverGlow: '0 8px 32px rgba(99,102,241,0.2)', accentColor: '#6366f1' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-white/30', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(252,211,77,0.12) 50%, rgba(255,255,255,0.4) 100%)', hoverGlow: '0 8px 32px rgba(245,158,11,0.2)', accentColor: '#f59e0b' },
  green: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-white/30', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(110,231,183,0.12) 50%, rgba(255,255,255,0.4) 100%)', hoverGlow: '0 8px 32px rgba(16,185,129,0.2)', accentColor: '#10b981' },
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const fadeSlide = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}

export default function DashboardHome() {
  const { user, signOut } = useAuth()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const headerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowNotifs(false)
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const [data, setData] = useState({ trips: [], documents: [], expenses: [], loading: true })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    (async () => {
      try {
        const [t, d, e] = await Promise.all([tripsAPI.getAll(), documentsAPI.getAll(), expensesAPI.getAll()])
        setData({ trips: t.data?.data || [], documents: d.data?.data || [], expenses: e.data?.data || [], loading: false })
      } catch { setData(p => ({ ...p, loading: false })) }
    })()
  }, [])

  const upcoming = data.trips.filter(t => new Date(t.startDate) > new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, 3)
  let totalBudget = 0, remaining = 0
  if (upcoming[0]) {
    totalBudget = parseFloat(upcoming[0].budget) || 0
    const spent = data.expenses.filter(e => e.trip === upcoming[0]._id).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
    remaining = totalBudget - spent
  }

  const stats = [
    { label: 'Trips Planned', value: data.trips.length.toString(), delta: `${upcoming.length} upcoming`, icon: Plane, color: 'blue' },
    { label: 'Budget Left', value: `₹${remaining.toLocaleString()}`, delta: totalBudget > 0 ? `${Math.round((remaining / totalBudget) * 100)}% left` : 'No budget set', icon: Wallet, color: 'indigo' },
    { label: 'Docs Stored', value: data.documents.length.toString(), delta: 'All current', icon: Globe, color: 'amber' },
    { label: 'Safety Score', value: '94%', delta: 'Excellent', icon: Shield, color: 'green' },
  ]

  const name = (user?.name || 'Traveller').charAt(0).toUpperCase() + (user?.name || 'Traveller').slice(1)

  if (data.loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-[1200px] w-full mx-auto">
        {/* Animated Shimmer Overlay */}
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          .skeleton-box {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(224, 242, 254, 0.3), rgba(186, 230, 253, 0.15));
            border-radius: 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5);
          }
          .skeleton-box::after {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
            animation: shimmer 2s infinite;
            content: '';
          }
        `}</style>
        
        {/* Hero Skeleton */}
        <div className="space-y-4 pt-16">
          <div className="h-6 w-24 skeleton-box rounded-full" />
          <div className="h-10 w-96 skeleton-box" />
          <div className="h-4 w-72 skeleton-box" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 skeleton-box" />
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 w-32 skeleton-box" />
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 skeleton-box rounded-[18px]" />
            ))}
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid lg:grid-cols-5 gap-6 pt-2">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-5 w-40 skeleton-box" />
            {[...Array(2)].map((_, i) => <div key={i} className="h-20 skeleton-box rounded-[18px]" />)}
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 w-40 skeleton-box" />
            <div className="h-44 skeleton-box rounded-[18px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide h-full min-h-[0] transform-gpu will-change-scroll">
      {/* Top bar */}
      <header ref={headerRef} className="sticky top-0 z-30 border-b border-sky-100/40 px-6 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(240,249,255,0.5))', backdropFilter: 'blur(24px)' }}>
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search destinations, trips…" className="border border-sky-200/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 w-72 transition-all duration-300 shadow-sm" style={{ background: 'rgba(255,255,255,0.6)' }} />
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Notification */}
          <div className="relative">
            <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
              className="relative w-10 h-10 rounded-xl border border-sky-200/50 flex items-center justify-center hover:border-sky-300 transition-all duration-300 shadow-sm cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              <Bell size={16} className="text-slate-500" />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              />
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 z-50 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">1 New</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] transition-all">
                      <Sparkles size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">AI Planner is ready!</p>
                      <p className="text-xs text-slate-500 mt-0.5">Generate your first itinerary.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Profile */}
          <div className="relative">
            <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-600 flex items-center justify-center text-white text-sm font-bold hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer"
            >{user?.name?.[0]?.toUpperCase() ?? 'U'}</button>
            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-60 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl py-2 z-50 shadow-2xl"
                >
                  <div className="px-4 py-3.5 border-b border-slate-100 mb-1">
                    <p className="font-bold text-sm text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="px-2 pb-1 space-y-0.5">
                    <button onClick={() => { setShowProfile(false); navigate('/dashboard/rewards') }} className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-all">
                      <Trophy size={15} className="text-amber-500" /> Rewards
                    </button>
                    <button onClick={() => { setShowProfile(false); navigate('/dashboard/profile') }} className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-all">
                      <Settings size={15} className="text-blue-500" /> Profile & Settings
                    </button>
                    <button onClick={() => { signOut(); navigate('/signin') }} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-all">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <motion.main variants={stagger} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8 max-w-[1200px]">

        {/* ── Hero Greeting ── */}
        <motion.div variants={fadeSlide} className="relative">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-blue-600 bg-blue-100 border border-blue-200 shadow-sm"
            >
              <Zap size={11} className="text-blue-500" /> {greeting}
            </motion.div>
          </div>
          <h1 className="text-3xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900">
            Welcome back,{' '}
            <span className="relative">
              <span className="text-gradient-animated">{name}</span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              />
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-3 max-w-lg leading-relaxed">
            {upcoming.length > 0
              ? `You have ${upcoming.length} upcoming trip${upcoming.length > 1 ? 's' : ''} ahead. Let's make them unforgettable.`
              : 'Your AI travel command center is ready. Where do you want to go next?'
            }
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div variants={fadeSlide} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, delta, icon: Icon, color }, i) => {
            const c = statConfig[color]
            return (
              <motion.div key={label} variants={fadeSlide}
                whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="relative group cursor-default rounded-[20px] p-5 overflow-hidden transition-all duration-300 transform-gpu"
                style={{
                  willChange: 'transform, opacity',
                  background: c.gradient,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = c.hoverGlow}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)'}
              >
                {/* Top accent bar */}
                <motion.div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.accentColor}, transparent)` }}
                />
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.7s ease, opacity 0.3s' }} />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    className={clsx('w-11 h-11 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm', c.bg)}
                    style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                  >
                    <Icon size={20} className={c.text} />
                  </motion.div>
                  <ArrowUpRight size={14} className="text-white/40 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </div>
                <p className="text-2xl lg:text-3xl font-extrabold mb-1 tracking-tight text-slate-800">{value}</p>
                <p className="text-slate-600 text-xs font-semibold">{label}</p>
                <p className={clsx('text-[11px] mt-2 font-bold', c.text)}>{delta}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={fadeSlide}>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-extrabold text-lg tracking-tight text-slate-800">Quick Actions</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, desc, route, iconBg, iconColor, shadow }, i) => (
              <motion.button key={label} variants={fadeSlide}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(route)}
                className={clsx(
                  'relative p-5 w-full flex flex-col items-center text-center gap-3 cursor-pointer group',
                  'rounded-[18px] overflow-hidden transform-gpu',
                  'transition-all duration-300',
                  shadow
                )}
                style={{
                  willChange: 'transform',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.5), rgba(224,242,254,0.3))',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
                }}
              >
                {/* Hover gradient fill */}
                <div className={`absolute inset-0 bg-gradient-to-br ${QUICK_ACTIONS[i].gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 rounded-[18px]`} />

                <motion.div
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  className={clsx('w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10 backdrop-blur-sm', iconBg)}
                  style={{ border: '1px solid rgba(255,255,255,0.4)' }}
                >
                  <Icon size={22} className={iconColor} />
                </motion.div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
                  <p className="text-slate-500 text-[10px] font-medium mt-1">{desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Upcoming Trips + Activity ── */}
        <motion.div variants={fadeSlide} className="grid lg:grid-cols-5 gap-6">
          {/* Trips — wider */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-lg tracking-tight text-slate-800">Upcoming Trips</h2>
              <button onClick={() => navigate('/dashboard/planner')} className="text-blue-500 text-xs hover:text-blue-600 flex items-center gap-1.5 transition-colors font-semibold">
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {upcoming.length > 0 ? upcoming.map((trip, i) => (
                <motion.div key={trip._id}
                  whileHover={{ x: 6 }}
                  className="rounded-[18px] px-5 py-4 flex items-center gap-4 cursor-pointer group transition-all transform-gpu"
                  style={{
                    willChange: 'transform',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(186,230,253,0.2))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
                  }}
                >
                  <motion.div whileHover={{ rotate: -15 }}
                    className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:shadow-[0_4px_15px_rgba(59,130,246,0.15)] transition-all"
                  >
                    <Plane size={20} className="text-blue-500 -rotate-12" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{trip.destination}</p>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5 font-medium">
                      <Calendar size={11} className="text-slate-400" />
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">planned</span>
                </motion.div>
              )) : (
                <div className="rounded-[20px] px-5 py-12 text-center relative overflow-hidden transform-gpu" style={{ willChange: 'transform', background: 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(186,230,253,0.2))', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 to-transparent" />
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}
                  >
                    <MapPin size={28} className="text-sky-400" />
                  </motion.div>
                  <p className="text-slate-800 text-sm font-bold relative z-10">No upcoming trips</p>
                  <p className="text-slate-500 text-xs mt-1.5 mb-6 relative z-10">Let AI plan your perfect adventure</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard/planner')} className="btn-primary text-xs px-6 py-2.5 mx-auto relative z-10"
                  >
                    <Sparkles size={14} /> Plan with AI
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Activity — narrower */}
          <div className="lg:col-span-2">
            <h2 className="font-extrabold text-lg tracking-tight text-slate-800 mb-4">Travel Insights</h2>
            <div className="space-y-3">
              {/* Mini insight cards */}
              {[
                { icon: TrendingUp, label: 'Trip Efficiency', value: 'High', color: 'text-emerald-500', bg: 'bg-emerald-50 border border-emerald-100' },
                { icon: Navigation, label: 'Distance Covered', value: '0 km', color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100' },
                { icon: Star, label: 'Traveler Rating', value: '4.9★', color: 'text-amber-500', bg: 'bg-amber-50 border border-amber-100' },
              ].map(({ icon: Icon, label, value, color, bg }, i) => (
                <motion.div key={label} whileHover={{ x: 4 }}
                  className="rounded-[18px] px-5 py-4 flex items-center gap-4 cursor-default group transition-all transform-gpu"
                  style={{
                    willChange: 'transform',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.45), rgba(186,230,253,0.2))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
                  }}
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-500 text-xs font-semibold">{label}</p>
                    <p className="font-bold text-sm text-slate-800 mt-0.5">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── AI Banner ── */}
        <motion.div variants={fadeSlide}
          whileHover={{ scale: 1.005 }}
          className="relative rounded-[20px] overflow-hidden cursor-pointer group transition-all duration-500 transform-gpu"
          onClick={() => navigate('/dashboard/planner')}
          style={{
            willChange: 'transform',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(186,230,253,0.25) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div className="absolute -right-10 -top-10 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity, delay: 2 }}
            />
            {/* Small animated dots */}
            {[...Array(5)].map((_, i) => (
              <motion.div key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40"
                style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>

          <div className="relative z-10 p-8 flex items-center justify-between gap-8 flex-wrap">
            <div>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-blue-600 bg-blue-100 border border-blue-200 mb-4"
              >
                <Sparkles size={11} className="animate-pulse" /> Powered by Gemini AI
              </motion.div>
              <h3 className="font-extrabold text-xl mb-2 tracking-tight text-slate-800">Ready to plan your next trip?</h3>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed font-medium">Enter destination + budget → get a complete day-by-day itinerary with restaurants, activities, and costs in seconds.</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary flex-shrink-0 px-8 py-4 text-sm font-extrabold shadow-blue-500/30 shadow-lg">
              <Sparkles size={16} /> Use Gemini AI
            </motion.div>
          </div>
        </motion.div>

      </motion.main>
    </div>
  )
}