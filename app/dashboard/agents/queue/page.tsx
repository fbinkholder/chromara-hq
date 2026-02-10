'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type QueuedEmail = {
  id: string
  recipient_name: string
  recipient_email: string
  company: string
  subject: string
  body: string
  variant: 'strategic' | 'founder' | 'research'
  status: 'pending' | 'approved' | 'scheduled' | 'sent' | 'failed'
  scheduled_for?: string
  created_at: string
}

export default function EmailQueuePage() {
  const [emails, setEmails] = useState<QueuedEmail[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'scheduled'>('pending')
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState<QueuedEmail | null>(null)
  const [editingEmail, setEditingEmail] = useState<QueuedEmail | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    // Demo data
    const demoEmails: QueuedEmail[] = [
      {
        id: '1',
        recipient_name: 'Sarah Johnson',
        recipient_email: 'sarah.johnson@loreal.com',
        company: "L'Oréal",
        subject: "L'Oréal x Chromara: The Future of Foundation",
        body: `Hi Sarah,

I'm Faith, founder of Chromara. We've developed NovaMirror—an AI-powered foundation dispenser that creates custom foundation from 4.5 million possible shades using facial scanning and precision micro-dosing.

For L'Oréal, this could mean:
• Moving from 40-50 SKUs to unlimited personalization
• Eliminating waste from unsold inventory
• Solving shade-matching issues that affect a significant portion of your customers

We operate as an infrastructure partner (think Keurig for beauty)—you provide the base formula, we handle the personalized manufacturing and delivery.

Would you have 15 minutes next week to explore how this could work for L'Oréal?

Best,
Faith
Founder & CEO, Chromara`,
        variant: 'strategic',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        recipient_name: 'Michael Chen',
        recipient_email: 'michael.chen@esteelauder.com',
        company: 'Estée Lauder',
        subject: 'Estée Lauder x Chromara: Precision Beauty Technology',
        body: `Hi Michael,

After seeing how many people struggle to find their perfect foundation match, I knew there had to be a better way. NovaMirror combines cutting-edge tech with human warmth—it's not just about precision, it's about making everyone feel seen.

I'd love to share how Estée Lauder could be part of this revolution in personalized beauty.

Would you have 15 minutes next week to explore how this could work for Estée Lauder?

Best,
Faith
Founder & CEO, Chromara`,
        variant: 'founder',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    setEmails(demoEmails)
  }

  const filteredEmails = emails.filter(email => {
    if (filter === 'all') return true
    return email.status === filter
  })

  const toggleEmail = (id: string) => {
    const newSelected = new Set(selectedEmails)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedEmails(newSelected)
  }

  const selectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(filteredEmails.map(e => e.id)))
    }
  }

  const approveSelected = () => {
    if (selectedEmails.size === 0) return
    alert(`Approved ${selectedEmails.size} email(s) for sending!`)
    setSelectedEmails(new Set())
  }

  const scheduleSelected = () => {
    if (selectedEmails.size === 0) return
    const time = prompt('Schedule for when? (e.g., "tomorrow 9am", "2 hours")')
    if (time) {
      alert(`Scheduled ${selectedEmails.size} email(s) for ${time}`)
      setSelectedEmails(new Set())
    }
  }

  const deleteSelected = () => {
    if (selectedEmails.size === 0) return
    if (!confirm(`Delete ${selectedEmails.size} email(s)?`)) return
    setEmails(emails.filter(e => !selectedEmails.has(e.id)))
    setSelectedEmails(new Set())
  }

  const saveEditedEmail = (updated: QueuedEmail) => {
    setEmails(emails.map(e => (e.id === updated.id ? updated : e)))
    setEditingEmail(null)
    setShowPreview(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Queue 📬</h1>
          <p className="text-white/60 mt-1">Review and approve emails before sending</p>
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
        <StatCard label="Pending Review" value={emails.filter(e => e.status === 'pending').length} icon="⏳" />
        <StatCard label="Approved" value={emails.filter(e => e.status === 'approved').length} icon="✅" />
        <StatCard label="Scheduled" value={emails.filter(e => e.status === 'scheduled').length} icon="📅" />
        <StatCard label="Sent Today" value={emails.filter(e => e.status === 'sent').length} icon="📧" />
      </div>

      {/* Filters & Actions */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'scheduled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Batch Actions */}
          {selectedEmails.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={approveSelected}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 text-sm transition-all"
              >
                ✅ Approve ({selectedEmails.size})
              </button>
              <button
                onClick={scheduleSelected}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 text-sm transition-all"
              >
                📅 Schedule ({selectedEmails.size})
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-all"
              >
                🗑️ Delete ({selectedEmails.size})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <div className="text-white/60 text-sm">
          Showing {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''} • {selectedEmails.size} selected
        </div>
        {filteredEmails.length > 0 && (
          <button
            onClick={selectAll}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
          >
            {selectedEmails.size === filteredEmails.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Email List */}
      {filteredEmails.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No emails in queue</h3>
          <p className="text-white/60 mb-4">Generate emails using the AI Email Writer</p>
          <a href="/dashboard/agents/email-writer" className="glass-button">
            ✍️ Go to Email Writer
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              selected={selectedEmails.has(email.id)}
              onToggle={() => toggleEmail(email.id)}
              onPreview={() => setShowPreview(email)}
              onEdit={() => setEditingEmail(email)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <EmailPreviewModal
          email={showPreview}
          onClose={() => setShowPreview(null)}
          onEdit={() => {
            setEditingEmail(showPreview)
            setShowPreview(null)
          }}
          onApprove={() => {
            alert('Email approved for sending!')
            setShowPreview(null)
          }}
          onSchedule={() => {
            const time = prompt('Schedule for when?')
            if (time) {
              alert(`Scheduled for ${time}`)
              setShowPreview(null)
            }
          }}
        />
      )}

      {editingEmail && (
        <EmailEditModal
          email={editingEmail}
          onClose={() => setEditingEmail(null)}
          onSave={saveEditedEmail}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
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

function EmailCard({ email, selected, onToggle, onPreview, onEdit }: {
  email: QueuedEmail
  selected: boolean
  onToggle: () => void
  onPreview: () => void
  onEdit: () => void
}) {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-300',
    approved: 'bg-green-500/20 text-green-300',
    scheduled: 'bg-blue-500/20 text-blue-300',
    sent: 'bg-gray-500/20 text-gray-300',
    failed: 'bg-red-500/20 text-red-300',
  }

  return (
    <div
      className={`glass-card p-5 transition-all ${
        selected ? 'bg-chromara-purple/20 border-2 border-chromara-purple' : 'hover:bg-white/15'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          onClick={onToggle}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
            selected
              ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink border-transparent'
              : 'border-white/40'
          }`}
        >
          {selected && <span className="text-white text-sm">✓</span>}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{email.subject}</h3>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span>To: {email.recipient_name} ({email.company})</span>
                <span>•</span>
                <span>{email.recipient_email}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[email.status]}`}>
              {email.status}
            </span>
          </div>

          {/* Preview snippet */}
          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {email.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPreview}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              👁️ Preview
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-chromara-purple/20 hover:bg-chromara-purple/30 rounded-lg text-chromara-lilac text-sm transition-all"
            >
              ✏️ Edit
            </button>
            <span className={`px-3 py-1 rounded-full text-xs ${
              email.variant === 'strategic' ? 'bg-blue-500/20 text-blue-300' :
              email.variant === 'founder' ? 'bg-purple-500/20 text-purple-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              {email.variant}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmailPreviewModal({ email, onClose, onEdit, onApprove, onSchedule }: {
  email: QueuedEmail
  onClose: () => void
  onEdit: () => void
  onApprove: () => void
  onSchedule: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Email Preview</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Recipient Info */}
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">To:</span>
                <p className="text-white font-semibold">{email.recipient_name}</p>
              </div>
              <div>
                <span className="text-white/60">Company:</span>
                <p className="text-white font-semibold">{email.company}</p>
              </div>
              <div>
                <span className="text-white/60">Email:</span>
                <p className="text-white font-semibold">{email.recipient_email}</p>
              </div>
              <div>
                <span className="text-white/60">Variant:</span>
                <p className="text-white font-semibold">{email.variant}</p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Subject</label>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-white font-semibold">{email.subject}</p>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email Body</label>
            <div className="bg-black/30 rounded-lg p-4">
              <pre className="text-white whitespace-pre-wrap font-sans">{email.body}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20 flex-wrap">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-3 rounded-full bg-chromara-purple/20 hover:bg-chromara-purple/30 text-chromara-lilac transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onSchedule}
            className="px-6 py-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
          >
            📅 Schedule
          </button>
          <button
            onClick={onApprove}
            className="glass-button"
          >
            ✅ Approve & Send
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailEditModal({ email, onClose, onSave }: {
  email: QueuedEmail
  onClose: () => void
  onSave: (updated: QueuedEmail) => void
}) {
  const [form, setForm] = useState<QueuedEmail>({ ...email })
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Edit Email</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">Recipient Name</label>
              <input
                value={form.recipient_name}
                onChange={(e) => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">Recipient Email</label>
              <input
                type="email"
                value={form.recipient_email}
                onChange={(e) => setForm(f => ({ ...f, recipient_email: e.target.value }))}
                className="glass-input w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">Variant</label>
            <select
              value={form.variant}
              onChange={(e) => setForm(f => ({ ...f, variant: e.target.value as QueuedEmail['variant'] }))}
              className="glass-input w-full"
            >
              <option value="strategic">Strategic</option>
              <option value="founder">Founder</option>
              <option value="research">Research</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              className="glass-input w-full min-h-[240px] font-sans whitespace-pre-wrap"
              placeholder="Email body..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-button px-6 py-3 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
