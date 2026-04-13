import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Send, DollarSign, MessageCircle, MapPin, Calendar, CheckCircle2, ChevronRight, PieChart, Info
} from 'lucide-react'
import clsx from 'clsx'
import PageWrapper from '../components/Layout/PageWrapper'

const MOCK_GROUPS = [
  { id: 1, name: 'Bali Summer 2026', destination: 'Bali, Indonesia', date: 'Jul 15 - Jul 25, 2026', members: 4, expenses: 15400, yourShare: 3850 },
  { id: 2, name: 'European Tour', destination: 'Paris, France', date: 'Sep 10 - Sep 20, 2026', members: 6, expenses: 45000, yourShare: 7500 }
]

const MOCK_MEMBERS = [
  { name: 'Aniket Kumar', role: 'Admin', avatar: 'bg-blue-500', color: 'text-white' },
  { name: 'Sarah Patel', role: 'Member', avatar: 'bg-emerald-500', color: 'text-white' },
  { name: 'John Doe', role: 'Member', avatar: 'bg-purple-500', color: 'text-white' },
  { name: 'Aisha Khan', role: 'Member', avatar: 'bg-amber-500', color: 'text-white' }
]

const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}

export default function GroupTravel() {
  const [activeGroup, setActiveGroup] = useState(MOCK_GROUPS[0].id)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const handleInvite = (e) => {
    e.preventDefault()
    if(!inviteEmail) return
    setInviteEmail('')
    setShowInvite(false)
  }

  const group = MOCK_GROUPS.find(g => g.id === activeGroup)

  return (
    <PageWrapper
      icon={Users}
      title="Group Travel"
      subtitle="Collaborate, split expenses, and plan together"
      iconColor="text-indigo-500"
      iconBg="bg-indigo-100"
    >
      {({ fadeSlide }) => (
        <div className="max-w-6xl space-y-6">
          
          {/* Top Control Bar */}
          <motion.div variants={fadeSlide} className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/40 shadow-sm">
            <div className="flex gap-2 p-1 overflow-x-auto w-full sm:w-auto scrollbar-hide">
              {MOCK_GROUPS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={clsx(
                    'px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                    activeGroup === g.id
                      ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-indigo-600 border border-indigo-100'
                      : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full sm:w-auto text-sm px-5 py-2.5 rounded-xl shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400">
              <UserPlus size={16} /> Create Group
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Group Details & Members */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Info Card */}
              <motion.div variants={fadeSlide} className="glass-card p-6 border-indigo-100/50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-5 border border-indigo-100">
                  <MapPin size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{group.destination}</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2 font-medium">
                  <Calendar size={14} className="text-slate-400" />
                  {group.date}
                </div>
                <hr className="my-5 border-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {MOCK_MEMBERS.map((m, i) => (
                      <div key={i} className={clsx("w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm", m.avatar, m.color)}>
                        {m.name[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{group.members} Members</span>
                </div>
              </motion.div>

              {/* Members List */}
              <motion.div variants={fadeSlide} className="glass-card overflow-hidden">
                <div className="p-5 border-b border-white/20 bg-white/30 backdrop-blur-sm flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800">Trip Members</h3>
                  <button onClick={() => setShowInvite(!showInvite)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
                    <UserPlus size={14} />
                  </button>
                </div>

                <AnimatePresence>
                  {showInvite && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-indigo-100 bg-indigo-50/50 p-4">
                      <form onSubmit={handleInvite} className="flex gap-2">
                        <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="Email to invite" className="input-field text-xs py-2 bg-white" />
                        <button type="submit" className="bg-indigo-500 text-white px-3 rounded-xl hover:bg-indigo-600 transition-colors"><Send size={14} /></button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-2">
                  {MOCK_MEMBERS.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/40 rounded-xl transition-colors cursor-default">
                      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm", m.avatar, m.color)}>
                        {m.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700">{m.name}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">{m.role}</p>
                      </div>
                      {m.role === 'Admin' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Expenses & Chat */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Expenses Overview */}
              <motion.div variants={fadeSlide} className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Group Expense</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">₹{group.expenses.toLocaleString()}</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your Split Balance</p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{group.yourShare.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* Discussion Board Placeholder */}
              <motion.div variants={fadeSlide} className="glass-card p-6 sm:p-8 flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center mb-5 shadow-inner">
                  <MessageCircle size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Group Chat & Planning</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6">Real-time messaging, shared itineraries, and automated expense splitting are currently in beta.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest">
                  <Info size={14} /> Full Feature Releasing Soon
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
