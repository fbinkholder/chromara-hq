'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Filing = {
  id: string
  company: string
  patent_number: string | null
  title: string
  filing_date: string | null
  status: string | null
  category: string | null
  source_url: string | null
  created_at: string
}

const WATCHLIST = ["L'Oréal", 'Estée Lauder', 'Shiseido', 'Coty', 'Unilever', 'Beiersdorf']

export default function PatentTrackerPage() {
  const [filings, setFilings] = useState<Filing[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const supabase = createClient()

  const loadFilings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('patent_filings')
        .select('id, company, patent_number, title, filing_date, status, category, source_url, created_at')
        .order('filing_date', { ascending: false, nullsFirst: false })
        .limit(50)
      if (error) throw error
      setFilings((data as Filing[]) || [])
    } catch (e) {
      console.error(e)
      setFilings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilings()
  }, [])

  const runCheck = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/scrape/uspto', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)
      alert(data.message || 'Done.')
      loadFilings()
    } catch (e) {
      alert(String(e))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">📄 USPTO & Product Tracker</h1>
      <p className="text-white/60">Check competitor patent filings. Add USPTO API to enable.</p>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-2">Company watchlist</h2>
        <p className="text-white/60 text-sm mb-4">
          {WATCHLIST.join(', ')}
        </p>
        <button
          onClick={runCheck}
          disabled={running}
          className="glass-button px-6 py-3 disabled:opacity-50"
        >
          {running ? 'Checking…' : '🔍 Check USPTO Filings'}
        </button>
        <p className="text-white/40 text-sm mt-3">
          Placeholder: no USPTO API key yet. When ready, add your USPTO API and we’ll search by company + beauty keywords.
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Results</h2>
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : filings.length === 0 ? (
          <p className="text-white/50">No filings yet. Run the check once USPTO API is configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-2 pr-4 text-white font-medium">Company</th>
                  <th className="py-2 pr-4 text-white font-medium">Patent / TM</th>
                  <th className="py-2 pr-4 text-white font-medium">Title</th>
                  <th className="py-2 pr-4 text-white font-medium">Filing date</th>
                  <th className="py-2 pr-4 text-white font-medium">Status</th>
                  <th className="py-2 text-white font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((f) => (
                  <tr key={f.id} className="border-b border-white/10">
                    <td className="py-2 pr-4 text-white">{f.company}</td>
                    <td className="py-2 pr-4 text-white/80">{f.patent_number || '—'}</td>
                    <td className="py-2 pr-4 text-white/80">{f.title}</td>
                    <td className="py-2 pr-4 text-white/60">{f.filing_date || '—'}</td>
                    <td className="py-2 pr-4 text-white/60">{f.status || '—'}</td>
                    <td className="py-2">
                      {f.source_url ? (
                        <a
                          href={f.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-chromara-purple hover:underline text-sm"
                        >
                          USPTO
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
