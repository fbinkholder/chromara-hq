'use client'

import { useState } from 'react'

type Contact = { name: string; title: string; email: string; linkedin?: string; confidence?: number }

export default function ContactIntelPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    company: string | null
    domain: string | null
    contacts: Contact[]
    message?: string
  } | null>(null)

  const runFind = async () => {
    const d = domain.trim() || undefined
    if (!d) {
      alert('Enter a company name or domain (e.g. loreal.com)')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/scrape/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d, company: d }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)
      setResult({
        company: data.company ?? d,
        domain: data.domain ?? d,
        contacts: data.contacts ?? [],
        message: data.message,
      })
    } catch (e) {
      setResult({
        company: null,
        domain: null,
        contacts: [],
        message: String(e),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">👥 Contact Intelligence Finder</h1>
      <p className="text-white/60">Enter a company domain to find contacts. Add Firecrawl/Hunter API to enable.</p>

      <div className="glass-card p-6">
        <label className="block text-sm font-medium text-white mb-2">Company name or domain</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. loreal.com or L'Oréal"
            className="glass-input flex-1"
          />
          <button
            onClick={runFind}
            disabled={loading}
            className="glass-button px-6 py-2 disabled:opacity-50"
          >
            {loading ? 'Finding…' : '🔍 Find Contacts'}
          </button>
        </div>
        <p className="text-white/40 text-sm mt-2">
          Placeholder: returns 0 contacts until Firecrawl or Hunter.io is configured.
        </p>
      </div>

      {result && (
        <div className="glass-card p-6">
          {result.message && (
            <p className="text-white/60 text-sm mb-4">{result.message}</p>
          )}
          <h2 className="text-xl font-bold text-white mb-2">
            {result.company || result.domain || 'Results'}
          </h2>
          {result.contacts.length === 0 ? (
            <p className="text-white/50">No contacts returned. Add API keys for real data.</p>
          ) : (
            <div className="space-y-3">
              {result.contacts.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-white/60 text-sm">{c.title}</p>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-chromara-purple text-sm hover:underline">
                        {c.email}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.linkedin && (
                      <a
                        href={c.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/80 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {c.confidence != null && (
                      <span className="text-xs text-white/50">{(c.confidence * 100).toFixed(0)}%</span>
                    )}
                    <button
                      type="button"
                      className="text-xs glass-button px-2 py-1"
                    >
                      Add to Partnership Tracker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
