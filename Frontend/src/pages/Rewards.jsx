import { useState, useEffect } from 'react'
import { Trophy, Star, Zap, Lock, CheckCircle2, TrendingUp, Globe, Map, Shield, Plane } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { rewardsAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

const rarityStyle = {
  common:    { label: 'Common',    color: 'text-slate-400',   border: 'border-slate-200',   bg: 'bg-slate-50' },
  uncommon:  { label: 'Uncommon',  color: 'text-emerald-500',   border: 'border-emerald-200', bg: 'bg-emerald-50' },
  rare:      { label: 'Rare',      color: 'text-blue-500',   border: 'border-blue-200', bg: 'bg-blue-50' },
  legendary: { label: 'Legendary', color: 'text-amber-500',  border: 'border-amber-300', bg: 'bg-amber-50' },
}

export default function Rewards() {
  const [rewards, setRewards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      const res = await rewardsAPI.get()
      setRewards(res.data.data)
    } catch (err) {
      toast.error('Failed to load rewards')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper icon={Trophy} title="Rewards & Badges" subtitle="Loading your travel achievements..." iconColor="text-amber-500" iconBg="bg-amber-100">
        <div className="flex items-center justify-center h-64 glass-card rounded-[20px] shadow-sm">
          <div className="text-slate-400 font-bold flex items-center gap-2"><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Loading rewards...</div>
        </div>
      </PageWrapper>
    )
  }

  if (!rewards) return null

  const earned = rewards.badges.filter(b => b.earned)
  const filtered = filter === 'all' ? rewards.badges : filter === 'earned' ? earned : rewards.badges.filter(b => !b.earned)

  return (
    <PageWrapper icon={Trophy} title="Rewards & Badges" subtitle={`${earned.length}/${rewards.badges.length} badges earned`} iconColor="text-amber-500" iconBg="bg-amber-100">

      <div className="max-w-4xl space-y-6 -mt-4">

        {/* Level card */}
        <div className="glass-card rounded-[20px] text-slate-800 border-amber-200/40 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none"><Trophy size={140} className="text-amber-500"/></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-1.5">Current Level</p>
              <div className="flex items-end gap-3 text-slate-800">
                <span className="text-5xl font-black text-amber-500 tabular-nums">Lv. {rewards.level}</span>
                <span className="text-slate-400 font-bold text-lg pb-1.5">Traveler</span>
              </div>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-amber-50 border-4 border-amber-200 flex items-center justify-center shadow-inner">
              <span className="text-4xl drop-shadow-sm">🗺️</span>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span className="text-slate-700">{rewards.xpIntoLevel} XP</span>
              <span>{rewards.xpForNextLevel} XP to Lv. {rewards.level + 1}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden" style={{ width: `${(rewards.xpIntoLevel/rewards.xpForNextLevel)*100}%` }}>
                <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Globe size={20}/>,  label: 'Total Trips',       val: rewards.stats.tripsCount.toString(),  color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
            { icon: <Trophy size={20}/>, label: 'Badges Earned',     val: rewards.stats.badgesEarned.toString(), color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
            { icon: <Star size={20}/>,   label: 'Total XP',          val: rewards.xp.toString(), color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
            { icon: <Zap size={20}/>,    label: 'Current Level',     val: rewards.level.toString(), color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          ].map((s, i) => (
            <div key={i} className={clsx('rounded-3xl p-6 border shadow-sm flex flex-col', s.bg, s.border)}>
              <div className={clsx('mb-4 w-10 h-10 rounded-xl bg-white flex items-center justify-center border shadow-sm', s.color, s.border)}>{s.icon}</div>
              <p className={clsx('text-3xl font-black mt-auto', s.color)}>{s.val}</p>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter + badges */}
        <div className="glass-card rounded-[20px] p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">Badge Collection</h2>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              {['all','earned','locked'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={clsx('text-[10px] font-bold px-4 py-2 rounded-lg capitalize transition-all shadow-none',
                    filter === f ? 'bg-white/50 backdrop-blur-sm text-blue-600 shadow-sm border border-white/30 text-sm' : 'text-slate-500 hover:text-slate-700 text-sm'
                  )}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(badge => {
              const r = rarityStyle[badge.rarity]
              return (
                <div key={badge.id} className={clsx('rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 border shadow-sm relative group',
                  badge.earned
                    ? clsx('hover:shadow-md hover:-translate-y-1', r.border, r.bg)
                    : 'opacity-60 bg-slate-50 border-slate-200 grayscale'
                )}>
                  <div className="relative">
                    <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform block">{badge.icon}</span>
                    {!badge.earned && <div className="absolute -bottom-1 -right-1 bg-slate-200 border border-slate-300 rounded-full p-1"><Lock size={12} className="text-slate-500" /></div>}
                    {badge.earned && <div className="absolute -bottom-1 -right-1 bg-emerald-100 border border-emerald-300 rounded-full p-1"><CheckCircle2 size={12} className="text-emerald-500" /></div>}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-800">{badge.name}</p>
                    <p className="text-slate-500 font-medium text-[10px] leading-snug mt-1 max-w-[120px]">{badge.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <span className={clsx('text-[10px] font-bold uppercase tracking-wider', r.color)}>{r.label}</span>
                    <span className="text-slate-300 text-[10px]">·</span>
                    <span className="text-amber-500 text-[10px] font-black flex items-center gap-0.5 bg-amber-100/50 px-1.5 py-0.5 rounded"><Zap size={10}/>{badge.xp} XP</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress milestones */}
        <div className="glass-card rounded-[20px] p-8 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-6">Next Milestones</h2>
          <div className="space-y-4">
            {[
              { text: 'Visit 2 more countries to unlock Globetrotter',   pct: 47, icon: '🌍' },
              { text: 'Generate 2 more AI itineraries to unlock AI Pioneer', pct: 60, icon: '🤖' },
              { text: 'Visit 3 beach destinations to unlock Beach Bum',  pct: 40, icon: '🏖️' },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition-colors group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-sm text-xl group-hover:scale-110 transition-transform">
                      {m.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-700 flex-1">{m.text}</p>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded">{m.pct}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner ml-14">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
