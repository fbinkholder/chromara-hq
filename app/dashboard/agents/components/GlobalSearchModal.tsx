'use client'

import { useState } from 'react'

type SearchResult = {
  type: 'contact' | 'email' | 'campaign' | 'activity' | 'memory'
  title: string
  subtitle: string
  preview?: string
  url?: string
  date?: string
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    // Demo search results - in production, this would query Supabase
    const demoResults: SearchResult[] = [
      {
        type: 'contact',
        title: 'Sarah Johnson',
        subtitle: "VP of Innovation @ L'Oréal",
        preview: 'sarah.johnson@loreal.com',
        url: '/dashboard/partnerships',
        date: '2 hours ago',
      },
      {
        type: 'email',
        title: "L'Oréal x Chromara: The Future of Foundation",
        subtitle: 'Email sent to Sarah Johnson',
        preview: "Hi Sarah, I'm Faith, founder of Chromara...",
        url: '/dashboard/agents/queue',
        date: '2 hours ago',
      },
      {
        type: 'campaign',
        title: 'Fortune 500 Beauty Brands',
        subtitle: '25 sent • 7 responded',
        preview: 'Strategic partnership outreach campaign',
        url: '/dashboard/agents/analytics',
        date: 'Active',
      },
      {
        type: 'activity',
        title: 'Meeting booked',
        subtitle: "Sarah Johnson (L'Oréal)",
        preview: '15-minute intro call scheduled for tomorrow',
        date: '3 hours ago',
      },
      {
        type: 'memory',
        title: 'L\'Oréal Partnership Notes',
        subtitle: 'Personal Workspace',
        preview: 'Discussed NovaMirror technology and potential pilot program...',
        url: '/dashboard/personal',
        date: 'Yesterday',
      },
    ]

    // Filter results based on query (case insensitive)
    const filtered = demoResults.filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(filtered)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20">
      <div className="glass-card max-w-3xl w-full max-h-[600px] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search contacts, emails, campaigns, memory..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto max-h-[500px] p-4">
          {query && results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-white/60">No results found for "{query}"</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result, index) => (
                <SearchResultCard key={index} result={result} onClick={onClose} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💡</div>
              <p className="text-white mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['L\'Oréal', 'Sarah Johnson', 'Fortune 500', 'partnership', 'follow-up'].map(term => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {query && (
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>💡 Tip:</span>
              <span>Press ↑↓ to navigate, Enter to open, Esc to close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchResultCard({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  const typeIcons = {
    contact: '👤',
    email: '📧',
    campaign: '📊',
    activity: '⚡',
    memory: '📝',
  }

  const typeColors = {
    contact: 'bg-blue-500/20 text-blue-300',
    email: 'bg-purple-500/20 text-purple-300',
    campaign: 'bg-green-500/20 text-green-300',
    activity: 'bg-yellow-500/20 text-yellow-300',
    memory: 'bg-pink-500/20 text-pink-300',
  }

  const handleClick = () => {
    if (result.url) {
      window.location.href = result.url
    }
    onClick()
  }

  return (
    <div
      onClick={handleClick}
      className={`p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all ${result.url ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeIcons[result.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold truncate">{result.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[result.type]}`}>
              {result.type}
            </span>
          </div>
          <p className="text-sm text-white/60 mb-1">{result.subtitle}</p>
          {result.preview && (
            <p className="text-xs text-white/40 line-clamp-1">{result.preview}</p>
          )}
        </div>
        {result.date && (
          <span className="text-xs text-white/40 flex-shrink-0">{result.date}</span>
        )}
      </div>
    </div>
  )
}
