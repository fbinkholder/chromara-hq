'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Insight = {
  id: string
  category: string
  title: string
  description: string | null
  source_url: string | null
  relevance_score: number | null
  scraped_at: string
}

const CATEGORIES = [
  { id: 'seo_keyword', label: '🔍 SEO Keywords', api: '/api/scrape/seo' },
  { id: 'competitor_insight', label: '🏢 Competitors', api: '/api/scrape/competitors' },
  { id: 'industry_trend', label: '📈 Trends', api: '/api/scrape/trends' },
  { id: 'consumer_insight', label: '👥 Consumer Insights', api: '/api/scrape/consumer' },
]

export default function MarketIntelPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  const loadInsights = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('market_intelligence')
        .select('id, category, title, description, source_url, relevance_score, scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setInsights((data as Insight[]) || [])
    } catch (e) {
      console.error(e)
      setInsights([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInsights()
  }, [])

  const runScrape = async (api: string, label: string) => {
    setRunning(api)
    try {
      const res = await fetch(api, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)
      alert(data.message || 'Done.')
      loadInsights()
    } catch (e) {
      alert(String(e))
    } finally {
      setRunning(null)
    }
  }

  const deleteInsight = async (id: string) => {
    if (!confirm('Remove this insight?')) return
    try {
      await supabase.from('market_intelligence').delete().eq('id', id)
      loadInsights()
    } catch (e) {
      alert(String(e))
    }
  }

  const filtered = filter === 'all'
    ? insights
    : insights.filter((i) => i.category === filter)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🔍 Market Intelligence</h1>
      <p className="text-white/60">Run scrapes manually. Results feed Competitive Intel.</p>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Run scrapes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => runScrape(c.api, c.label)}
              disabled={running !== null}
              className="glass-button px-4 py-3 text-left disabled:opacity-50 flex items-center justify-between"
            >
              <span>{c.label}</span>
              {running === c.api ? (
                <span className="text-white/60 text-sm">Running…</span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="text-white/40 text-sm mt-3">
          <strong>Competitors</strong> uses Firecrawl — add <code className="bg-black/30 px-1 rounded">FIRECRAWL_API_KEY</code> to <code className="bg-black/30 px-1 rounded">.env.local</code> (and Vercel env if deployed). SEO, Trends, and Consumer are placeholders until other APIs are added.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Results</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="glass-input"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/50">No insights yet. Run a scrape (APIs will return 0 until keys are set).</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filtered.map((i) => (
              <div
                key={i.id}
                className="p-4 bg-white/5 rounded-lg border border-white/10 flex justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium">{i.title}</p>
                  {i.description && (
                    <p className="text-white/60 text-sm mt-1">{i.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-chromara-purple/30 text-white">
                      {i.category}
                    </span>
                    {i.relevance_score != null && (
                      <span className="text-xs text-white/50">Score: {i.relevance_score}</span>
                    )}
                  </div>
                  {i.source_url && (
                    <a
                      href={i.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-chromara-purple hover:underline mt-1 inline-block"
                    >
                      Source
                    </a>
                  )}
                </div>
                <button
                  onClick={() => deleteInsight(i.id)}
                  className="text-red-400 hover:text-red-300 text-sm shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
