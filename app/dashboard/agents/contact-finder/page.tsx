'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Contact = {
  name: string
  title: string
  company: string
  email: string
  linkedin_url: string
  phone?: string
}

export default function ContactFinderPage() {
  const [searchType, setSearchType] = useState<'company' | 'title'>('company')
  const [searchQuery, setSearchQuery] = useState('')
  const [titleQuery, setTitleQuery] = useState('VP')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState(false)

  const supabase = createClient()

  const searchContacts = async () => {
    setSearching(true)
    setResults([])

    try {
      // In production, this would call Apollo.io API
      // For now, simulate with demo data
      
      const demoResults: Contact[] = [
        {
          name: 'Sarah Johnson',
          title: 'VP of Innovation',
          company: searchQuery || 'L\'Oréal',
          email: 'sarah.johnson@example.com',
          linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        },
        {
          name: 'Michael Chen',
          title: 'Chief Innovation Officer',
          company: searchQuery || 'Estée Lauder',
          email: 'michael.chen@example.com',
          linkedin_url: 'https://linkedin.com/in/michaelchen',
        },
        {
          name: 'Emily Rodriguez',
          title: 'Director of Product Innovation',
          company: searchQuery || 'Shiseido',
          email: 'emily.rodriguez@example.com',
          linkedin_url: 'https://linkedin.com/in/emilyrodriguez',
        },
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setResults(demoResults)
    } catch (error) {
      console.error('Error searching contacts:', error)
      alert('Failed to search contacts')
    } finally {
      setSearching(false)
    }
  }

  const toggleContact = (index: number) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedContacts(newSelected)
  }

  const selectAll = () => {
    if (selectedContacts.size === results.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(results.map((_, i) => i)))
    }
  }

  const addToPartnershipTracker = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact')
      return
    }

    setAdding(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const contactsToAdd = Array.from(selectedContacts).map(index => {
        const contact = results[index]
        return {
          user_id: user?.id,
          company: contact.company,
          contact_name: contact.name,
          title: contact.title,
          email: contact.email,
          linkedin_url: contact.linkedin_url,
          priority: 'medium',
          segment: 'Fortune 500', // Can be customized
          status: 'not_contacted',
          response_received: false,
        }
      })

      const { error } = await supabase
        .from('outreach_contacts')
        .insert(contactsToAdd)

      if (error) throw error

      alert(`Successfully added ${selectedContacts.size} contact(s) to Partnership Tracker!`)
      setSelectedContacts(new Set())
      
      // Optionally redirect to partnerships page
      // window.location.href = '/dashboard/partnerships'
    } catch (error) {
      console.error('Error adding contacts:', error)
      alert('Failed to add contacts to tracker')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contact Finder 🔍</h1>
          <p className="text-white/60 mt-1">Search Apollo.io and add contacts to your tracker</p>
        </div>
        <a
          href="/dashboard/agents"
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          ← Back to Agent
        </a>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Search Parameters</h3>
        
        <div className="space-y-4">
          {/* Search Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Search By</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSearchType('company')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  searchType === 'company'
                    ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Company Name
              </button>
              <button
                onClick={() => setSearchType('title')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  searchType === 'title'
                    ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Job Title
              </button>
            </div>
          </div>

          {/* Search Inputs */}
          {searchType === 'company' ? (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Company Name</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., L'Oréal, Estée Lauder, Shiseido"
                className="glass-input w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Job Title Keywords</label>
                <input
                  type="text"
                  value={titleQuery}
                  onChange={(e) => setTitleQuery(e.target.value)}
                  placeholder="e.g., VP, Chief Innovation Officer, Director"
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Industry (Optional)</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Beauty, Cosmetics"
                  className="glass-input w-full"
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={searchContacts}
            disabled={searching || (!searchQuery && searchType === 'company')}
            className="glass-button w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? '🔍 Searching Apollo.io...' : '🔍 Search Contacts'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              Found {results.length} contacts • {selectedContacts.size} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
              >
                {selectedContacts.size === results.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={addToPartnershipTracker}
                disabled={selectedContacts.size === 0 || adding}
                className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : `➕ Add ${selectedContacts.size || ''} to Tracker`}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((contact, index) => (
              <ContactCard
                key={index}
                contact={contact}
                selected={selectedContacts.has(index)}
                onToggle={() => toggleContact(index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No results yet</h3>
          <p className="text-white/60">Search for contacts using Apollo.io</p>
        </div>
      )}

      {/* Searching State */}
      {searching && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Searching Apollo.io...</h3>
          <p className="text-white/60">Finding contacts matching your criteria</p>
        </div>
      )}

      {/* Info */}
      <div className="glass-card p-4 bg-blue-500/10 border border-blue-500/20">
        <p className="text-sm text-white/80">
          💡 <strong>Demo Mode:</strong> This is showing demo data. In production, this will search your Apollo.io account using the API key you provided. Contacts will be automatically enriched with email, LinkedIn, and title information.
        </p>
      </div>
    </div>
  )
}

function ContactCard({ contact, selected, onToggle }: {
  contact: Contact
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div 
      onClick={onToggle}
      className={`glass-card p-5 cursor-pointer transition-all ${
        selected ? 'bg-chromara-purple/20 border-2 border-chromara-purple' : 'hover:bg-white/15'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          selected 
            ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink border-transparent' 
            : 'border-white/40'
        }`}>
          {selected && <span className="text-white text-sm">✓</span>}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
              <p className="text-sm text-white/80">{contact.title}</p>
              <p className="text-sm text-white/60">{contact.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-chromara-pink hover:underline"
            >
              📧 {contact.email}
            </a>
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-400 hover:underline"
            >
              🔗 LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
