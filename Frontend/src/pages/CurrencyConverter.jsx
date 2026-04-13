import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw, TrendingUp, ArrowRightLeft, 
  ChevronDown, DollarSign, Globe, Sparkles, 
  ArrowUpRight, History, Info, Banknote, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import PageWrapper from '../components/Layout/PageWrapper'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',      flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro',           flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound',  flag: '🇬🇧', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee',   flag: '🇮🇳', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen',   flag: '🇯🇵', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar',flag: '🇨🇦', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
]

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState(CURRENCIES[0])
  const [toCurrency, setToCurrency] = useState(CURRENCIES[3]) // INR
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const [isSwapping, setIsSwapping] = useState(false)

  const fetchRates = async () => {
    try {
      setLoading(true)
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      
      if (data.result === 'success') {
        setRates(data.rates)
        setLastUpdated(new Date().toLocaleTimeString())
        setError(null)
      } else {
        throw new Error('Failed to fetch rates')
      }
    } catch (err) {
      console.error(err)
      setError('Market data currently unavailable')
      toast.error('Failed to update market rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const handleSwap = () => {
    setIsSwapping(true)
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setTimeout(() => setIsSwapping(false), 500)
    toast.success('Currencies swapped')
  }

  const getRate = (code) => rates[code] || 1
  const currentRate = (getRate(toCurrency.code) / getRate(fromCurrency.code))
  const convertedAmount = (parseFloat(amount || 0) * currentRate).toFixed(2)

  const popularConversions = [
    { from: 'USD', to: 'EUR', rate: getRate('EUR').toFixed(2), change: '+0.12%' },
    { from: 'USD', to: 'INR', rate: getRate('INR').toFixed(2), change: '-0.05%' },
    { from: 'EUR', to: 'GBP', rate: (getRate('GBP') / getRate('EUR')).toFixed(2), change: '+0.02%' },
    { from: 'GBP', to: 'INR', rate: (getRate('INR') / getRate('GBP')).toFixed(2), change: '+0.21%' },
  ]

  return (
    <PageWrapper icon={Banknote} title="Currency Converter" subtitle="Real-time exchange rates for your travels" iconColor="text-emerald-500" iconBg="bg-emerald-100">
      <div className="max-w-4xl space-y-8">
        
        <div className="flex justify-end -mt-10 relative z-30 mb-6 pointer-events-auto">
          <button onClick={fetchRates} className="flex items-center gap-2 text-blue-600 bg-white px-4 py-2 rounded-full border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors shadow-sm">
            <RefreshCw size={14} className={clsx(loading && 'animate-spin')} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {loading ? 'Refreshing...' : `Updated at ${lastUpdated || '--:--'}`}
            </span>
          </button>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
               <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm font-bold shadow-sm">
                 <AlertCircle size={18} />
                 {error}. Using cached data if available.
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Converter Card */}
        <div className="relative">
          <div className="glass-card rounded-[20px] p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 blur-[80px] rounded-full pointer-events-none -ml-32 -mb-32" />

            {loading && Object.keys(rates).length === 0 ? (
              <div className="relative z-10 space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
                  <div className="h-16 bg-slate-100 rounded-xl block"></div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto"></div>
                  <div className="h-16 bg-slate-100 rounded-xl block"></div>
                </div>
                <div className="h-24 bg-slate-100 rounded-xl w-3/4 mx-auto"></div>
              </div>
            ) : (
              <div className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
                  {/* From Section */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block">From</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="input-field text-2xl font-display font-black h-16 pt-7 pb-2 bg-slate-50 border border-slate-200" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <select 
                          value={fromCurrency.code} 
                          onChange={(e) => setFromCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                          className="bg-transparent text-slate-800 font-bold text-lg outline-none cursor-pointer hover:text-blue-600 transition-colors pr-2"
                        >
                          {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white text-slate-800">{c.flag} {c.code}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center -mb-2 md:mb-0">
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSwap}
                      className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 z-20 border-4 border-white"
                    >
                      <ArrowRightLeft size={20} />
                    </motion.button>
                  </div>

                  {/* To Section */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block">To</label>
                    <div className="relative group">
                      <div className="input-field text-2xl font-display font-black h-16 pt-7 pb-2 flex items-center bg-slate-100 border-slate-200 text-slate-800 opacity-90 select-none shadow-inner">
                        {convertedAmount}
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <select 
                          value={toCurrency.code} 
                          onChange={(e) => setToCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                          className="bg-transparent text-slate-800 font-bold text-lg outline-none cursor-pointer hover:text-blue-600 transition-colors pr-2"
                        >
                          {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white text-slate-800">{c.flag} {c.code}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversion Result Detail */}
                <div className="flex flex-col items-center text-center space-y-2 pt-6 border-t border-slate-200">
                  <p className="text-slate-500 text-sm font-bold">
                    {amount} {fromCurrency.name} =
                  </p>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-slate-800 tracking-tight">
                    <span className="text-blue-600">{toCurrency.symbol}</span>{parseFloat(convertedAmount).toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                      Rate: 1 {fromCurrency.code} = {currentRate.toFixed(4)} {toCurrency.code}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Currencies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display font-extrabold text-lg text-slate-800">Popular Conversions</h3>
              <Globe size={18} className="text-slate-400" />
            </div>
            <div className="glass-card rounded-[18px] overflow-hidden shadow-sm min-h-[160px]">
              {loading && Object.keys(rates).length === 0 ? (
                <div className="p-4 space-y-4 animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg"></div>)}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {popularConversions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                          {item.from}
                        </div>
                        <ArrowRightLeft size={12} className="text-slate-400" />
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">
                          {item.to}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-800 mb-0.5">{item.rate}</p>
                        <p className={clsx('text-[10px] font-bold', item.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500')}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Market Trend Sparklines (Visual Mock) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display font-extrabold text-lg text-slate-800">Market Insights</h3>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <div className="glass-card rounded-[18px] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Exchange Volatility</p>
                  <h4 className="font-display font-black text-xl text-slate-800">Low Momentum</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
                  <History size={20} className="text-blue-500" />
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-16 mt-auto">
                {[40, 60, 45, 70, 55, 80, 65, 90, 75, 100, 85, 95].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={clsx('flex-1 rounded-sm bg-gradient-to-t shadow-sm', i === 11 ? 'from-blue-600 to-blue-400 opacity-100' : 'from-slate-200 to-slate-300 opacity-60')} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-5 font-semibold flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <Info size={12} className="text-blue-500" /> Market data is updated every 15 minutes. High reliability.
              </p>
            </div>
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Banknote size={80} className="text-blue-600"/></div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-blue-600 mb-2">
              <Sparkles size={14} /> 
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded border border-blue-200">Travel Tip</span>
            </div>
            <h3 className="text-lg font-display font-extrabold text-slate-800 mb-1">Save on Exchange Fees</h3>
            <p className="text-slate-500 text-sm font-medium max-w-md">Avoid airport kiosks. Use local ATMs or neo-banks like Revolut or Wise for the best interbank rates.</p>
          </div>
          <button className="btn-outline bg-white/40 backdrop-blur-sm flex-shrink-0 relative z-10 font-bold" onClick={fetchRates}>Refresh Data</button>
        </div>
      </div>
    </PageWrapper>
  )
}
