'use client'

import { useState } from 'react'

type FollowUpSequence = {
  id: string
  name: string
  steps: FollowUpStep[]
  active: boolean
  contacts_enrolled: number
  responses: number
}

type FollowUpStep = {
  id: string
  delay_days: number
  subject: string
  body: string
  stop_if_replied: boolean
}

const DEMO_SEQUENCES: FollowUpSequence[] = [
  {
    id: '1',
    name: 'Strategic Partnership - 3 Touch',
    steps: [
      {
        id: 's1',
        delay_days: 3,
        subject: 'Re: {{company}} x Chromara',
        body: `Hi {{name}},

I wanted to follow up on my previous email about NovaMirror.

Quick reminder: We're helping beauty brands move from 40-50 SKUs to unlimited personalization while eliminating inventory waste.

Do you have 15 minutes this week to explore how this could work for {{company}}?

Best,
Faith`,
        stop_if_replied: true,
      },
      {
        id: 's2',
        delay_days: 7,
        subject: 'Chromara case study: 95% reduction in waste',
        body: `Hi {{name}},

I thought you might be interested in early data from our beta partners showing a 95% reduction in foundation waste.

For {{company}}, this could translate to significant cost savings and sustainability wins.

Would you like to see the full case study?

Best,
Faith`,
        stop_if_replied: true,
      },
      {
        id: 's3',
        delay_days: 14,
        subject: 'Last chance: {{company}} x Chromara partnership',
        body: `Hi {{name}},

This is my final follow-up. I understand you're busy, so I'll keep this brief.

NovaMirror is launching with several major brands this year. I'd love for {{company}} to be one of them, but I understand if the timing isn't right.

If you're interested, let me know. Otherwise, I'll reach out again in 6 months.

Best,
Faith`,
        stop_if_replied: true,
      },
    ],
    active: true,
    contacts_enrolled: 12,
    responses: 3,
  },
]

export default function FollowUpsPage() {
  const [sequences, setSequences] = useState<FollowUpSequence[]>(DEMO_SEQUENCES)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSequence, setEditingSequence] = useState<FollowUpSequence | null>(null)

  const toggleSequence = (id: string) => {
    setSequences(sequences.map(seq =>
      seq.id === id ? { ...seq, active: !seq.active } : seq
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Auto Follow-ups 🔄</h1>
          <p className="text-white/60 mt-1">Set up automatic follow-up sequences</p>
        </div>
        <a
          href="/dashboard/agents"
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          ← Back to Agent
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Sequences" value={sequences.filter(s => s.active).length} icon="🔄" />
        <StatCard label="Contacts Enrolled" value={sequences.reduce((sum, s) => sum + s.contacts_enrolled, 0)} icon="👥" />
        <StatCard label="Total Responses" value={sequences.reduce((sum, s) => sum + s.responses, 0)} icon="💬" />
        <StatCard label="Response Rate" value="25%" icon="📈" />
      </div>

      {/* Create Sequence Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button"
        >
          ➕ Create New Sequence
        </button>
      </div>

      {/* Sequences List */}
      {sequences.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-white mb-2">No follow-up sequences yet</h3>
          <p className="text-white/60 mb-4">Create your first automated follow-up sequence</p>
          <button onClick={() => setShowCreateModal(true)} className="glass-button">
            ➕ Create Sequence
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((sequence) => (
            <SequenceCard
              key={sequence.id}
              sequence={sequence}
              onToggle={() => toggleSequence(sequence.id)}
              onEdit={() => setEditingSequence(sequence)}
            />
          ))}
        </div>
      )}

      {/* How It Works */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">How Auto Follow-ups Work</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Create Sequence</h4>
              <p className="text-sm text-white/60">Define your follow-up steps with timing and messaging</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Send Initial Email</h4>
              <p className="text-sm text-white/60">When you send an email, contact automatically enrolls in sequence</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Auto Follow-up</h4>
              <p className="text-sm text-white/60">Agent sends follow-ups based on your timing (3 days, 1 week, etc.)</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Smart Stop</h4>
              <p className="text-sm text-white/60">Sequence automatically stops when contact replies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="glass-card p-6 bg-blue-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Best Practices</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>✓ Space follow-ups 3-7 days apart to avoid being pushy</li>
          <li>✓ Use 2-3 follow-ups maximum per sequence</li>
          <li>✓ Always enable "stop if replied" to respect responses</li>
          <li>✓ Change the angle/value prop in each follow-up</li>
          <li>✓ Make the final follow-up a clear "last chance" message</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function SequenceCard({ sequence, onToggle, onEdit }: {
  sequence: FollowUpSequence
  onToggle: () => void
  onEdit: () => void
}) {
  const responseRate = sequence.contacts_enrolled > 0 
    ? Math.round((sequence.responses / sequence.contacts_enrolled) * 100) 
    : 0

  return (
    <div className="glass-card p-6 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{sequence.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              sequence.active 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              {sequence.active ? '🟢 Active' : '⚪ Inactive'}
            </span>
          </div>
          <p className="text-sm text-white/60">
            {sequence.steps.length} steps • {sequence.contacts_enrolled} enrolled • {sequence.responses} responses ({responseRate}%)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              sequence.active
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
            }`}
          >
            {sequence.active ? '⏸️ Pause' : '▶️ Activate'}
          </button>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-white/20"></div>
          <span className="text-xs text-white/40">FOLLOW-UP SEQUENCE</span>
          <div className="h-px flex-1 bg-white/20"></div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-semibold">
            Day 0
          </div>
          <span className="text-white/60">Initial email sent</span>
        </div>

        {sequence.steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3 pl-4 border-l-2 border-white/20">
            <div className="flex items-center gap-2 text-sm flex-1">
              <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full font-semibold">
                Day {step.delay_days}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{step.subject}</p>
                <p className="text-white/60 text-xs line-clamp-1">{step.body}</p>
              </div>
            </div>
            {step.stop_if_replied && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                ✓ Auto-stop
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
