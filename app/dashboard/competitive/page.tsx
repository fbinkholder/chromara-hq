'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Insight = {
  id: string
  category: string
  title: string
  description: string | null
  source_url: string | null
  created_at: string
}

type Patent = {
  id: string
  company: string
  title: string
  description: string | null
  filing_date: string | null
  source_url: string | null
  created_at: string
}

export default function CompetitiveIntel() {
  const [loading, setLoading] = useState(true)
  const [agentFinds, setAgentFinds] = useState<Insight[]>([])
  const [trends, setTrends] = useState<Insight[]>([])
  const [news, setNews] = useState<Insight[]>([])
  const [patents, setPatents] = useState<Patent[]>([])
  const [editing, setEditing] = useState<'summary' | 'trend' | 'news' | null>(null)
  const [addForm, setAddForm] = useState<{ type: 'trend' | 'news'; title: string; description: string; source_url: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const since = sevenDaysAgo.toISOString()

      const { data: intelData } = await supabase
        .from('market_intelligence')
        .select('id, category, title, description, source_url, created_at')
        .eq('user_id', user.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      const { data: patentData } = await supabase
        .from('patent_filings')
        .select('id, company, title, description, filing_date, source_url, created_at')
        .eq('user_id', user.id)
        .order('filing_date', { ascending: false })
        .limit(5)

      const insights = (intelData || []) as Insight[]
      setAgentFinds(insights.slice(0, 5))
      setTrends(insights.filter((i) => /trend|industry/i.test(i.category)))
      setNews(insights.filter((i) => /news|competitor|insight/i.test(i.category)))
      setPatents((patentData || []) as Patent[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const addItem = async () => {
    if (!addForm || !addForm.title.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const category = addForm.type === 'trend' ? 'industry_trend' : 'competitor_insight'
      const { error } = await supabase.from('market_intelligence').insert({
        user_id: user.id,
        category,
        title: addForm.title.trim(),
        description: addForm.description.trim() || null,
        source_url: addForm.source_url.trim() || null,
        scraped_at: new Date().toISOString(),
      })
      if (error) throw error
      setAddForm(null)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('market_intelligence').delete().eq('id', id)
    loadData()
  }

  const isEmpty = !loading && agentFinds.length === 0 && trends.length === 0 && news.length === 0 && patents.length === 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Competitive Intelligence</h1>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : isEmpty ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No intel yet</h3>
          <p className="text-white/60 mb-6">Run your Market Intel agent or add items manually</p>
          <Link href="/dashboard/agents/market-intel">
            <button className="glass-button px-8 py-3">Go to Market Intel Agent</button>
          </Link>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => setAddForm({ type: 'trend', title: '', description: '', source_url: '' })} className="glass-button px-4 py-2">
              Add Trend
            </button>
            <button onClick={() => setAddForm({ type: 'news', title: '', description: '', source_url: '' })} className="glass-button px-4 py-2">
              Add News
            </button>
          </div>
        </div>
      ) : (
        <>
          {agentFinds.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Agent Finds of the Week</h2>
                <Link href="/dashboard/competitive-intel" className="text-chromara-purple hover:text-chromara-lilac text-sm">View all</Link>
              </div>
              <div className="space-y-3">
                {agentFinds.map((i) => (
                  <div key={i.id} className="p-4 bg-white/5 rounded-lg">
                    <p className="text-white/80 mb-2">{i.title}</p>
                    {i.description && <p className="text-white/60 text-sm line-clamp-2">{i.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-chromara-purple/20 text-chromara-lilac rounded-full">{i.category.replace(/_/g, ' ')}</span>
                      {i.source_url && (
                        <a href={i.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-chromara-purple hover:underline">Source</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Rising Trends</h2>
                <button onClick={() => setAddForm({ type: 'trend', title: '', description: '', source_url: '' })} className="text-chromara-purple hover:text-chromara-lilac text-sm">Add</button>
              </div>
              {trends.length === 0 ? (
                <p className="text-white/50">No trends yet. Add manually or run the agent.</p>
              ) : (
                <div className="space-y-3">
                  {trends.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg group">
                      <span className="text-white font-medium">{t.title}</span>
                      <button onClick={() => deleteItem(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">News Updates</h2>
                <button onClick={() => setAddForm({ type: 'news', title: '', description: '', source_url: '' })} className="text-chromara-purple hover:text-chromara-lilac text-sm">Add</button>
              </div>
              {news.length === 0 ? (
                <p className="text-white/50">No news yet. Add manually or run the agent.</p>
              ) : (
                <div className="space-y-3">
                  {news.map((n) => (
                    <div key={n.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-chromara-purple/30 group">
                      <h3 className="text-white font-medium mb-2">{n.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/60 justify-between">
                        {n.source_url && (
                          <a href={n.source_url} target="_blank" rel="noopener noreferrer" className="text-chromara-purple hover:underline">View Source</a>
                        )}
                        <button onClick={() => deleteItem(n.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {patents.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Recent Patents</h2>
                <Link href="/dashboard/competitive-intel" className="text-chromara-purple hover:text-chromara-lilac text-sm">View all</Link>
              </div>
              <div className="space-y-3">
                {patents.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-orange-500/50">
                    <h3 className="text-white font-medium mb-2">{p.title}</h3>
                    <p className="text-white/60 text-sm mb-1"><strong>Company:</strong> {p.company}</p>
                    {p.filing_date && <p className="text-xs text-white/40">Filed: {new Date(p.filing_date).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {addForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAddForm(null)}>
          <div className="glass-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Add {addForm.type === 'trend' ? 'Trend' : 'News'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/80 mb-1">Title *</label>
                <input value={addForm.title} onChange={(e) => setAddForm((f) => f ? { ...f, title: e.target.value } : null)} className="glass-input w-full" placeholder="e.g. Custom Beauty Devices" />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Description</label>
                <textarea value={addForm.description} onChange={(e) => setAddForm((f) => f ? { ...f, description: e.target.value } : null)} className="glass-input w-full min-h-[80px]" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Source URL</label>
                <input type="url" value={addForm.source_url} onChange={(e) => setAddForm((f) => f ? { ...f, source_url: e.target.value } : null)} className="glass-input w-full" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddForm(null)} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button>
              <button onClick={addItem} disabled={saving || !addForm.title.trim()} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
