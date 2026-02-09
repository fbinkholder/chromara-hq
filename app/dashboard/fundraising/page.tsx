'use client'

import { useState } from 'react'

export default function Fundraising() {
  const [updates, setUpdates] = useState([
    { id: '1', text: 'Initial conversations with 3 VC firms - all interested in follow-up', date: '2026-02-06' },
    { id: '2', text: 'Pitch deck v3.0 completed - emphasis on unit economics', date: '2026-02-01' },
  ])
  const [newUpdate, setNewUpdate] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">💰 Fundraising</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Target Raise" value="$2M" icon="🎯" />
        <StatCard label="Active Conversations" value="5" icon="💼" />
        <StatCard label="Meetings Booked" value="3" icon="📅" />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Recent Updates</h2>
        <div className="space-y-3 mb-4">
          {updates.map((update) => (
            <div key={update.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-chromara-purple">
              <p className="text-white mb-2">{update.text}</p>
              <p className="text-xs text-white/60">{update.date}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Add fundraising update..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button 
            onClick={() => {
              if (newUpdate.trim()) {
                setUpdates([
                  { id: Date.now().toString(), text: newUpdate, date: new Date().toISOString().split('T')[0] },
                  ...updates
                ])
                setNewUpdate('')
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all"
          >
            Add
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📊 Pitch Deck Versions</h2>
        <div className="space-y-2">
          <DeckVersion version="v3.0" date="Feb 1, 2026" status="Current" notes="Emphasis on unit economics, TAM expansion" />
          <DeckVersion version="v2.5" date="Jan 15, 2026" status="Archive" notes="Added competitive analysis section" />
          <DeckVersion version="v2.0" date="Dec 20, 2025" status="Archive" notes="Initial investor deck" />
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all">
          + Upload New Version
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">💼 Quick Links</h2>
          <div className="space-y-2">
            <QuickLink href="/dashboard/fundraising/pipeline" icon="💼" label="Investor Pipeline" />
            <QuickLink href="/dashboard/fundraising/assets" icon="📁" label="Assets & Docs" />
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📅 Upcoming</h2>
          <div className="space-y-3">
            <UpcomingItem title="Meeting with Sequoia" date="Feb 12, 2026" type="Meeting" />
            <UpcomingItem title="Due Diligence Materials" date="Feb 15, 2026" type="Deadline" />
            <UpcomingItem title="Pitch to Andreessen Horowitz" date="Feb 18, 2026" type="Meeting" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function DeckVersion({ version, date, status, notes }: { version: string; date: string; status: string; notes: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all group">
      <span className="text-2xl">📄</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-medium">{version}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${status === 'Current' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-white/60 mb-1">{date}</p>
        <p className="text-xs text-white/40">{notes}</p>
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
      <span className="text-xl">{icon}</span>
      <span className="text-white font-medium">{label}</span>
      <span className="ml-auto text-white/40">→</span>
    </a>
  )
}

function UpcomingItem({ title, date, type }: { title: string; date: string; type: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg border-l-4 border-yellow-500/30">
      <p className="text-white font-medium text-sm mb-1">{title}</p>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span>{date}</span>
        <span>•</span>
        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">{type}</span>
      </div>
    </div>
  )
}
