'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Tab = 'all' | 'competitors' | 'trends' | 'patents'

type Insight = {
  id: string
  category: string
  title: string
  description: string | null
  source_url: string | null
  relevance_score: number | null
  scraped_at: string
  created_at: string
}

type Patent = {
  id: string
  company: string
  patent_number: string | null
  title: string
  description: string | null
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

  const loadData = async () => {
    setLoading(true)
    try {
      let insightQuery = supabase
        .from('market_intelligence')
        .select('id, category, title, description, source_url, relevance_score, scraped_at, created_at')
        .order('created_at', { ascending: false })

      if (tab === 'competitors') {
        insightQuery = insightQuery.eq('category', 'competitor_insight')
      } else if (tab === 'trends') {
        insightQuery = insightQuery.eq('category', 'industry_trend')
      }

      const { data: insightsData } = await insightQuery
      setInsights((insightsData as Insight[]) || [])

      if (tab === 'all' || tab === 'patents') {
        const { data: patentsData } = await supabase
          .from('patent_filings')
          .select('id, company, patent_number, title, description, filing_date, source_url, created_at')
          .order('filing_date', { ascending: false })
        setPatents((patentsData as Patent[]) || [])
      } else {
        setPatents([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab])

  const deleteInsight = async (id: string) => {
    if (!confirm('Delete this insight?')) return
    await supabase.from('market_intelligence').delete().eq('id', id)
    loadData()
  }

  const showInsights = tab === 'all' || tab === 'competitors' || tab === 'trends'
  const showPatents = tab === 'all' || tab === 'patents'
  const isEmpty = !loading && (insights.length === 0 && patents.length === 0)

  const tabClasses = (active: boolean) =>
    active
      ? 'px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white border border-violet-400/50'
      : 'px-4 py-2 rounded-xl font-medium bg-white/10 text-white/80 hover:bg-white/20 border border-transparent'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-lilac-400 bg-clip-text text-transparent">
          Competitive Intelligence
        </h1>
        <p className="text-white/60 mt-2">Insights gathered by your agents</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('all')} className={tabClasses(tab === 'all')}>
          All
        </button>
        <button onClick={() => setTab('competitors')} className={tabClasses(tab === 'competitors')}>
          Competitors
        </button>
        <button onClick={() => setTab('trends')} className={tabClasses(tab === 'trends')}>
          Trends
        </button>
        <button onClick={() => setTab('patents')} className={tabClasses(tab === 'patents')}>
          Patents
        </button>
      </div>

      {isEmpty && (
        <div className="rounded-2xl border border-violet-500/30 bg-white/5 backdrop-blur-sm p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No insights yet</h3>
          <p className="text-white/60 mb-6">Run your Market Intelligence agent to gather data</p>
          <Link href="/dashboard/agents/market-intel">
            <button className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all">
              Go to Market Intel Agent
            </button>
          </Link>
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showInsights &&
            insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-2xl border border-violet-500/30 bg-white/5 backdrop-blur-sm p-6 hover:border-violet-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-semibold">
                    {(insight.category || '').replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => deleteInsight(insight.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all text-sm"
                    aria-label="Delete insight"
                  >
                    🗑️
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-3">{insight.description || '—'}</p>
                {insight.source_url && (
                  <a
                    href={insight.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 text-sm hover:underline"
                  >
                    View Source →
                  </a>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-white/40">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                  {insight.relevance_score != null && (
                    <span className="text-xs text-white/60">Relevance: {insight.relevance_score}/10</span>
                  )}
                </div>
              </div>
            ))}

          {showPatents &&
            patents.map((patent) => (
              <div
                key={patent.id}
                className="rounded-2xl border border-white/10 border-l-4 border-l-orange-500 bg-white/5 backdrop-blur-sm p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold">
                    PATENT
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{patent.title}</h3>
                <p className="text-white/70 text-sm mb-2">
                  <strong>Company:</strong> {patent.company}
                </p>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{patent.description || '—'}</p>
                {patent.source_url && (
                  <a
                    href={patent.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 text-sm hover:underline"
                  >
                    View USPTO Filing →
                  </a>
                )}
                <div className="text-xs text-white/40 mt-4">
                  Filed: {patent.filing_date ? new Date(patent.filing_date).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
        </div>
      )}

      {loading && (
        <p className="text-white/50 text-center py-8">Loading…</p>
      )}
    </div>
  )
}
