import { useState, useEffect, useRef } from 'react'
import { Shield, Phone, Plus, Trash2, AlertTriangle, MapPin, Clock, CheckCircle2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { safetyAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

const EMERGENCY_NUMBERS = [
  { country: '🇮🇳 India',         police: '100', ambulance: '102', fire: '101', emergency: '112' },
  { country: '🇺🇸 USA',           police: '911', ambulance: '911', fire: '911', emergency: '911' },
  { country: '🇬🇧 UK',            police: '999', ambulance: '999', fire: '999', emergency: '999' },
  { country: '🇯🇵 Japan',         police: '110', ambulance: '119', fire: '119', emergency: '110' },
  { country: '🇩🇪 Germany',       police: '110', ambulance: '112', fire: '112', emergency: '112' },
  { country: '🇦🇺 Australia',     police: '000', ambulance: '000', fire: '000', emergency: '000' },
]

const SAFETY_TIPS = [
  { icon: '📋', title: 'Register with your embassy', desc: 'Always register your trip with your home country embassy when travelling abroad.' },
  { icon: '📱', title: 'Share your itinerary', desc: 'Send your day-by-day plan to at least 2 trusted contacts back home.' },
  { icon: '💳', title: 'Keep cash and card separate', desc: 'Never keep all your money in one place. Use a money belt for extra security.' },
  { icon: '🏨', title: 'Note your hotel address', desc: 'Save your accommodation address in the local language on your phone.' },
]

export default function SOSSafety() {
  const [contacts, setContacts] = useState([])
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '', email: '' })
  const [adding, setAdding] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [sosActive, setSosActive] = useState(false)
  const [sosCountdown, setSosCountdown] = useState(null)
  const [sendingSOS, setSendingSOS] = useState(false)
  const [sosResult, setSosResult] = useState(null)
  const sosIntervalRef = useRef(null)

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true)
        const res = await safetyAPI.getContacts()
        setContacts(res.data.data || [])
      } catch (err) {
        toast.error(err?.message || 'Unable to load safety contacts')
      } finally {
        setLoadingContacts(false)
      }
    }
    loadContacts()
  }, [])

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) { toast.error('Name and phone required'); return }
    try {
      const res = await safetyAPI.addContact(newContact)
      setContacts(res.data.data || [])
      setNewContact({ name: '', phone: '', relation: '', email: '' })
      setAdding(false)
      toast.success('Emergency contact added')
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to add contact')
    }
  }

  const removeContact = async (id) => {
    try {
      const res = await safetyAPI.removeContact(id)
      setContacts(res.data.data || [])
      toast.success('Contact removed')
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to remove contact')
    }
  }

  const triggerSOS = async () => {
    if (sosActive) {
      clearInterval(sosIntervalRef.current)
      sosIntervalRef.current = null
      setSosActive(false)
      setSosCountdown(null)
      setSendingSOS(false)
      setSosResult(null)
      toast('SOS cancelled', { icon: '❌' })
      return
    }

    if (!contacts.length) {
      toast.error('Add at least one emergency number before sending SOS')
      return
    }

    setSendingSOS(true)
    let coords = null
    try {
      coords = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 10000, enableHighAccuracy: true }
        )
      })
    } catch {
      coords = null
    }

    if (!coords) {
      toast('Location unavailable — SOS will send without GPS', { icon: '📍' })
    }

    setSosActive(true)
    let count = 3
    setSosCountdown(count)

    sosIntervalRef.current = setInterval(async () => {
      count--
      setSosCountdown(count)
      if (count <= 0) {
        clearInterval(sosIntervalRef.current)
        sosIntervalRef.current = null
        setSosActive(false)
        setSosCountdown(null)

        try {
          const message = `SOS Alert: Please help me immediately.${coords ? ` Location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}.` : ' (GPS unavailable)'}`
          const res = await safetyAPI.triggerSOS({ lat: coords?.lat, lng: coords?.lng, message })
          const responseText = res.data?.message || 'SOS request completed'
          const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          if (res.data?.success) {
            setSosResult({ ok: true, message: responseText, time: now, hasLocation: !!coords })
            toast.success('SOS alert sent!', { duration: 5000 })
          } else {
            setSosResult({ ok: false, message: responseText, time: now, hasLocation: !!coords })
            toast.error(responseText)
          }
        } catch (err) {
          const errText = err?.response?.data?.message || err?.message || 'Failed to send SOS alert'
          setSosResult({ ok: false, message: errText, time: new Date().toLocaleTimeString(), hasLocation: false })
          toast.error(errText)
        } finally {
          setSendingSOS(false)
        }
      }
    }, 1000)
  }

  return (
    <PageWrapper icon={Shield} title="SOS Safety" subtitle="Emergency contacts & alerts" iconColor="text-red-500" iconBg="bg-red-100">
      <div className="max-w-4xl space-y-6">

        {/* SOS Button */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={100} className="text-red-500" /></div>
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm relative z-10">
            <AlertTriangle size={16} /> One-tap emergency broadcast
          </div>
          <button
            onClick={triggerSOS}
            disabled={!contacts.length || sendingSOS}
            className={clsx(
              'w-40 h-40 rounded-full font-black text-2xl border-4 transition-all duration-300 select-none relative z-10',
              !contacts.length ? 'opacity-50 cursor-not-allowed bg-red-100 border-red-200 text-red-400' : sosActive
                ? 'bg-red-600 border-red-300 text-white animate-pulse scale-110 shadow-[0_0_50px_rgba(220,38,38,0.5)]'
                : 'bg-red-100 border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-600 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20'
            )}
          >
            {sosActive ? (sosCountdown > 0 ? sosCountdown : '🆘') : 'SOS'}
          </button>
          <p className="text-slate-600 font-medium text-xs max-w-xs relative z-10">
            {sosActive
              ? `Sending SOS in ${sosCountdown} seconds… Tap again to cancel`
              : contacts.length > 0
                ? 'Press SOS to send an alert to your saved emergency contact numbers.'
                : 'Add at least one emergency contact number below to enable SOS alerts.'}
          </p>

          {/* Result banner after send */}
          {sosResult && (
            <div className={clsx(
              'w-full max-w-sm rounded-2xl px-5 py-4 border text-sm flex flex-col gap-2 transition-all relative z-10 shadow-sm',
              sosResult.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}>
              <div className="flex items-center gap-2 font-bold text-base">
                {sosResult.ok ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-red-500" />}
                {sosResult.ok ? '✅ Email Alert Sent!' : '❌ Alert Failed'}
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">{sosResult.message}</p>
              <div className="flex items-center gap-2 mt-1">
                {sosResult.hasLocation
                  ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold"><MapPin size={10}/> GPS location included in email ✓</span>
                  : <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold"><MapPin size={10}/> GPS unavailable — sent without location</span>
                }
              </div>
              <p className="text-slate-400 font-medium text-[10px]">Sent at {sosResult.time}</p>
              <button onClick={() => setSosResult(null)} className="self-end text-[10px] text-slate-500 font-bold hover:text-slate-700 underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex items-center gap-5 text-xs font-bold text-red-400/80 mt-2">
            <span className="flex items-center gap-1.5"><MapPin size={14}/> Live GPS</span>
            <span className="flex items-center gap-1.5"><Clock size={14}/> Timestamp</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Reliable</span>
          </div>
        </div>

        {/* Emergency contacts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">Emergency Contacts</h2>
            <button onClick={() => setAdding(v => !v)} className="btn-outline h-9 px-4 text-xs font-bold bg-white/40 backdrop-blur-sm text-blue-600 border-blue-200 hover:bg-blue-50">
              <Plus size={14} className="mr-1.5"/> Add Contact
            </button>
          </div>

          {adding && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-blue-800 ml-1 mb-1 block">Name *</label><input className="input-field bg-white/50 backdrop-blur-sm w-full h-11" placeholder="Jane Doe" value={newContact.name} onChange={e => setNewContact(p => ({...p, name: e.target.value}))} /></div>
                <div><label className="text-xs font-bold text-blue-800 ml-1 mb-1 block">Phone *</label><input className="input-field bg-white/50 backdrop-blur-sm w-full h-11" placeholder="+1 234 567 8900" value={newContact.phone} onChange={e => setNewContact(p => ({...p, phone: e.target.value}))} /></div>
                <div><label className="text-xs font-bold text-blue-800 ml-1 mb-1 block">Email</label><input className="input-field bg-white/50 backdrop-blur-sm w-full h-11" type="email" placeholder="Required for SOS email alerts" value={newContact.email} onChange={e => setNewContact(p => ({...p, email: e.target.value}))} /></div>
                <div><label className="text-xs font-bold text-blue-800 ml-1 mb-1 block">Relation</label><input className="input-field bg-white/50 backdrop-blur-sm w-full h-11" placeholder="e.g. Sister, Friend" value={newContact.relation} onChange={e => setNewContact(p => ({...p, relation: e.target.value}))} /></div>
              </div>
              <p className="text-[11px] font-semibold text-blue-600 bg-blue-100/50 p-2 rounded-lg inline-block border border-blue-200/50">💡 Adding an email address allows the SOS system to automatically send geolocation alerts to this contact.</p>
              <div className="flex gap-2">
                <button onClick={addContact} className="btn-primary text-xs px-5 py-2.5 h-10 shadow-blue-500/20"><Save size={14} className="mr-1.5"/> Save Contact</button>
                <button onClick={() => setAdding(false)} className="btn-outline bg-white/40 backdrop-blur-sm text-xs px-5 py-2.5 h-10 border-slate-200 text-slate-500"><X size={14} className="mr-1.5"/> Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingContacts ? (
              <div className="glass-card rounded-[18px] p-8 text-center text-slate-400 font-medium text-sm shadow-sm">Loading your emergency contacts…</div>
            ) : contacts.length === 0 ? (
              <div className="glass-card rounded-[18px] p-8 text-center text-slate-500 font-medium text-sm shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                <Shield size={32} className="text-slate-200 mb-3" />
                No emergency contacts yet. Add a number above to enable SOS alerts.
              </div>
            ) : (
              contacts.map(c => (
                <div key={c._id || c.id} className="glass-card rounded-[18px] p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all shadow-sm group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-extrabold flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    {c.name ? c.name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-800 text-base">{c.name || 'Unnamed contact'}</p>
                    <p className="text-slate-500 font-semibold text-xs mt-0.5">{c.phone}{c.relation ? ` · ${c.relation}` : ''}</p>
                    {c.email && (
                      <p className="text-blue-600 text-[10px] font-bold mt-1.5 flex items-center gap-1.5">
                        <span className="bg-blue-100 rounded px-1.5">✉</span> {c.email}
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-200">SOS Email ✓</span>
                      </p>
                    )}
                    {!c.email && (
                      <p className="text-amber-600 font-bold text-[10px] mt-1.5 flex items-center gap-1">
                        <AlertTriangle size={10} /> No email — SOS alert may not reach this contact
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${c.phone}`} title="Call contact" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 text-slate-500 transition-all shadow-sm">
                      <Phone size={16}/>
                    </a>
                    <button onClick={() => removeContact(c._id || c.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-500 transition-all shadow-sm">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency numbers by country */}
        <div>
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4 mt-8">Emergency Numbers by Country</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {EMERGENCY_NUMBERS.map((c, i) => (
              <div key={i} className="glass-card rounded-[18px] p-5 hover:shadow-md transition-all shadow-sm">
                <p className="font-extrabold text-slate-800 text-base mb-4">{c.country}</p>
                <div className="grid grid-cols-4 gap-3">
                  {[['Police', c.police, 'bg-blue-50 text-blue-600 border-blue-200'], ['Ambulance', c.ambulance, 'bg-red-50 text-red-600 border-red-200'], ['Fire', c.fire, 'bg-amber-50 text-amber-600 border-amber-200'], ['Emergency', c.emergency, 'bg-emerald-50 text-emerald-600 border-emerald-200']].map(([label, num, cls]) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                      <div className={clsx('rounded-xl border shadow-sm py-2 px-1', cls)}>
                        <p className="text-sm font-black">{num}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div>
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4 mt-8">Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="glass-card rounded-[18px] p-5 flex gap-4 hover:shadow-md transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                  {tip.icon}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-800 mb-1">{tip.title}</p>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
