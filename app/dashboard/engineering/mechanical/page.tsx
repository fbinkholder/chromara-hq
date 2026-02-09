'use client'

export default function MechanicalEngineering() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🔧 Mechanical Engineering</h1>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Hardware Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-2">Mirror Housing</h3>
            <p className="text-sm text-white/60 mb-3">Glassmorphic design, integrated lighting</p>
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">CAD Modeling</span>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-2">Dispenser Mechanism</h3>
            <p className="text-sm text-white/60 mb-3">4-channel precision dosing system</p>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Design Complete</span>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-2">Mixing Chamber</h3>
            <p className="text-sm text-white/60 mb-3">Real-time color blending module</p>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Prototyping</span>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-white font-semibold mb-2">Camera System</h3>
            <p className="text-sm text-white/60 mb-3">High-res facial scanning array</p>
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Testing</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📐 Engineering Specs</h2>
        <div className="space-y-3">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Dimensions</span>
              <span className="text-white/60">45cm x 35cm x 8cm</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-chromara-purple to-chromara-pink"></div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Weight (Target)</span>
              <span className="text-white/60">≤ 3.5 kg</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-chromara-purple to-chromara-pink"></div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Dispenser Accuracy</span>
              <span className="text-white/60">±0.1ml precision</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
