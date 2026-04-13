import { useState } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Check, Plus, Trash2, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import PageWrapper from '../components/Layout/PageWrapper'

import { weatherAPI } from '../services/api'

const PACKING_DEFAULTS = {
  beach: ['Sunscreen SPF 50+', 'Swimwear (2 pairs)', 'Beach towel', 'Flip flops', 'Sunglasses', 'Hat/Cap', 'Light linen shirt', 'Shorts (3 pairs)', 'Waterproof bag'],
  city:  ['Comfortable walking shoes', 'Casual outfits (3–4)', 'Light jacket', 'Day backpack', 'Power bank', 'Camera', 'City map/offline maps'],
  cold:  ['Warm jacket', 'Thermals', 'Woolen socks', 'Gloves', 'Beanie', 'Snow boots', 'Lip balm', 'Moisturiser'],
}

const ESSENTIALS = ['Passport', 'Visa documents', 'Travel insurance', 'Cash + cards', 'Phone charger', 'Medications', 'First aid kit', 'Earphones']

const WeatherIcon = ({ type, size = 24 }) => {
  const cls = `w-${size === 24 ? 6 : 10} h-${size === 24 ? 6 : 10}`
  if (type === 'sun')   return <Sun   className={clsx(cls, 'text-amber-500')} />
  if (type === 'rain')  return <CloudRain className={clsx(cls, 'text-blue-500')} />
  if (type === 'snow')  return <CloudSnow className={clsx(cls, 'text-indigo-400')} />
  return <Cloud className={clsx(cls, 'text-slate-400')} />
}

export default function WeatherPage() {
  const [city, setCity]         = useState('Goa, India')
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [currentWeather, setCurrentWeather] = useState({
    temp: 32, low: 26, feelsLike: 35, condition: 'sun', desc: 'Sunny', humidity: 68, wind: 14, visibility: 10
  })
  const [forecasts, setForecasts] = useState([
    { day: 'Today',  icon: 'sun',   high: 32, low: 26, rain: 10, wind: 14, humidity: 68, desc: 'Sunny' },
    { day: 'Fri',    icon: 'sun',   high: 33, low: 27, rain: 5,  wind: 12, humidity: 65, desc: 'Clear' },
    { day: 'Sat',    icon: 'cloud', high: 31, low: 25, rain: 30, wind: 18, humidity: 75, desc: 'Partly Cloudy' },
    { day: 'Sun',    icon: 'rain',  high: 28, low: 24, rain: 80, wind: 22, humidity: 88, desc: 'Light Rain' },
    { day: 'Mon',    icon: 'rain',  high: 27, low: 23, rain: 75, wind: 20, humidity: 90, desc: 'Showers' },
    { day: 'Tue',    icon: 'cloud', high: 29, low: 25, rain: 20, wind: 15, humidity: 72, desc: 'Overcast' },
    { day: 'Wed',    icon: 'sun',   high: 31, low: 26, rain: 10, wind: 11, humidity: 66, desc: 'Sunny' },
  ])
  const [tripType, setTripType] = useState('beach')
  const [packingList, setPackingList] = useState(() =>
    PACKING_DEFAULTS.beach.map((item, i) => ({ id: i, text: item, checked: false }))
  )
  const [newItem, setNewItem]   = useState('')

  const fetchWeather = async () => {
    if (!query.trim()) return
    setLoading(true)
    
    try {
      const res = await weatherAPI.get({ city: query })
      const { location, current, forecast } = res.data.data

      setCurrentWeather({
        temp: current.temp,
        low: forecast[0]?.low || current.temp - 5,
        feelsLike: current.temp + (current.temp > 25 ? 2 : -2),
        condition: current.icon,
        desc: current.desc,
        humidity: 60, // Not provided directly, defaulting to realistic
        wind: current.windspeed,
        visibility: 10
      })

      setCity(`${location.name}, ${location.country}`)
      setForecasts(forecast)
      toast.success(`Weather loaded for ${location.name}`)
    } catch (err) {
      toast.error(err?.message || 'Failed to fetch weather data. Please try another city.')
    } finally {
      setLoading(false)
      setQuery('')
    }
  }

  const switchType = (type) => {
    setTripType(type)
    setPackingList(PACKING_DEFAULTS[type].map((item, i) => ({ id: i, text: item, checked: false })))
  }

  const toggleItem = (id) => setPackingList(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const removeItem = (id) => setPackingList(p => p.filter(i => i.id !== id))
  const addItem = () => {
    if (!newItem.trim()) return
    setPackingList(p => [...p, { id: Date.now(), text: newItem, checked: false }])
    setNewItem('')
  }

  const packed = packingList.filter(i => i.checked).length
  const pct = packingList.length ? Math.round((packed / packingList.length) * 100) : 0

  return (
    <PageWrapper icon={Cloud} title="Weather + Packing" subtitle={city} iconColor="text-blue-500" iconBg="bg-blue-100">
      
      {/* Move search into the top header space by absolutely positioning it */}
      <div className="flex justify-end -mt-10 relative z-30 mb-8 pointer-events-auto">
        <div className="flex gap-2">
            <input className="input-field text-sm h-10 w-48 bg-white/50 backdrop-blur-sm border-white/30 shadow-sm" placeholder="Search city…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchWeather()} />
            <button onClick={fetchWeather} disabled={loading} className="btn-outline h-10 px-4 bg-white/40 backdrop-blur-sm border-white/30 text-slate-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm">
                {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
            </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Current weather hero */}
        <div className="glass-card rounded-[20px] border-blue-200/30 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><WeatherIcon type={currentWeather.condition} size={120} /></div>
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 relative z-10">
            <div>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2">{city} · Today</p>
              <div className="flex items-end gap-3 text-slate-800">
                <span className="text-7xl font-black tabular-nums tracking-tighter">{currentWeather.temp}°</span>
                <span className="text-slate-400 text-2xl font-bold pb-2">/ {currentWeather.low}°</span>
              </div>
              <p className="text-slate-600 mt-2 font-medium">{currentWeather.desc} — feels like {currentWeather.feelsLike}°C</p>
            </div>
            <div className="w-24 h-24 drop-shadow-lg animate-pulse-slow">
               <WeatherIcon type={currentWeather.condition} size={24} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-blue-100/50">
            {[
              { icon: <Droplets size={16}/>, label: 'Humidity',   val: `${currentWeather.humidity}%` },
              { icon: <Wind size={16}/>,     label: 'Wind',       val: `${currentWeather.wind} km/h` },
              { icon: <Eye size={16}/>,      label: 'Visibility', val: `${currentWeather.visibility} km` },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    {s.icon}
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                  <p className="text-sm font-extrabold text-slate-800">{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div>
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4">7-Day Forecast</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {forecasts.map((day, i) => (
              <div key={i} className={clsx('glass-card rounded-[18px] border p-4 flex flex-col items-center gap-2 text-center hover:border-blue-300 hover:shadow-md transition-all shadow-sm', i === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200')}>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{i === 0 ? 'Today' : day.day}</p>
                <div className="my-1 drop-shadow-sm">
                   <WeatherIcon type={day.icon} size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800 leading-none">{day.high}°</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{day.low}°</p>
                </div>
                {day.rain > 20 && (
                  <p className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full mt-1">{day.rain}%</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Packing list */}
        <div className="grid md:grid-cols-2 gap-8 pt-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">AI Packing List</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{packed}/{packingList.length} packed</span>
            </div>

            {/* Trip type selector */}
            <div className="flex gap-2 mb-5">
              {[['beach','🏖️ Beach'],['city','🏙️ City'],['cold','🏔️ Cold']].map(([t, label]) => (
                <button key={t} onClick={() => switchType(t)}
                  className={clsx('text-xs font-bold px-4 py-2 rounded-xl border transition-all shadow-sm', tripType === t ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/20' : 'bg-white/40 backdrop-blur-sm border-white/30 text-slate-600 hover:bg-white/60')}>
                  {label}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden shadow-inner border border-slate-200/50">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${pct}%` }} />
            </div>

            {/* Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {packingList.map(item => (
                <div key={item.id} className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group cursor-pointer shadow-sm', item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white/40 backdrop-blur-sm border-white/30 hover:border-white/50')}>
                  <button onClick={() => toggleItem(item.id)}
                    className={clsx('w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all shadow-sm', item.checked ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300 hover:border-emerald-500/50')}>
                    {item.checked && <Check size={12} className="text-white font-black" />}
                  </button>
                  <p className={clsx('text-sm font-semibold flex-1 transition-colors', item.checked ? 'line-through text-slate-400' : 'text-slate-700')}>{item.text}</p>
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all bg-white/40 backdrop-blur-sm shadow-sm border border-white/30 p-1 rounded-md">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input className="input-field text-sm h-11 flex-1 bg-white border-slate-200 shadow-sm" placeholder="Add item…" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
              <button onClick={addItem} className="btn-outline h-11 px-4 bg-white/40 backdrop-blur-sm border-white/30 text-slate-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm"><Plus size={16}/></button>
            </div>
          </div>

          {/* Essentials */}
          <div>
            <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4">Always Bring</h2>
            <div className="space-y-2">
              {ESSENTIALS.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 glass-card rounded-xl hover:shadow-md hover:border-blue-200 transition-all shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <Check size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
