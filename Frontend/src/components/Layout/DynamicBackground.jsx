import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function DynamicBackground() {
  const [stamp, setStamp] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStamp(s => (s + 1) % 4)
    }, 15000) // Change image every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const IMAGES = [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80', // Beach/Ocean house
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', // Clear Ocean/Tropical
    'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=2000&q=80', // Coastline travel
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80', // Airplane over earth
  ]

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-100">
      {IMAGES.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: stamp === i ? 1 : 0,
            scale: stamp === i ? 1 : 1.05 
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      ))}
      
      {/* Light glass overlay just so text can still be readable without hiding the picture! */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40 mix-blend-overlay" />
    </div>
  )
}
