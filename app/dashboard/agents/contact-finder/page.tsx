'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Contact = {
  id: string
  name: string
  title: string
  company: string
  email: string
  linkedin_url?: string
}

export default function ContactFinderPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Contact[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setResults([])

    try {
      const response = await fetch('/api/apollo/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.contacts || [])
      
      if (data.contacts.length === 0) {
        alert('No contacts found. Try a different search query.')
      }
    } catch (error: any) {
      console.error('Search error:', error)
      alert('Search failed: ' + error.message)
    } finally {
      setSearching(false)
    }
  }

  const handleAddContact = async (contact: Contact) => {
    setSaving(contact.id)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('You must be logged in to save contacts')
        return
      }

      const { error } = await supabase
        .from('outreach_contacts')
        .insert({
          user_id: user.id,
          company: contact.company,
          contact_name: contact.name,
          title: contact.title,
          email: contact.email,
          linkedin_url: contact.linkedin_url,
          segment: 'beauty brands',
          priority: 'medium',
          status: 'not_contacted'
        })

      if (error) throw error

      alert('✅ Added to Partnership Tracker!')
      setResults(results.filter(r => r.id !== contact.id))
    } catch (error: any) {
      console.error('Save error:', error)
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">🔍 Contact Finder</h1>
        <p className="text-white/60 text-lg">Search Apollo.io for beauty industry contacts</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., VP Innovation beauty brands"
            className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="glass-button px-8 py-3 disabled:opacity-50"
          >
            {searching ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Found {results.length} contacts
          </h2>

          <div className="space-y-4">
            {results.map((contact) => (
              <div key={contact.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                    <p className="text-white/80">{contact.title}</p>
                    <p className="text-white/60">{contact.company}</p>
                    {contact.email && (
                      <p className="text-sm text-chromara-purple mt-2">📧 {contact.email}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddContact(contact)}
                    disabled={saving === contact.id}
                    className="glass-button px-6 py-2 text-sm disabled:opacity-50"
                  >
                    {saving === contact.id ? '⏳ Adding...' : '➕ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!searching && results.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to find contacts!</h3>
          <p className="text-white/60">Enter a search query above</p>
        </div>
      )}
    </div>
  )
}