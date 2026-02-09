'use client'

export default function EngineeringPlanning() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🗺️ Engineering Planning</h1>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Future Initiatives</h2>
        <div className="space-y-3">
          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-purple-500/50">
            <h3 className="text-white font-semibold mb-2">Gen 2 NovaMirror</h3>
            <p className="text-sm text-white/60 mb-2">Slimmer profile, wireless charging, enhanced AI</p>
            <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">Q4 2027</span>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500/50">
            <h3 className="text-white font-semibold mb-2">Portable ChromaPod</h3>
            <p className="text-sm text-white/60 mb-2">Travel-sized dispenser, pocket mirror</p>
            <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">2028</span>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-pink-500/50">
            <h3 className="text-white font-semibold mb-2">Beyond Foundation</h3>
            <p className="text-sm text-white/60 mb-2">Expand to concealer, blush, bronzer, lipstick</p>
            <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">2029+</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">💡 Research & Development</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <span className="text-2xl mb-2 block">🔬</span>
            <h3 className="text-white font-semibold mb-1">Skincare Integration</h3>
            <p className="text-xs text-white/60">Dispense custom serums, SPF, primers</p>
          </div>
          <div className="glass-card p-4">
            <span className="text-2xl mb-2 block">♻️</span>
            <h3 className="text-white font-semibold mb-1">Sustainability</h3>
            <p className="text-xs text-white/60">Refillable cartridges, recyclable materials</p>
          </div>
          <div className="glass-card p-4">
            <span className="text-2xl mb-2 block">🌡️</span>
            <h3 className="text-white font-semibold mb-1">Climate Adaptation</h3>
            <p className="text-xs text-white/60">Formula adjusts for humidity, temperature</p>
          </div>
          <div className="glass-card p-4">
            <span className="text-2xl mb-2 block">📲</span>
            <h3 className="text-white font-semibold mb-1">AR Try-On</h3>
            <p className="text-xs text-white/60">Virtual makeup testing before dispensing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
