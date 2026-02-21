'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Contact = {
  id: string
  company: string
  contact_name: string
  title: string
  email: string | null
  linkedin_url: string | null
  priority: 'high' | 'medium' | 'low'
  segment: string
  status: 'not_contacted' | 'reached_out' | 'responded' | 'interested' | 'declined' | 'moving_forward'
  outreach_variant: string | null
  platform_used: string[] | null
  date_reached_out: string | null
  last_contact_date: string | null
  next_followup: string | null
  notes: string | null
  response_received: boolean
  created_at: string
  updated_at: string
}

const statusColors = {
  not_contacted: 'bg-gray-500/20 text-gray-300',
  reached_out: 'bg-blue-500/20 text-blue-300',
  responded: 'bg-purple-500/20 text-purple-300',
  interested: 'bg-green-500/20 text-green-300',
  declined: 'bg-red-500/20 text-red-300',
  moving_forward: 'bg-pink-500/20 text-pink-300',
}

const priorityColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
}

export default function PartnershipsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'pipeline'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [contacts, searchQuery, filterStatus, filterPriority])

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (contactId: string, newStatus: Contact['status']) => {
    try {
      const { error } = await supabase
        .from('outreach_contacts')
        .update({
          status: newStatus,
          ...(newStatus === 'reached_out' ? { date_reached_out: new Date().toISOString() } : {}),
          ...(['responded', 'interested', 'moving_forward'].includes(newStatus) ? { response_received: true } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId)
      if (error) throw error
      setSelectedContact((prev) => prev?.id === contactId ? { ...prev, status: newStatus } : prev)
      loadContacts()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const applyFilters = () => {
    let filtered = [...contacts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === filterPriority)
    }

    setFilteredContacts(filtered)
  }

  const stats = {
    total: contacts.length,
    notContacted: contacts.filter(c => c.status === 'not_contacted').length,
    reached: contacts.filter(c => c.status === 'reached_out').length,
    responded: contacts.filter(c => c.status === 'responded').length,
    interested: contacts.filter(c => c.status === 'interested').length,
    movingForward: contacts.filter(c => c.status === 'moving_forward').length,
    responseRate: contacts.filter(c => c.status === 'reached_out').length > 0 
      ? Math.round((contacts.filter(c => c.response_received).length / contacts.filter(c => c.status === 'reached_out').length) * 100)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/60">Loading contacts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Partnership Outreach</h1>
          <p className="text-white/60 mt-1">Track and manage your brand partnerships</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="glass-button"
        >
          ➕ Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Not Contacted" value={stats.notContacted} />
        <StatCard label="Reached Out" value={stats.reached} />
        <StatCard label="Responded" value={stats.responded} />
        <StatCard label="Interested" value={stats.interested} />
        <StatCard label="Moving Forward" value={stats.movingForward} />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} />
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Statuses</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="reached_out">Reached Out</option>
            <option value="responded">Responded</option>
            <option value="interested">Interested</option>
            <option value="declined">Declined</option>
            <option value="moving_forward">Moving Forward</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setView('pipeline')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                view === 'pipeline' 
                  ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              📊 Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-white/60 text-sm">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Contact List or Pipeline */}
      {view === 'list' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredContacts.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No contacts yet</h3>
              <p className="text-white/60 mb-4">Add your first partnership contact to get started</p>
              <button onClick={() => setShowAddModal(true)} className="glass-button">
                ➕ Add First Contact
              </button>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <CompactContactCard
                key={contact.id}
                contact={contact}
                onClick={() => setSelectedContact(contact)}
              />
            ))
          )}
        </div>
      ) : (
        <PipelineView contacts={filteredContacts} onUpdate={loadContacts} onStatusChange={updateContactStatus} />
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onStatusChange={updateContactStatus}
        />
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal 
          onClose={() => setShowAddModal(false)} 
          onSave={loadContacts}
        />
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  )
}

const STATUS_OPTIONS: { value: Contact['status']; label: string }[] = [
  { value: 'not_contacted', label: 'Not contacted' },
  { value: 'reached_out', label: 'Reached out' },
  { value: 'responded', label: 'Responded' },
  { value: 'interested', label: 'Interested' },
  { value: 'declined', label: 'Declined' },
  { value: 'moving_forward', label: 'Moving forward' },
]

function CompactContactCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  const statusLabel = STATUS_OPTIONS.find(o => o.value === contact.status)?.label ?? contact.status
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card p-4 aspect-square min-h-[140px] flex flex-col items-start justify-between text-left hover:scale-[1.02] hover:border-chromara-purple/50 transition-all cursor-pointer border border-transparent"
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-lg ${priorityColors[contact.priority]}`}>
            {contact.priority === 'high' ? '🔴' : contact.priority === 'medium' ? '🟡' : '🟢'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium truncate max-w-[100px] ${statusColors[contact.status]}`}>
            {statusLabel}
          </span>
        </div>
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{contact.company}</h3>
        <p className="text-xs text-white/60 mt-0.5 truncate">{contact.contact_name}</p>
      </div>
      <p className="text-[10px] text-white/50 truncate w-full">{contact.segment}</p>
    </button>
  )
}

function ContactDetailModal({ contact, onClose, onStatusChange }: { contact: Contact; onClose: () => void; onStatusChange: (id: string, status: Contact['status']) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{contact.company}</h2>
                <span className={`text-xl ${priorityColors[contact.priority]}`}>
                  {contact.priority === 'high' ? '🔴' : contact.priority === 'medium' ? '🟡' : '🟢'}
                </span>
              </div>
              <p className="text-white/80">{contact.contact_name} • {contact.title}</p>
              <p className="text-sm text-white/60">{contact.segment}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl p-1">✕</button>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Status</label>
              <select
                value={contact.status}
                onChange={(e) => onStatusChange(contact.id, e.target.value as Contact['status'])}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 bg-white/10 text-white ${statusColors[contact.status]}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {contact.email && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Email</label>
                <a href={`mailto:${contact.email}`} className="text-chromara-pink hover:underline block truncate">
                  {contact.email}
                </a>
              </div>
            )}

            {contact.linkedin_url && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">LinkedIn</label>
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-chromara-purple hover:underline block truncate">
                  {contact.linkedin_url}
                </a>
              </div>
            )}

            {contact.notes && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Notes</label>
                <p className="text-sm text-white/80 bg-white/5 p-3 rounded-lg">{contact.notes}</p>
              </div>
            )}

            {contact.next_followup && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Next follow-up</label>
                <p className="text-sm text-white/80">{new Date(contact.next_followup).toLocaleDateString()}</p>
              </div>
            )}

            {contact.date_reached_out && (
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Date reached out</label>
                <p className="text-sm text-white/80">{new Date(contact.date_reached_out).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <button onClick={onClose} className="w-full py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function PipelineView({ contacts, onUpdate, onStatusChange }: { contacts: Contact[]; onUpdate: () => void; onStatusChange: (id: string, status: Contact['status']) => void }) {
  const stages: { key: Contact['status']; label: string; emoji: string }[] = [
    { key: 'not_contacted', label: 'Not Contacted', emoji: '📭' },
    { key: 'reached_out', label: 'Reached Out', emoji: '📤' },
    { key: 'responded', label: 'Responded', emoji: '💬' },
    { key: 'interested', label: 'Interested', emoji: '✨' },
    { key: 'moving_forward', label: 'Moving Forward', emoji: '🚀' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stages.map((stage) => {
        const stageContacts = contacts.filter(c => c.status === stage.key)
        return (
          <div key={stage.key} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{stage.emoji}</span>
              <div>
                <h3 className="font-semibold text-white">{stage.label}</h3>
                <p className="text-xs text-white/60">{stageContacts.length} contacts</p>
              </div>
            </div>
            <div className="space-y-2">
              {stageContacts.map((contact) => (
                <div key={contact.id} className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all group">
                  <p className="font-medium text-white text-sm">{contact.company}</p>
                  <p className="text-xs text-white/60">{contact.contact_name}</p>
                  <select
                    value={contact.status}
                    onChange={(e) => onStatusChange(contact.id, e.target.value as Contact['status'])}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full px-2 py-1 rounded text-xs bg-white/10 text-white border border-white/20 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AddContactModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    company: '',
    contact_name: '',
    title: '',
    email: '',
    linkedin_url: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    segment: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('outreach_contacts')
        .insert([{
          ...formData,
          user_id: user?.id,
          status: 'not_contacted',
          response_received: false,
        }])

      if (error) throw error

      onSave()
      onClose()
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Failed to add contact. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Contact</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="glass-input w-full"
                placeholder="e.g., L'Oréal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="glass-input w-full"
                placeholder="e.g., Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="glass-input w-full"
                placeholder="e.g., VP of Innovation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input w-full"
                placeholder="jane@loreal.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="glass-input w-full"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Priority *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="glass-input w-full"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Segment *</label>
            <input
              type="text"
              required
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., Major Brand Non-COSMAX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="glass-input w-full"
              rows={3}
              placeholder="Any additional context or notes..."
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="glass-button flex-1">
              {saving ? 'Saving...' : '💾 Save Contact'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
