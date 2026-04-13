import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Shield, Bell, Globe, Wallet, MapPin,
  Lock, Eye, EyeOff, Save, Check, X, ChevronRight,
  Plane, Trophy, Zap, Calendar, AlertTriangle, Moon, Sun,
  Languages, Ruler, Phone, Heart, Camera, Edit3, LogOut,
  CreditCard, BellRing, BellOff, ShieldCheck, ShieldAlert,
  Coins
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

/* ─── Animation Variants ─── */
const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}

/* ─── Currency Options ─── */
const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
  { code: 'THB', label: 'Thai Baht (฿)', symbol: '฿' },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
]

/* ─── Toggle Switch Component ─── */
function ToggleSwitch({ enabled, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 cursor-pointer flex-shrink-0',
        enabled
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_2px_10px_rgba(59,130,246,0.4)]'
          : 'bg-slate-200'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={clsx(
          'inline-block h-5 w-5 rounded-full bg-white shadow-md',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

/* ─── Section Card Wrapper ─── */
function SectionCard({ title, icon: Icon, iconColor, iconBg, children, className = '' }) {
  return (
    <motion.div
      variants={fadeSlide}
      className={clsx(
        'glass-card rounded-[20px] p-6 lg:p-8 shadow-sm relative overflow-hidden group transform-gpu',
        className
      )}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/50', iconBg)}
        >
          <Icon size={18} className={iconColor} />
        </motion.div>
        <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">{title}</h2>
      </div>

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

/* ─── Setting Row ─── */
function SettingRow({ icon: Icon, iconColor, label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100', 'bg-slate-50/80')}>
          <Icon size={16} className={iconColor || 'text-slate-400'} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-700">{label}</p>
          {description && <p className="text-xs text-slate-400 mt-0.5 font-medium">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}


export default function ProfileSettings() {
  const { user, signOut, updateUser } = useAuth()
  const navigate = useNavigate()

  /* ─── Profile Edit State ─── */
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  /* ─── Preferences State ─── */
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR')
  const [language, setLanguage] = useState(user?.preferences?.language || 'en')
  const [units, setUnits] = useState(localStorage.getItem('stc_units') || 'km')
  const [darkMode, setDarkMode] = useState(localStorage.getItem('stc_darkmode') === 'true')

  /* ─── Notification State ─── */
  const [notifEmail, setNotifEmail] = useState(user?.preferences?.notifications !== false)
  const [notifTrips, setNotifTrips] = useState(true)
  const [notifBudget, setNotifBudget] = useState(true)
  const [notifSOS, setNotifSOS] = useState(true)

  /* ─── Password State ─── */
  const [showPwSection, setShowPwSection] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  /* ─── Derived Data ─── */
  const name = user?.name || 'Traveller'
  const capitalName = name.charAt(0).toUpperCase() + name.slice(1)
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently'
  const emergencyCount = user?.emergencyContacts?.length || 0

  /* ─── Save Profile ─── */
  const handleSaveName = async () => {
    if (!nameValue.trim()) return toast.error('Name cannot be empty')
    if (nameValue.trim() === user.name) {
      setEditingName(false)
      return
    }
    setSaving(true)
    try {
      const res = await authAPI.updateProfile({ name: nameValue.trim() })
      updateUser({ name: res.data.user.name })
      toast.success('Name updated successfully!')
      setEditingName(false)
    } catch (err) {
      toast.error(err?.message || 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Save Preferences ─── */
  const handleSavePreferences = async (updates) => {
    try {
      const res = await authAPI.updateProfile({ preferences: updates })
      updateUser({ preferences: { ...user.preferences, ...updates } })
      toast.success('Preferences saved!')
    } catch (err) {
      toast.error('Failed to save preference')
    }
  }

  const handleCurrencyChange = (e) => {
    const val = e.target.value
    setCurrency(val)
    handleSavePreferences({ currency: val })
  }

  const handleLanguageChange = (e) => {
    const val = e.target.value
    setLanguage(val)
    handleSavePreferences({ language: val })
  }

  const handleUnitsChange = (val) => {
    setUnits(val)
    localStorage.setItem('stc_units', val)
    toast.success(`Units set to ${val === 'km' ? 'Kilometers' : 'Miles'}`)
  }

  const handleDarkModeToggle = (val) => {
    setDarkMode(val)
    localStorage.setItem('stc_darkmode', val.toString())
    toast.success(val ? 'Dark mode enabled (coming soon!)' : 'Light mode active')
  }

  const handleNotifToggle = async (key, val) => {
    if (key === 'email') {
      setNotifEmail(val)
      handleSavePreferences({ notifications: val })
    } else if (key === 'trips') {
      setNotifTrips(val)
    } else if (key === 'budget') {
      setNotifBudget(val)
    } else if (key === 'sos') {
      setNotifSOS(val)
    }
  }

  /* ─── Change Password ─── */
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error('All fields are required')
    if (newPw.length < 8) return toast.error('New password must be at least 8 characters')
    if (newPw !== confirmPw) return toast.error('Passwords do not match')

    setChangingPw(true)
    try {
      await authAPI.changePassword({ currentPassword: currentPw, newPassword: newPw })
      toast.success('Password changed successfully!')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setShowPwSection(false)
    } catch (err) {
      toast.error(err?.message || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  return (
    <PageWrapper
      icon={User}
      title="Profile & Settings"
      subtitle="Manage your account and travel preferences"
      iconColor="text-blue-500"
      iconBg="bg-blue-100"
    >
      <div className="max-w-4xl space-y-6 -mt-4">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — PROFILE HERO CARD
        ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeSlide}
          className="glass-card rounded-[20px] p-6 lg:p-8 shadow-sm relative overflow-hidden transform-gpu"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <motion.div
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)' }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group/avatar">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_30px_rgba(59,130,246,0.35)] border-4 border-white/50"
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </motion.div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                <Zap size={10} /> Lv.{user?.level || 1}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="profile-name-input"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="input-field text-lg font-extrabold py-1.5 px-3 w-56"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={saving}
                      className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-all"
                    >
                      <Check size={14} className="text-emerald-600" />
                    </button>
                    <button onClick={() => { setEditingName(false); setNameValue(user?.name || '') }}
                      className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <X size={14} className="text-slate-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{capitalName}</h2>
                    <button onClick={() => setEditingName(true)}
                      className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <Edit3 size={12} className="text-slate-400 hover:text-blue-500" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {user?.email || 'No email set'}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                  <Calendar size={12} className="text-blue-400" />
                  Member since {memberSince}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                  <Plane size={12} className="text-indigo-400" />
                  {user?.tripsCount || 0} trips
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <Trophy size={12} className="text-amber-500" />
                  {user?.xp || 0} XP
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500" /> Level {user?.level || 1} Traveler
              </span>
              <span>Next level →</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((user?.xp || 0) % 500) / 5, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-pulse" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — TRAVEL PREFERENCES
        ═══════════════════════════════════════════════════════════════ */}
        <SectionCard
          title="Travel Preferences"
          icon={Globe}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50"
        >
          {/* Currency */}
          <SettingRow icon={Coins} iconColor="text-amber-500" label="Default Currency" description="Used across budget tracker & expenses">
            <select
              id="pref-currency"
              value={currency}
              onChange={handleCurrencyChange}
              className="input-field text-sm font-semibold py-2 px-3 pr-8 w-52 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
              ))}
            </select>
          </SettingRow>

          {/* Language */}
          <SettingRow icon={Languages} iconColor="text-blue-500" label="Language" description="App language preference">
            <select
              id="pref-language"
              value={language}
              onChange={handleLanguageChange}
              className="input-field text-sm font-semibold py-2 px-3 pr-8 w-44 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </SettingRow>

          {/* Measurement Units */}
          <SettingRow icon={Ruler} iconColor="text-emerald-500" label="Distance Units" description="Used in GPS finder & trip planning">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['km', 'miles'].map(u => (
                <button
                  key={u}
                  id={`pref-unit-${u}`}
                  onClick={() => handleUnitsChange(u)}
                  className={clsx(
                    'text-xs font-bold px-4 py-2 rounded-lg capitalize transition-all',
                    units === u
                      ? 'bg-white/80 backdrop-blur-sm text-blue-600 shadow-sm border border-white/40'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {u === 'km' ? 'Kilometers' : 'Miles'}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Dark Mode */}
          <SettingRow
            icon={darkMode ? Moon : Sun}
            iconColor={darkMode ? 'text-indigo-400' : 'text-amber-500'}
            label="Dark Mode"
            description="Switch to dark theme (coming soon)"
          >
            <ToggleSwitch id="pref-darkmode" enabled={darkMode} onChange={handleDarkModeToggle} />
          </SettingRow>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — NOTIFICATION SETTINGS
        ═══════════════════════════════════════════════════════════════ */}
        <SectionCard
          title="Notifications"
          icon={Bell}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
        >
          <SettingRow icon={Mail} iconColor="text-blue-500" label="Email Notifications" description="Receive trip updates via email">
            <ToggleSwitch id="notif-email" enabled={notifEmail} onChange={(v) => handleNotifToggle('email', v)} />
          </SettingRow>

          <SettingRow icon={Plane} iconColor="text-indigo-500" label="Trip Reminders" description="Get reminders before your trips">
            <ToggleSwitch id="notif-trips" enabled={notifTrips} onChange={(v) => handleNotifToggle('trips', v)} />
          </SettingRow>

          <SettingRow icon={Wallet} iconColor="text-amber-500" label="Budget Alerts" description="Alert when spending exceeds limits">
            <ToggleSwitch id="notif-budget" enabled={notifBudget} onChange={(v) => handleNotifToggle('budget', v)} />
          </SettingRow>

          <SettingRow icon={ShieldAlert} iconColor="text-red-500" label="SOS Confirmations" description="Confirm when SOS alerts are sent">
            <ToggleSwitch id="notif-sos" enabled={notifSOS} onChange={(v) => handleNotifToggle('sos', v)} />
          </SettingRow>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — SECURITY & ACCOUNT
        ═══════════════════════════════════════════════════════════════ */}
        <SectionCard
          title="Security & Account"
          icon={Shield}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        >
          {/* Account Info */}
          <SettingRow icon={Mail} iconColor="text-slate-400" label="Email Address" description="Your login email (cannot be changed)">
            <span className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              {user?.email || 'N/A'}
            </span>
          </SettingRow>

          <SettingRow icon={Calendar} iconColor="text-slate-400" label="Account Created" description="When you joined Smart Travel Companion">
            <span className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              {memberSince}
            </span>
          </SettingRow>

          {/* Change Password */}
          <div className="py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 bg-slate-50/80">
                  <Lock size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Change Password</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Update your account password</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPwSection(!showPwSection)}
                className={clsx(
                  'text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer',
                  showPwSection
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                )}
              >
                {showPwSection ? 'Cancel' : 'Change'}
              </motion.button>
            </div>

            <AnimatePresence>
              {showPwSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 ml-[52px] space-y-3.5">
                    {/* Current Password */}
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        placeholder="Current password"
                        className="input-field text-sm py-2.5"
                      />
                      <button onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="New password (min 8 chars)"
                        className="input-field text-sm py-2.5"
                      />
                      <button onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Confirm new password"
                      className="input-field text-sm py-2.5"
                    />

                    {/* Password strength indicator */}
                    {newPw && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full transition-all duration-500',
                              newPw.length < 8 ? 'bg-red-400 w-1/4' :
                              newPw.length < 12 ? 'bg-amber-400 w-2/4' :
                              'bg-emerald-400 w-full'
                            )}
                          />
                        </div>
                        <span className={clsx('text-[10px] font-bold',
                          newPw.length < 8 ? 'text-red-500' :
                          newPw.length < 12 ? 'text-amber-500' :
                          'text-emerald-500'
                        )}>
                          {newPw.length < 8 ? 'Weak' : newPw.length < 12 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleChangePassword}
                      disabled={changingPw}
                      className="btn-primary text-sm py-2.5 px-6 w-full"
                    >
                      {changingPw ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Changing...
                        </div>
                      ) : (
                        <><ShieldCheck size={16} /> Update Password</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign Out */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { signOut(); navigate('/signin') }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer w-full sm:w-auto"
            >
              <LogOut size={16} /> Sign Out
            </motion.button>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — EMERGENCY CONTACTS (Quick Access)
        ═══════════════════════════════════════════════════════════════ */}
        <SectionCard
          title="Emergency Contacts"
          icon={Heart}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        >
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={clsx(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                emergencyCount > 0
                  ? 'bg-emerald-50 border-2 border-emerald-200'
                  : 'bg-slate-50 border-2 border-slate-200'
              )}>
                <span className="text-3xl">{emergencyCount > 0 ? '🛡️' : '⚠️'}</span>
              </div>
            </div>
            <p className="font-bold text-slate-800 text-base">
              {emergencyCount > 0
                ? `${emergencyCount} Emergency Contact${emergencyCount > 1 ? 's' : ''} Configured`
                : 'No Emergency Contacts Set Up'}
            </p>
            <p className="text-slate-500 text-sm mt-1.5 mb-5 max-w-md mx-auto font-medium">
              {emergencyCount > 0
                ? 'Your emergency contacts will be notified during SOS alerts. Manage them in the Safety section.'
                : 'Set up emergency contacts so loved ones can be reached instantly when you trigger an SOS alert.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard/safety')}
              className="btn-primary text-sm py-3 px-8 mx-auto"
            >
              <Shield size={16} />
              {emergencyCount > 0 ? 'Manage Contacts' : 'Set Up Contacts'}
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </SectionCard>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </PageWrapper>
  )
}
