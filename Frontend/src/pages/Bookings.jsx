import { useState, useEffect } from 'react'
import { Plane, Hotel, CheckCircle2, Loader2, Sparkles, ExternalLink, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { tripsAPI } from '../services/api'
import PageWrapper from '../components/Layout/PageWrapper'

const TABS = ['flights', 'hotels', 'my bookings']

const flightProviders = [
  { id: 'mmt', name: 'MakeMyTrip', label: 'Best Price', desc: 'Best deals on domestic flights', icon: 'M', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' },
  { id: 'goibibo', name: 'Goibibo', label: 'Popular', desc: 'Compare and save', icon: 'G', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  { id: 'cleartrip', name: 'Cleartrip', label: 'Fastest Booking', desc: 'Seamless booking experience', icon: 'C', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
]

const hotelProviders = [
  { id: 'oyo', name: 'OYO', label: 'Budget Stay', desc: 'Affordable stays everywhere', icon: 'O', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  { id: 'mmt_hotel', name: 'MakeMyTrip Hotels', label: 'Best Deals', desc: 'Top rated hotels', icon: 'M', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  { id: 'booking', name: 'Booking.com', label: 'Premium', desc: 'Luxury & comfort', icon: 'B', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
]

export default function Bookings() {
  const [tab, setTab] = useState('flights')
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState([])
  const [activeTab, setActiveTab] = useState('flights')
  const [sortBy, setSortBy] = useState('price') // price, popular, fastest

  const loadTrips = async () => {
    setLoading(true)
    try {
      const res = await tripsAPI.getAll({ limit: 50 })
      setTrips(res.data?.data || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTrips() }, [])

  const handleProviderClick = (providerType, p) => {
    let url = ''
    if (providerType === 'flight') {
      if (p.id === 'mmt') {
        url = `https://www.makemytrip.com/flights/`
      } else if (p.id === 'goibibo') {
        url = `https://www.goibibo.com/flights/`
      } else {
        url = `https://www.cleartrip.com/flights`
      }
    } else {
      if (p.id === 'oyo') {
        url = `https://www.oyorooms.com/`
      } else if (p.id === 'mmt_hotel') {
        url = `https://www.makemytrip.com/hotels/`
      } else {
        url = `https://www.booking.com/`
      }
    }
    window.open(url, '_blank')
  }

  const sortedFlightProviders = [...flightProviders].sort((a, b) => {
    if (sortBy === 'price') return a.id === 'mmt' ? -1 : 1
    if (sortBy === 'popular') return a.id === 'goibibo' ? -1 : 1
    if (sortBy === 'fastest') return a.id === 'cleartrip' ? -1 : 1
    return 0
  })

  const sortedHotelProviders = [...hotelProviders].sort((a, b) => {
    if (sortBy === 'price') return a.id === 'oyo' ? -1 : 1
    if (sortBy === 'popular') return a.id === 'mmt_hotel' ? -1 : 1
    if (sortBy === 'fastest') return a.id === 'booking' ? -1 : 1
    return 0
  })

  return (
    <PageWrapper icon={Plane} title="Bookings" subtitle="Book flights, hotels & view your trips" iconColor="text-indigo-500" iconBg="bg-indigo-100">
      <div className="flex gap-1.5 p-1 bg-slate-200/50 rounded-xl w-fit mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setActiveTab(t) }}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all shadow-sm',
              tab === t ? 'bg-white/50 backdrop-blur-sm text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/30 shadow-none'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card rounded-[18px] p-12 text-center shadow-sm">
          <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
          <p className="text-slate-500 font-medium text-sm mt-3">Loading bookings...</p>
        </div>
      ) : (
        <>
          {tab === 'flights' && (
            <div className="animate-fade-in shadow-sm w-full mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2 font-bold text-lg text-blue-600 tracking-tight">
                  <Sparkles size={20} className="animate-pulse" /> Partner Flight Deals
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-sm"
                >
                  <option value="price">Sort by: Best Price</option>
                  <option value="popular">Sort by: Popular</option>
                  <option value="fastest">Sort by: Fastest</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {sortedFlightProviders.map(p => (
                  <div key={p.id} className="glass-card rounded-2xl p-6 hover:border-blue-300 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group hover:-translate-y-1 cursor-pointer">
                    <span className="absolute top-0 right-0 bg-gradient-to-bl from-blue-100 to-white border-l border-b border-blue-200/60 px-4 py-2 text-[10px] rounded-bl-[14px] font-extrabold text-blue-700 tracking-widest uppercase shadow-sm">
                      {p.label}
                    </span>
                    <div className="flex gap-5 items-center pt-3">
                      <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-sm border bg-white backdrop-blur-md", p.color)}>
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-base text-slate-800 truncate tracking-tight">{p.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{p.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleProviderClick('flight', p)}
                      className="w-full py-3.5 rounded-xl bg-white/50 backdrop-blur-md border border-white/40 text-blue-600 text-sm font-extrabold hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/25"
                    >
                      Book Flight <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'hotels' && (
            <div className="animate-fade-in shadow-sm w-full mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 tracking-tight">
                  <Sparkles size={20} className="animate-pulse" /> Partner Hotel Deals
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm"
                >
                  <option value="price">Sort by: Best Price</option>
                  <option value="popular">Sort by: Popular</option>
                  <option value="fastest">Sort by: Fastest</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {sortedHotelProviders.map(p => (
                  <div key={p.id} className="glass-card rounded-2xl p-6 hover:border-indigo-300 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group hover:-translate-y-1 cursor-pointer">
                    <span className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-100 to-white border-l border-b border-indigo-200/60 px-4 py-2 text-[10px] rounded-bl-[14px] font-extrabold text-indigo-700 tracking-widest uppercase shadow-sm">
                      {p.label}
                    </span>
                    <div className="flex gap-5 items-center pt-3">
                      <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-sm border bg-white backdrop-blur-md", p.color)}>
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-base text-slate-800 truncate tracking-tight">{p.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{p.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleProviderClick('hotel', p)}
                      className="w-full py-3.5 rounded-xl bg-white/50 backdrop-blur-md border border-white/40 text-indigo-600 text-sm font-extrabold hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25"
                    >
                      Find Hotel <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'my bookings' && (
            <div className="space-y-4 animate-fade-in max-w-4xl">
              {trips.length === 0 ? (
                <div className="glass-card rounded-[18px] p-12 text-center shadow-sm">
                  <CalendarDays size={32} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-700 font-bold text-lg tracking-tight">No saved trips found yet</p>
                  <p className="text-slate-500 text-sm mt-1 mb-6">Create a new itinerary using the AI Planner to get started.</p>
                </div>
              ) : trips.map((trip) => (
                <div key={trip._id} className="glass-card rounded-[18px] p-6 flex items-center gap-5 hover:border-blue-300 hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer group">
                  <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner group-hover:scale-105 transition-transform', trip.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200')}>
                    {['Beach', 'Honeymoon', 'Cultural', 'Family'].includes(trip.tripType) ? <Hotel size={24} className={trip.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-400'} /> : <Plane size={24} className={trip.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-400'} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors text-lg tracking-tight">{trip.destination}</p>
                    <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs mt-1">
                      <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Date pending'}</span>
                      <span className="opacity-50">•</span>
                      <span>{trip.days || 'N/A'} days</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="font-black text-slate-800 text-xl mb-1">{trip.currency} {trip.totalEstimatedCost?.toLocaleString()}</p>
                    <span className={clsx('text-[10px] font-extrabold px-3 py-1.5 rounded-lg border uppercase tracking-widest', trip.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200 shadow-sm')}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
