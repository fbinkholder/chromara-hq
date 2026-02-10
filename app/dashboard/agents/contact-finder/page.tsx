'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const EMAIL_WRITER_CONTACT_KEY = 'chromara-email-writer-contact'

type Contact = {
  id: string
  contact_name: string
  title: string
  company: string
  email: string
  linkedin_url: string
  segment: string
  priority: string
  status: string
  created_at: string
}

export default function ContactFinderPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    linkedin_url: '',
    segment: 'beauty brands',
    priority: 'medium'
  })
  const [saving, setSaving] = useState(false)
  const [savedContacts, setSavedContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const openInEmailWriter = (contact: Contact) => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(EMAIL_WRITER_CONTACT_KEY, JSON.stringify({
      companyName: contact.company,
      contactName: contact.contact_name,
      contactTitle: contact.title || '',
      customNotes: contact.segment ? `Segment: ${contact.segment}` : '',
    }))
    router.push('/dashboard/agents/email-writer')
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('outreach_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedContacts(data || [])
    } catch (error: any) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.company) {
      alert('Name and Company are required!')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('outreach_contacts')
        .insert({
          user_id: user.id,
          contact_name: formData.name,
          title: formData.title,
          company: formData.company,
          email: formData.email || null,
          linkedin_url: formData.linkedin_url || null,
          segment: formData.segment,
          priority: formData.priority,
          status: 'not_contacted'
        })

      if (error) throw error

      alert('✅ Contact added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        title: '',
        company: '',
        email: '',
        linkedin_url: '',
        segment: 'beauty brands',
        priority: 'medium'
      })

      // Reload contacts list
      loadContacts()
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to add contact: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact?')) return

    try {
      const { error } = await supabase
        .from('outreach_contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadContacts()
    } catch (error: any) {
      alert('Failed to delete: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">➕ Contact Manager</h1>
        <p className="text-white/60 text-lg">Add contacts manually and view your saved list</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Add Contact Form */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Add New Contact</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Contact Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="VP of Innovation"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="L'Oréal"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jane.smith@loreal.com"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/janesmith"
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Segment</label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({...formData, segment: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="beauty brands">Beauty Brands</option>
                  <option value="retail partners">Retail Partners</option>
                  <option value="investors">Investors</option>
                  <option value="manufacturers">Manufacturers</option>
                  <option value="press">Press/Media</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full glass-button py-4 text-lg font-semibold disabled:opacity-50"
            >
              {saving ? '⏳ Adding...' : '✅ Add Contact'}
            </button>
          </form>
        </div>

        {/* RIGHT: Saved Contacts List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Saved Contacts ({savedContacts.length})</h2>
            <button
              onClick={loadContacts}
              className="glass-button px-4 py-2 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/60">Loading...</div>
          ) : savedContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <p className="text-white/60">No contacts yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {savedContacts.map((contact) => (
                <div key={contact.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-chromara-purple/50 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{contact.contact_name}</h3>
                      <p className="text-white/80 text-sm">{contact.title}</p>
                      <p className="text-white/60 text-sm">{contact.company}</p>
                      {contact.email && (
                        <p className="text-chromara-purple text-sm mt-2">📧 {contact.email}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">{contact.segment}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          contact.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          contact.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{contact.priority}</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{contact.status}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all ml-4">
                      <button
                        onClick={() => openInEmailWriter(contact)}
                        className="px-3 py-1.5 rounded-lg bg-chromara-purple/30 hover:bg-chromara-purple/50 text-white text-sm"
                      >
                        ✉️ Write email
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tip */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-3">💡 Quick Tip</h3>
        <p className="text-white/80 mb-3">Find contacts on:</p>
        <ul className="list-disc list-inside space-y-2 text-white/70">
          <li><strong>LinkedIn:</strong> Search "VP Innovation beauty brands"</li>
          <li><strong>Apollo.io:</strong> Use their web interface (free searches available)</li>
          <li><strong>Company websites:</strong> Look for leadership/team pages</li>
        </ul>
      </div>
    </div>
  )
}