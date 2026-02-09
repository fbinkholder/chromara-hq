'use client'

import { useState } from 'react'

export default function EngineeringDashboard() {
  const [newUpdate, setNewUpdate] = useState('')
  const [updates, setUpdates] = useState([
    { id: '1', text: 'MoPine Engineering began CAD modeling for mirror housing', date: '2026-02-05', type: 'progress' },
    { id: '2', text: 'Dispenser cartridge design finalized - 4 color channels confirmed', date: '2026-02-01', type: 'milestone' },
    { id: '3', text: 'Facial scanning algorithm accuracy improved to 98.5%', date: '2026-01-28', type: 'progress' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">⚙️ Engineering Dashboard</h1>
        <div className="flex gap-2">
          <a href="/dashboard/engineering/software" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all">
            Software →
          </a>
          <a href="/dashboard/engineering/mechanical" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all">
            Mechanical →
          </a>
        </div>
      </div>

      {/* Prototype Status */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔧 Prototype Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard 
            title="NovaMirror Prototype"
            status="In Development"
            progress={65}
            target="May 2026"
            color="from-blue-500 to-purple-500"
          />
          <StatusCard 
            title="Dispenser Cartridge"
            status="Design Complete"
            progress={100}
            target="Feb 2026"
            color="from-green-500 to-emerald-500"
          />
          <StatusCard 
            title="Beta Testing Units"
            status="Planning"
            progress={20}
            target="June 2026"
            color="from-yellow-500 to-orange-500"
          />
        </div>
      </div>

      {/* Recent Updates */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Prototype Updates</h2>
        
        <div className="space-y-3 mb-4">
          {updates.map((update) => (
            <div key={update.id} className={`p-4 bg-white/5 rounded-lg border-l-4 ${update.type === 'milestone' ? 'border-chromara-pink' : 'border-blue-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-medium">{update.text}</p>
                  <p className="text-sm text-white/60 mt-1">{update.date}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${update.type === 'milestone' ? 'bg-chromara-pink/20 text-chromara-pink' : 'bg-blue-500/20 text-blue-400'}`}>
                  {update.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Add prototype update..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button 
            onClick={() => {
              if (newUpdate.trim()) {
                setUpdates([
                  { id: Date.now().toString(), text: newUpdate, date: new Date().toISOString().split('T')[0], type: 'progress' },
                  ...updates
                ])
                setNewUpdate('')
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all"
          >
            Add Update
          </button>
        </div>
      </div>

      {/* Product Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 Product Development Timeline</h2>
        
        <div className="relative pl-8 space-y-6">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chromara-purple via-chromara-pink to-blue-500"></div>
          
          <TimelineItem 
            title="Prototype Development"
            date="Feb - May 2026"
            status="in-progress"
            description="Working with MoPine Engineering on functional prototype"
          />
          <TimelineItem 
            title="Beta Testing Phase"
            date="June - Aug 2026"
            status="upcoming"
            description="100 beta testers, feedback collection, iteration"
          />
          <TimelineItem 
            title="Manufacturing Partner"
            date="Sept - Oct 2026"
            status="upcoming"
            description="Identify and negotiate with manufacturing partners"
          />
          <TimelineItem 
            title="Production Ramp"
            date="Nov 2026 - Q1 2027"
            status="upcoming"
            description="Initial production run, quality control, logistics"
          />
          <TimelineItem 
            title="Market Launch"
            date="Q2 2027"
            status="upcoming"
            description="Retail partnerships activated, direct sales launch"
          />
        </div>
      </div>

      {/* Tech Document Library */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📚 Technical Documentation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DocCard title="NovaMirror Master Dimensions" date="Jan 2026" type="PDF" />
          <DocCard title="Dispenser Mechanism Specs" date="Dec 2025" type="PDF" />
          <DocCard title="Facial Scanning Algorithm v2.1" date="Jan 2026" type="DOC" />
          <DocCard title="Color Matching Engine Documentation" date="Nov 2025" type="PDF" />
          <DocCard title="Hardware BOM (Bill of Materials)" date="Dec 2025" type="XLSX" />
          <DocCard title="Safety & Compliance Testing" date="Jan 2026" type="PDF" />
        </div>

        <button className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all">
          + Upload New Document
        </button>
      </div>
    </div>
  )
}

function StatusCard({ title, status, progress, target, color }: {
  title: string
  status: string
  progress: number
  target: string
  color: string
}) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/60 mb-3">{status}</p>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${color} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <p className="text-xs text-white/60">Target: {target}</p>
    </div>
  )
}

function TimelineItem({ title, date, status, description }: {
  title: string
  date: string
  status: 'complete' | 'in-progress' | 'upcoming'
  description: string
}) {
  const dotColors = {
    'complete': 'bg-green-500',
    'in-progress': 'bg-chromara-purple',
    'upcoming': 'bg-white/40'
  }

  return (
    <div className="relative">
      <div className={`absolute -left-8 w-6 h-6 rounded-full ${dotColors[status]} border-4 border-black/50`} />
      <div className="glass-card p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-white font-semibold">{title}</h3>
          <span className="text-xs text-white/60 whitespace-nowrap">{date}</span>
        </div>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </div>
  )
}

function DocCard({ title, date, type }: { title: string; date: string; type: string }) {
  const icons: Record<string, string> = {
    'PDF': '📄',
    'DOC': '📝',
    'XLSX': '📊'
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all group">
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate group-hover:text-chromara-pink transition-colors">{title}</p>
        <p className="text-xs text-white/60">{date}</p>
      </div>
      <span className="text-xs text-white/40">{type}</span>
    </div>
  )
}
