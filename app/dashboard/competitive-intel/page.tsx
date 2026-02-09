'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'competitors' | 'patents' | 'trends' | 'all'

type Insight = {
  id: string
  category: string
  title: string
  description: string | null
  source_url: string | null
  scraped_at: string
  created_at: string
}

type Patent = {
  id: string
  company: string
  patent_number: string | null
  title: string
  filing_date: string | null
  source_url: string | null
  created_at: string
}

export default function CompetitiveIntelDashboardPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [insights, setInsights] = useState<Insight[]>([])
  const [patents, setPatents] = useState<Patent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [intelRes, patentRes] = await Promise.all([
          supabase
            .from('market_intelligence')
            .select('id, category, title, description, source_url, scraped_at, created_at')
            .in('category', ['competitor_insight', 'industry_trend', 'seo_keyword', 'consumer_insight'])
            .order('scraped_at', { ascending: false })
            .limit(30),
          supabase
            .from('patent_filings')
            .select('id, company, patent_number, title, filing_date, source_url, created_at')
            .order('filing_date', { ascending: false, nullsFirst: false })
            .limit(20),
        ])
        setInsights((intelRes.data as Insight[]) || [])
        setPatents((patentRes.data as Patent[]) || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredInsights =
    tab === 'all'
      ? insights
      : tab === 'competitors'
        ? insights.filter((i) => i.category === 'competitor_insight')
        : tab === 'trends'
          ? insights.filter((i) => i.category === 'industry_trend')
          : insights

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'patents', label: 'Patents' },
    { id: 'trends', label: 'Trends' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Competitive Intel</h1>
      <p className="text-white/60">
        Auto-populated from Market Intelligence and Patent Tracker agents.
      </p>

      <div className="flex gap-2 border-b border-white/20 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : (
        <>
          {(tab === 'all' || tab === 'competitors' || tab === 'trends') && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Insights</h2>
              {filteredInsights.length === 0 ? (
                <p className="text-white/50">No insights yet. Run Market Intelligence agents to populate.</p>
              ) : (
                <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                  {filteredInsights.map((i) => (
                    <div
                      key={i.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <p className="text-white font-medium">{i.title}</p>
                      {i.description && (
                        <p className="text-white/60 text-sm mt-1">{i.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-chromara-purple/30 text-white">
                          {i.category}
                        </span>
                        {i.source_url && (
                          <a
                            href={i.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-chromara-purple hover:underline"
                          >
                            Source
                          </a>
                        )}
                        <span className="text-xs text-white/40">
                          {i.scraped_at
                            ? new Date(i.scraped_at).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(tab === 'all' || tab === 'patents') && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Patents & Filings</h2>
              {patents.length === 0 ? (
                <p className="text-white/50">No patent data yet. Run Patent Tracker to populate.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="py-2 pr-4 text-white font-medium">Company</th>
                        <th className="py-2 pr-4 text-white font-medium">Title</th>
                        <th className="py-2 pr-4 text-white font-medium">Filing date</th>
                        <th className="py-2 text-white font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patents.map((f) => (
                        <tr key={f.id} className="border-b border-white/10">
                          <td className="py-2 pr-4 text-white">{f.company}</td>
                          <td className="py-2 pr-4 text-white/80">{f.title}</td>
                          <td className="py-2 pr-4 text-white/60">{f.filing_date || '—'}</td>
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
          )}
        </>
      )}
    </div>
  )
}
