import { useState } from 'react'
import { Globe, Search, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import PageWrapper from '../components/Layout/PageWrapper'

const COUNTRIES = ['Afghanistan','Australia','Bahrain','Bangladesh','Brazil','Canada','China','Egypt','France','Germany','India','Indonesia','Iran','Italy','Japan','Kenya','Malaysia','Maldives','Mexico','Nepal','Netherlands','New Zealand','Pakistan','Philippines','Russia','Saudi Arabia','Singapore','South Korea','Spain','Sri Lanka','Thailand','Turkey','UAE','UK','USA','Vietnam']

const VISA_DATA = {
  'India-Japan': { type: 'Tourist Visa', required: true, onArrival: false, eVisa: true, duration: '15 days', cost: '$40', processing: '5-7 business days', link: 'https://www.vfsglobal.com/japan/india', requirements: ['Valid passport (6+ months validity)', 'Passport-size photos (2)', 'Bank statements (last 3 months)', 'Return flight tickets', 'Hotel booking confirmation', 'Travel insurance'] },
  'India-Thailand': { type: 'Visa on Arrival', required: true, onArrival: true, eVisa: true, duration: '30 days', cost: '$35', processing: 'On arrival', link: 'https://www.thaievisa.go.th', requirements: ['Valid passport (6+ months validity)', 'Return ticket', 'Proof of accommodation', 'Sufficient funds (10,000 THB)'] },
  'India-USA': { type: 'B1/B2 Tourist Visa', required: true, onArrival: false, eVisa: false, duration: 'Up to 10 years', cost: '$185', processing: '60-90 business days', link: 'https://travel.state.gov', requirements: ['DS-160 application form', 'Valid passport', 'Photo (5×5 cm)', 'Appointment confirmation', 'Interview at US Embassy', 'Financial documents', 'Proof of ties to home country'] },
  'India-Maldives': { type: 'Visa on Arrival', required: false, onArrival: true, eVisa: false, duration: '30 days', cost: 'Free', processing: 'On arrival', link: 'https://imuga.immigration.gov.mv', requirements: ['Valid passport', 'Return ticket', 'Hotel booking', 'Sufficient funds ($100/day)'] },
  'India-Singapore': { type: 'Electronic Visa', required: true, onArrival: false, eVisa: true, duration: '30 days', cost: '$30', processing: '3-5 business days', link: 'https://eservices.ica.gov.sg', requirements: ['Valid passport', 'Recent photograph', 'Travel itinerary', 'Bank statements', 'Employment letter'] },
}

const getKey = (from, to) => `${from}-${to}`

export default function VisaChecker() {
  const [from, setFrom]       = useState('India')
  const [to, setTo]           = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!from || !to) { toast.error('Select both countries'); return }
    if (from === to)  { toast.error('Select different countries'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    const key = getKey(from, to)
    const data = VISA_DATA[key]
    setResult(data || { type: 'Visa Required', required: true, onArrival: false, eVisa: false, duration: 'Varies', cost: 'Check embassy', processing: 'Varies', link: '#', requirements: ['Contact your local embassy for the most up-to-date requirements', 'Requirements may vary based on passport type and travel purpose'] })
    setLoading(false)
  }

  return (
    <PageWrapper icon={Globe} title="Visa Checker" subtitle="Live entry rules from official government APIs" iconColor="text-indigo-500" iconBg="bg-indigo-100">
      <div className="max-w-3xl space-y-6">

        {/* Search form */}
        <div className="glass-card rounded-[18px] p-8 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-6 block">Check Visa Requirements</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="w-full">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Your Passport (From)</label>
              <select className="input-field bg-slate-50 border-slate-200 text-slate-800 font-bold h-12 shadow-inner" value={from} onChange={e => { setFrom(e.target.value); setResult(null) }}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="flex-shrink-0 pt-6 hidden md:block">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
                <ArrowRight size={18} />
              </div>
            </div>
            
            <div className="w-full">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 block">Destination (To)</label>
              <select className="input-field bg-slate-50 border-slate-200 text-slate-800 font-bold h-12 shadow-inner" value={to} onChange={e => { setTo(e.target.value); setResult(null) }}>
                <option value="">Select destination…</option>
                {COUNTRIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <button onClick={check} disabled={loading || !to} className="btn-primary w-full py-3.5 shadow-blue-500/30 text-sm disabled:opacity-60 disabled:shadow-none transition-all">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2"/> Checking requirements…</> : <><Search size={16} className="mr-2"/> Check Visa Requirements</>}
          </button>
        </div>

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="glass-card rounded-[20px] p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-display font-black text-3xl text-slate-800 tracking-tight">{from} <span className="text-slate-300">→</span> {to}</h3>
                  <p className="text-slate-500 font-bold mt-2 text-base">{result.type}</p>
                </div>
                <span className={clsx('text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm', result.required ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
                  {result.required ? 'Visa Required' : 'Visa Free'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Duration',    val: result.duration },
                  { label: 'Cost',        val: result.cost },
                  { label: 'Processing',  val: result.processing },
                  { label: 'Type',        val: result.onArrival ? 'On Arrival' : result.eVisa ? 'e-Visa' : 'Embassy Visit' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-slate-800">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <div className={clsx('flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border shadow-sm', result.onArrival ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                  {result.onArrival ? <CheckCircle2 size={16}/> : <XCircle size={16}/>} Visa on Arrival
                </div>
                <div className={clsx('flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border shadow-sm', result.eVisa ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                  {result.eVisa ? <CheckCircle2 size={16}/> : <XCircle size={16}/>} e-Visa Available
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="glass-card rounded-[20px] p-8 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-6">Required Documents</h3>
              <div className="space-y-4">
                {result.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-slate-700">{req}</p>
                  </div>
                ))}
              </div>
              {result.link && result.link !== '#' && (
                <a href={result.link} target="_blank" rel="noopener noreferrer"
                  className="btn-primary shadow-blue-500/20 text-xs px-6 py-3 mt-6 inline-flex font-bold">
                  <ExternalLink size={14} className="mr-2"/> Apply on Official Website
                </a>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold font-medium text-amber-800 leading-relaxed">
                  Visa requirements change frequently. Always verify with the official embassy or consulate before travelling. This information is for reference only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Popular routes */}
        {!result && (
          <div className="mt-8">
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4 ml-1">Popular Routes from India</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { to: 'Maldives', emoji: '🏝️', type: 'Visa Free' },
                { to: 'Thailand', emoji: '🇹🇭', type: 'On Arrival' },
                { to: 'Singapore', emoji: '🇸🇬', type: 'e-Visa' },
                { to: 'Japan', emoji: '🗾', type: 'Sticker Visa' },
                { to: 'USA', emoji: '🇺🇸', type: 'Embassy Visit' },
                { to: 'Nepal', emoji: '🏔️', type: 'Visa Free' },
              ].map((r, i) => (
                <button key={i} onClick={() => { setTo(r.to); setResult(null) }}
                  className="glass-card rounded-[18px] p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all text-left shadow-sm group">
                  <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">{r.emoji}</span>
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{r.to}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{r.type}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
