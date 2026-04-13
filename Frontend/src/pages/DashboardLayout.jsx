import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Layout/Sidebar'
import DynamicBackground from '../components/Layout/DynamicBackground'

/* Animated flight paths + map grid background for Light Mode */
function AnimatedFlightPaths() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pf1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59,130,246,0)" />
          <stop offset="50%" stopColor="rgba(59,130,246,0.3)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </linearGradient>
        <linearGradient id="pf2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(139,92,246,0)" />
          <stop offset="50%" stopColor="rgba(139,92,246,0.2)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </linearGradient>
        <linearGradient id="pf3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(14,165,233,0)" />
          <stop offset="50%" stopColor="rgba(14,165,233,0.2)" />
          <stop offset="100%" stopColor="rgba(14,165,233,0)" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Grid */}
      {[160, 320, 480, 640].map((y, i) => <line key={`h${i}`} x1="0" y1={y} x2="1200" y2={y} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />)}
      {[200, 400, 600, 800, 1000].map((x, i) => <line key={`v${i}`} x1={x} y1="0" x2={x} y2="800" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />)}

      {/* Path 1 */}
      <path d="M -50 500 Q 300 150 600 300 Q 900 450 1250 180" fill="none" stroke="url(#pf1)" strokeWidth="1.5" strokeLinecap="round">
        <animate attributeName="stroke-dasharray" values="0 2000;800 1200;2000 0" dur="9s" repeatCount="indefinite" />
      </path>
      <circle r="4" fill="rgba(59,130,246,0.9)" filter="url(#glow)">
        <animateMotion dur="9s" repeatCount="indefinite" path="M -50 500 Q 300 150 600 300 Q 900 450 1250 180" />
      </circle>

      {/* Path 2 */}
      <path d="M -50 200 Q 250 420 550 360 Q 850 300 1250 480" fill="none" stroke="url(#pf2)" strokeWidth="1" strokeLinecap="round">
        <animate attributeName="stroke-dasharray" values="0 2000;600 1400;2000 0" dur="13s" repeatCount="indefinite" begin="3s" />
      </path>
      <circle r="3.5" fill="rgba(139,92,246,0.8)" filter="url(#glow)">
        <animateMotion dur="13s" repeatCount="indefinite" begin="3s" path="M -50 200 Q 250 420 550 360 Q 850 300 1250 480" />
      </circle>

      {/* Path 3 */}
      <path d="M 100 680 Q 400 280 700 380 Q 1000 480 1300 230" fill="none" stroke="url(#pf3)" strokeWidth="0.8" strokeLinecap="round">
        <animate attributeName="stroke-dasharray" values="0 2000;500 1500;2000 0" dur="16s" repeatCount="indefinite" begin="6s" />
      </path>
      <circle r="3" fill="rgba(14,165,233,0.7)" filter="url(#glow)">
        <animateMotion dur="16s" repeatCount="indefinite" begin="6s" path="M 100 680 Q 400 280 700 380 Q 1000 480 1300 230" />
      </circle>

      {/* Destination dots */}
      {[{ cx: 250, cy: 320 }, { cx: 600, cy: 300 }, { cx: 900, cy: 400 }, { cx: 450, cy: 550 }, { cx: 1050, cy: 280 }, { cx: 150, cy: 480 }, { cx: 800, cy: 180 }].map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={d.cy} r="12" fill="none" stroke="rgba(59,130,246,0.15)"><animate attributeName="r" values="6;16;6" dur="4s" repeatCount="indefinite" begin={`${i * 0.5}s`} /><animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" begin={`${i * 0.5}s`} /></circle>
          <circle cx={d.cx} cy={d.cy} r="2.5" fill="rgba(59,130,246,0.5)"><animate attributeName="r" values="1.5;3;1.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} /></circle>
        </g>
      ))}


    </svg>
  )
}

/* Floating particles */
function Particles() {
  return (
    <>
      {[
        { x: '12%', y: '18%', s: 4, d: 9, dl: 0 }, { x: '82%', y: '28%', s: 3, d: 11, dl: 1 },
        { x: '38%', y: '72%', s: 3.5, d: 8, dl: 2 }, { x: '72%', y: '78%', s: 2.5, d: 10, dl: 3 },
        { x: '22%', y: '58%', s: 2, d: 12, dl: 4 }, { x: '88%', y: '48%', s: 3, d: 9, dl: 1.5 },
      ].map((p, i) => (
        <motion.div key={i} className="absolute rounded-full bg-blue-500/20 pointer-events-none z-0 shadow-lg"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: p.d, repeat: Infinity, ease: 'easeInOut', delay: p.dl }}
        />
      ))}
    </>
  )
}



/* Animated 3D Globe — compact top-right corner */
function AnimatedGlobe() {
  return (
    <div className="absolute top-6 right-6 w-48 h-48 pointer-events-none z-[5] opacity-90 shadow-2xl rounded-full">
      <style>
        {`
          @keyframes spin-earth {
            from { background-position: 0% 50%; }
            to { background-position: -200% 50%; }
          }
        `}
      </style>
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundImage: 'url(https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg)',
          backgroundSize: '200% 100%',
          boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.8), inset 10px 10px 25px rgba(255,255,255,0.3), 0 0 35px rgba(59,130,246,0.6)',
          animation: 'spin-earth 24s linear infinite',
          transform: 'rotateZ(15deg) rotateX(10deg)'
        }}
      />
    </div>
  )
}

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden relative"
    >
      <DynamicBackground />

      <AnimatedFlightPaths />
      <AnimatedGlobe />
      <Particles />

      {/* Subtle light flares */}
      <motion.div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full pointer-events-none z-0 mix-blend-overlay"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,1), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 drop-shadow-sm min-h-[0] h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col min-h-[0] h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}