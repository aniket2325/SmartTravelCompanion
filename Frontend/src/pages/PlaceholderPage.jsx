import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title = 'Coming Soon' }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Construction size={28} className="text-teal-400" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-white/40 text-sm max-w-xs">This feature is being built. Check back soon!</p>
    </div>
  )
}