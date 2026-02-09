'use client'

export default function SoftwareEngineering() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">💻 Software Engineering</h1>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Core Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemCard title="Facial Scanning Algorithm" status="Active Development" version="v2.1" />
          <SystemCard title="Color Matching Engine" status="Optimization" version="v1.8" />
          <SystemCard title="Mobile App (iOS/Android)" status="Planning" version="v0.1" />
          <SystemCard title="Cloud Sync & Storage" status="Architecture" version="v0.3" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Development Roadmap</h2>
        <div className="space-y-3">
          <RoadmapItem title="AI Model Training - Shade Recognition" status="In Progress" priority="High" />
          <RoadmapItem title="User Profile & Preferences System" status="Planning" priority="High" />
          <RoadmapItem title="Dispenser Control Software" status="Testing" priority="Critical" />
          <RoadmapItem title="Analytics Dashboard (Internal)" status="Backlog" priority="Medium" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔧 Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TechBadge name="Python" icon="🐍" />
          <TechBadge name="TensorFlow" icon="🧠" />
          <TechBadge name="React Native" icon="📱" />
          <TechBadge name="AWS" icon="☁️" />
          <TechBadge name="PostgreSQL" icon="🗄️" />
          <TechBadge name="Raspberry Pi" icon="🥧" />
          <TechBadge name="OpenCV" icon="👁️" />
          <TechBadge name="Node.js" icon="🟢" />
        </div>
      </div>
    </div>
  )
}

function SystemCard({ title, status, version }: { title: string; status: string; version: string }) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{status}</span>
        <span className="text-xs text-white/60">{version}</span>
      </div>
    </div>
  )
}

function RoadmapItem({ title, status, priority }: { title: string; status: string; priority: string }) {
  const colors: Record<string, string> = {
    'Critical': 'border-red-500/30 bg-red-500/10',
    'High': 'border-yellow-500/30 bg-yellow-500/10',
    'Medium': 'border-blue-500/30 bg-blue-500/10'
  }
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${colors[priority]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">{title}</h3>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">{status}</span>
          <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">{priority}</span>
        </div>
      </div>
    </div>
  )
}

function TechBadge({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-white font-medium">{name}</span>
    </div>
  )
}
