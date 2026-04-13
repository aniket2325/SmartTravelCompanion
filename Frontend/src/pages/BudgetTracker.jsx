import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Plus, Trash2, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, Utensils, Car, Hotel,
  Ticket, MoreHorizontal, Save, ArrowRight, FileText,
  MapPin, Edit3, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { expensesAPI, tripsAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

const CATEGORIES = [
  { id: 'food',      label: 'Food',          icon: <Utensils size={16}/>,    color: 'text-amber-500',  bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'transport', label: 'Transport',     icon: <Car size={16}/>,         color: 'text-blue-500',   bg: 'bg-blue-50',  border: 'border-blue-200' },
  { id: 'hotel',     label: 'Accommodation', icon: <Hotel size={16}/>,       color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'activity',  label: 'Activities',    icon: <Ticket size={16}/>,      color: 'text-emerald-500',   bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  { id: 'shopping',  label: 'Shopping',      icon: <ShoppingBag size={16}/>, color: 'text-pink-500',   bg: 'bg-pink-50',  border: 'border-pink-200' },
  { id: 'other',     label: 'Other',         icon: <MoreHorizontal size={16}/>, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function BudgetTracker() {
  const [expenses, setExpenses] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ desc: '', amount: '', cat: 'food' })
  const [activeCat, setActiveCat] = useState('all')
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')

  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const budget = selectedTrip ? selectedTrip.budget : 0
  const remaining = budget - total
  const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0

  const catTotals = CATEGORIES.map((c) => ({
    ...c,
    total: expenses
      .filter((e) => e.cat === c.id || e.category === c.id) // Fix potential .cat vs .category
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  }))

  const loadExpenses = async () => {
    if (!selectedTrip) return
    setLoading(true)
    try {
      const res = await expensesAPI.getAll()
      const tripExpenses = res.data?.data?.filter(exp => exp.trip === selectedTrip._id) || []
      setExpenses(tripExpenses)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const loadTrips = async () => {
    try {
      const res = await tripsAPI.getAll()
      setTrips(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load trips')
    }
  }

  const updateTripBudget = async () => {
    if (!selectedTrip || !budgetInput) return

    try {
      const newBudget = parseFloat(budgetInput)
      if (isNaN(newBudget) || newBudget < 0) {
        toast.error('Please enter a valid budget amount')
        return
      }

      await tripsAPI.update(selectedTrip._id, { budget: newBudget })
      setTrips(prev => prev.map(trip => 
        trip._id === selectedTrip._id ? { ...trip, budget: newBudget } : trip
      ))
      setSelectedTrip(prev => ({ ...prev, budget: newBudget }))
      setEditingBudget(false)
      toast.success('Budget updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update budget')
    }
  }

  useEffect(() => { loadTrips() }, [])
  useEffect(() => {
    if (selectedTrip) {
      setBudgetInput(selectedTrip.budget.toString())
      loadExpenses()
    }
  }, [selectedTrip])

  const addExpense = async () => {
    if (!selectedTrip) { toast.error('Please select a trip first'); return }
    if (!form.desc || !form.amount) { toast.error('Fill in all fields'); return }

    const payload = {
      desc: form.desc,
      amount: parseFloat(form.amount),
      category: form.cat,
      date: new Date().toISOString(),
      currency: '₹',
      trip: selectedTrip._id
    }

    try {
      const res = await expensesAPI.create(payload)
      setExpenses((prev) => [res.data?.data, ...prev])
      setForm({ desc: '', amount: '', cat: 'food' })
      setAdding(false)
      toast.success('Expense added')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to add expense')
    }
  }

  const deleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id)
      setExpenses((prev) => prev.filter((expense) => expense._id !== id))
      toast.success('Expense removed')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to remove expense')
    }
  }

  const filtered = activeCat === 'all' ? expenses : expenses.filter((e) => e.category === activeCat)
  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]

  return (
    <PageWrapper icon={Wallet} title="Budget Tracker" subtitle="Manage your trip finances" iconColor="text-amber-500" iconBg="bg-amber-100">
      <div className="flex justify-between items-center glass-card rounded-[18px] p-6 shadow-sm">
        <div className="flex-1 max-w-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select Trip</label>
          <select
            value={selectedTrip?._id || ''}
            onChange={(e) => setSelectedTrip(trips.find(t => t._id === e.target.value))}
            className="input-field bg-slate-50 shadow-inner"
          >
            <option value="">Select a trip...</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.destination} ({trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Total Budget</label>
            <div className="flex items-center justify-end gap-2">
              {editingBudget ? (
                <>
                  <span className="text-slate-800 font-bold">₹</span>
                  <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} className="input-field w-24 py-1.5" placeholder="0" />
                  <button onClick={updateTripBudget} className="btn-primary px-3 py-1.5"><Check size={16} /></button>
                </>
              ) : (
                <>
                  <span className="text-2xl font-display font-extrabold text-slate-800">
                    ₹{selectedTrip ? selectedTrip.budget.toLocaleString() : '0'}
                  </span>
                  <button onClick={() => setEditingBudget(true)} className="btn-outline px-3 py-1.5" disabled={!selectedTrip}><Edit3 size={16} /></button>
                </>
              )}
            </div>
          </div>
          <button onClick={() => setAdding((v) => !v)} className="btn-primary px-5 py-3 h-fit text-sm shadow-lg shadow-blue-500/20 ml-4" disabled={!selectedTrip}>
            <Plus size={16} /> New Expense
          </button>
        </div>
      </div>

      {selectedTrip ? (
        <>
          <AnimatePresence>
            {adding && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-blue-800">Log New Expense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Description</label>
                      <input className="input-field bg-white/50 backdrop-blur-sm" placeholder="What did you buy?" value={form.desc} onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Amount (₹)</label>
                      <input className="input-field bg-white/50 backdrop-blur-sm" type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Category</label>
                      <select className="input-field bg-white/50 backdrop-blur-sm appearance-none" value={form.cat} onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))}>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => setAdding(false)} className="btn-outline px-6 py-2.5 text-sm bg-white">Cancel</button>
                    <button onClick={addExpense} className="btn-primary px-8 py-2.5 text-sm shadow-blue-500/30 shadow-md"><Save size={16} /> Save Transaction</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-[18px] p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={48} className="text-slate-400" /></div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Budget</p>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-500 text-xl font-medium">₹</span>
                <span className="text-4xl font-display font-extrabold text-slate-800">{budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="glass-card rounded-[18px] border-amber-200/40 p-6 relative overflow-hidden shadow-sm shadow-amber-500/5">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={48} className="text-amber-500" /></div>
              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">Total Spent</p>
              <div className="flex items-baseline gap-1">
                <span className="text-amber-500 text-xl font-medium">₹</span>
                <span className="text-4xl font-display font-extrabold text-amber-500">{total.toLocaleString()}</span>
              </div>
            </div>

            <div className={clsx('glass-card rounded-[18px] border p-6 relative overflow-hidden shadow-sm', remaining < 0 ? 'border-red-200 shadow-red-500/5' : 'border-emerald-200 shadow-emerald-500/5')}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                {remaining < 0 ? <TrendingDown size={48} className="text-red-500" /> : <Save size={48} className="text-emerald-500" />}
              </div>
              <p className={clsx('text-xs font-bold uppercase tracking-widest mb-2', remaining < 0 ? 'text-red-500' : 'text-emerald-600')}>Remaining Balance</p>
              <div className="flex items-baseline gap-1">
                <span className={clsx('text-xl font-medium', remaining < 0 ? 'text-red-500' : 'text-emerald-500')}>₹</span>
                <span className={clsx('text-4xl font-display font-extrabold', remaining < 0 ? 'text-red-600' : 'text-emerald-600')}>
                  {Math.abs(remaining).toLocaleString()}
                </span>
                {remaining < 0 && <span className="text-red-500 text-xs font-bold ml-1 uppercase">Over</span>}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[18px] p-8 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h4 className="font-display font-bold text-lg text-slate-800">Budget Utilization</h4>
                <p className="text-slate-500 text-xs">Based on current trip expenses</p>
              </div>
              <div className="text-right">
                <span className={clsx('text-2xl font-display font-extrabold', pct > 90 ? 'text-red-500' : pct > 70 ? 'text-amber-500' : 'text-blue-500')}>
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={clsx('h-full shadow-lg transition-colors',
                  pct > 90 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                  pct > 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-blue-600 to-blue-400')}
              />
            </div>
            {pct > 85 && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold"
              >
                <TrendingUp size={14} /> Warning: You've exceeded 85% of your planned budget for this trip.
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-slate-800">By Category</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Analytics</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {catTotals.filter((c) => c.total > 0).map((c, i) => (
                  <motion.div key={i} whileHover={{ x: 5 }}
                    className={clsx('glass-card rounded-[18px] p-4 border flex items-center gap-4 cursor-pointer group transition-all shadow-sm', c.border)}
                    onClick={() => setActiveCat(activeCat === c.id ? 'all' : c.id)}
                  >
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg, c.color)}>{c.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{c.label}</p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className={clsx('h-full', c.color.replace('text', 'bg'))} style={{ width: `${(c.total / total) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={clsx('text-base font-extrabold', c.color)}>₹{c.total.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{Math.round((c.total / total) * 100)}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-slate-800">Transactions</h2>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={() => setActiveCat('all')}
                    className={clsx('text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all shadow-sm', activeCat === 'all' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white/40 backdrop-blur-sm border-white/30 text-slate-500 hover:bg-white/60')}
                  >All</button>
                  {CATEGORIES.filter((c) => expenses.some((e) => e.category === c.id || e.cat === c.id)).map((c) => (
                    <button key={c.id} onClick={() => setActiveCat(activeCat === c.id ? 'all' : c.id)}
                      className={clsx('text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all shadow-sm', activeCat === c.id ? `${c.bg} ${c.border} ${c.color}` : 'bg-white/40 backdrop-blur-sm border-white/30 text-slate-500 hover:bg-white/60')}
                    >{c.label}</button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[18px] overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading expenses…</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FileText size={24} className="text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-semibold">No transactions found</p>
                      <p className="text-slate-500 text-xs mt-1">Try changing your filters or add a new expense</p>
                    </div>
                  ) : (
                    filtered.map((exp, i) => {
                      const cat = getCat(exp.category || exp.cat)
                      return (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={exp._id}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                        >
                          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border', cat.bg, cat.color, cat.border)}>{cat.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{exp.description || exp.desc}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border', cat.bg, cat.color, cat.border)}>{cat.label}</span>
                              <span className="text-slate-400 text-[10px] font-medium tracking-tight whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <p className={clsx('font-black text-base tabular-nums', exp.amount === 0 ? 'text-blue-500' : 'text-slate-800')}>
                              {exp.amount === 0 ? 'FREE' : `₹${exp.amount.toLocaleString()}`}
                            </p>
                            <button onClick={() => deleteExpense(exp._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            ><Trash2 size={16} /></button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MapPin size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-3">Select a Trip</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Choose a trip from the dropdown above to start tracking your expenses and managing your budget.</p>
        </motion.div>
      )}
    </PageWrapper>
  )
}
