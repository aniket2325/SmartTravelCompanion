import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Plane, Compass, Sparkles, Shield, Wallet, Map, ArrowRight } from 'lucide-react'
import tropicalBg from '../assets/tropical_canoe.png'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#021d24] text-white selection:bg-[#20e3d2] selection:text-[#021d24] overflow-x-hidden">
      
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#021d24]/60 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20e3d2] to-[#0cd1c2] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Plane size={20} className="text-[#021d24] rotate-45" />
          </div>
          <div>
            <span className="font-black tracking-tight text-lg block leading-none">STC MAIN</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block">Log In</Link>
          <Link to="/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="bg-[#20e3d2] text-[#021d24] px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(32,227,210,0.3)] hover:shadow-[0_0_30px_rgba(32,227,210,0.5)] transition-all"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            src={tropicalBg} 
            alt="Tropical background" 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#021d24]/80 via-[#021d24]/50 to-[#021d24] mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021d24] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
              <Sparkles size={14} className="text-[#20e3d2]" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-300">Your Next-Gen Travel Assistant</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] drop-shadow-2xl">
              Travel Smarter, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20e3d2] to-blue-400">Not Harder.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto font-medium leading-relaxed">
              AI-powered itineraries, real-time budgeting, and emergency SOS alerts. 
              The only companion you need for seamless global exploration.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#20e3d2] to-[#0cd1c2] text-[#021d24] rounded-2xl font-black uppercase tracking-[0.1em] shadow-[0_10px_30px_rgba(32,227,210,0.3)] hover:shadow-[0_10px_40px_rgba(32,227,210,0.5)] hover:scale-105 transition-all text-sm flex items-center justify-center gap-2">
                Start Free <ArrowRight size={18} />
              </button>
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.1em] hover:bg-white/10 transition-all text-sm">
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative z-10 bg-[#021d24] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything you need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Powerful tools designed to replace your messy spreadsheets and scattered browser tabs.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Compass, title: 'AI Trip Planner', desc: 'Generate complete day-by-day itineraries instantly with Gemini AI matching your exact budget and travel style.', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { icon: Wallet, title: 'Smart Budgeting', desc: 'Track expenses in any currency. Auto-convert with live exchange rates and get alerts before you overspend.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { icon: Shield, title: 'SOS Safety', desc: 'One-tap emergency alerts that instantly text your live GPS location to your predefined international contacts.', color: 'text-rose-400', bg: 'bg-rose-400/10' },
              { icon: Map, title: 'GPS Point Finder', desc: 'Find nearby hospitals, restaurants, and ATMs anywhere on the globe without needing Google services.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { icon: Sparkles, title: 'Visa & Weather', desc: 'Real-time entry requirements and 7-day climate forecasts to help you pack properly for any destination.', color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { icon: Plane, title: 'Flight Tracking', desc: 'Keep all your boarding passes, hotel confirmations, and bookings organized in one encrypted vault.', color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-colors group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#011419] border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-60">
            <Plane size={24} className="text-[#20e3d2] rotate-45" />
            <span className="font-bold tracking-widest text-sm uppercase">Smart Travel Companion</span>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-500 font-semibold">
            <a href="#" className="hover:text-[#20e3d2] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#20e3d2] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#20e3d2] transition-colors">Contact</a>
          </div>
          
          <p className="text-slate-600 text-xs font-semibold">
            &copy; {new Date().getFullYear()} STC. Built for global explorers.
          </p>
        </div>
      </footer>
    </div>
  )
}
