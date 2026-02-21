'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type ScrapeRun = {
  id: string
  agent_name: string
  status: string
  started_at: string
  completed_at: string | null
  results_summary: { count?: number; message?: string } | null
  error_message: string | null
}

export default function ScrapeHistoryPage() {
  const [runs, setRuns] = useState<ScrapeRun[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  const loadRuns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('agent_activity')
        .select('id, agent_name, status, started_at, completed_at, results_summary, error_message')
        .in('agent_name', [
          'Market Intel: SEO Keywords',
          'Market Intel: Competitors',
          'Market Intel: Trends',
          'Market Intel: Consumer Insights',
        ])
        .order('started_at', { ascending: false })
        .limit(100)
      if (error) throw error
      setRuns((data as ScrapeRun[]) || [])
    } catch (e) {
      console.error(e)
      setRuns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRuns()
  }, [])

  const filtered = filter === 'all'
    ? runs
    : runs.filter((r) => r.agent_name.toLowerCase().includes(filter.toLowerCase()))

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-300',
      running: 'bg-amber-500/20 text-amber-300',
      failed: 'bg-red-500/20 text-red-300',
      stopped: 'bg-gray-500/20 text-gray-400',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-white/10 text-white/70'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">📋 Scrape History</h1>
        <p className="text-white/60 mt-2">Log of all Market Intelligence scrape runs</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="glass-input"
        >
          <option value="all">All scrapes</option>
          <option value="seo">SEO Keywords</option>
          <option value="competitor">Competitors</option>
          <option value="trend">Trends</option>
          <option value="consumer">Consumer Insights</option>
        </select>
        <Link
          href="/dashboard/agents/market-intel"
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
        >
          Run scrapes →
        </Link>
        <button
          onClick={loadRuns}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm disabled:opacity-50 transition-all"
        >
          {loading ? 'Loading…' : '🔄 Refresh'}
        </button>
      </div>

      {loading ? (
        <p className="text-white/50 py-8">Loading scrape history…</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-violet-500/30">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">No scrape runs yet</h3>
          <p className="text-white/60 mb-6">Run Market Intelligence scrapes to see them logged here</p>
          <Link href="/dashboard/agents/market-intel">
            <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-semibold hover:scale-105 transition-all">
              Go to Market Intel
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((run) => (
            <div
              key={run.id}
              className="glass-card p-5 rounded-xl border border-white/10 hover:border-violet-500/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{run.agent_name}</span>
                  {statusBadge(run.status)}
                  <span className="text-sm text-white/50">
                    {new Date(run.started_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-white/70">
                  {run.results_summary?.message || run.error_message || '—'}
                </div>
              </div>
              {run.completed_at && run.status === 'completed' && run.results_summary?.count != null && (
                <p className="text-xs text-green-400/80 mt-2">
                  Saved {run.results_summary.count} item(s) to Competitive Intel
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
