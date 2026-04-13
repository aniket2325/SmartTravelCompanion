import { motion } from 'framer-motion'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const fadeSlide = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}

export default function PageWrapper({ icon: Icon, title, subtitle, iconColor = 'text-blue-500', iconBg = 'bg-blue-100', children }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide h-full min-h-[0] transform-gpu will-change-scroll">
      <header className="sticky top-0 z-20 border-b border-sky-100/40 px-6 py-3.5" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(240,249,255,0.5))', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
            className={`w-9 h-9 rounded-xl ${iconBg} border border-slate-200/50 flex items-center justify-center`}
          >
            <Icon size={18} className={iconColor} />
          </motion.div>
          <div>
            <h1 className="font-bold text-sm text-slate-800">{title}</h1>
            {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
          </div>
        </div>
      </header>

      <motion.div variants={stagger} initial="hidden" animate="show" className="p-6 max-w-6xl space-y-6">
        {typeof children === 'function' ? children({ fadeSlide }) : children}
      </motion.div>
    </div>
  )
}

export { stagger, fadeSlide }
