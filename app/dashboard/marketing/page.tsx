'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Campaign = { id: string; name: string; status: string; target_metrics: Record<string, number> | null; actual_metrics: Record<string, number> | null }
type CalendarItem = { id: string; title: string; platform: string | null; scheduled_date: string | null; scheduled_time: string | null }

export default function MarketingDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    contentPieces: 0,
    totalReach: 0,
    activeCampaigns: 0,
    ambassadors: 0,
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [weekContent, setWeekContent] = useState<CalendarItem[]>([])
  const [quickStats, setQuickStats] = useState({
    engagementRate: '',
    newsletterSubscribers: '',
    betaApplications: '',
  })
  const [editingQuickStats, setEditingQuickStats] = useState(false)
  const [savingQuickStats, setSavingQuickStats] = useState(false)
  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().slice(0, 10)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)
      const weekEndStr = weekEnd.toISOString().slice(0, 10)

      const [
        contentRes,
        campaignsRes,
        ambassadorsRes,
        calendarRes,
        kpisRes,
      ] = await Promise.all([
        supabase.from('content_calendar').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('campaigns').select('id, name, status, target_metrics, actual_metrics').eq('user_id', user.id),
        supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('content_calendar').select('id, title, platform, scheduled_date, scheduled_time').eq('user_id', user.id).not('scheduled_date', 'is', null).gte('scheduled_date', today).lte('scheduled_date', weekEndStr).order('scheduled_date', { ascending: true }).limit(10),
        supabase.from('kpis').select('metric_name, current_value').eq('user_id', user.id),
      ])

      const campaignsData = (campaignsRes.data || []) as Campaign[]
      const activeCount = campaignsData.filter((c) => c.status === 'active').length

      setStats({
        contentPieces: contentRes.count ?? 0,
        totalReach: 0,
        activeCampaigns: activeCount,
        ambassadors: ambassadorsRes.count ?? 0,
      })
      setCampaigns(campaignsData)
      setWeekContent((calendarRes.data || []) as CalendarItem[])

      const kpis = (kpisRes.data || []) as { metric_name: string; current_value: number }[]
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '_')
      const getKpi = (name: string) => kpis.find((k) => norm(k.metric_name) === norm(name))?.current_value ?? 0
      setQuickStats({
        engagementRate: getKpi('engagement_rate') ? String(getKpi('engagement_rate')) : '',
        newsletterSubscribers: getKpi('newsletter_subscribers') ? String(getKpi('newsletter_subscribers')) : '',
        betaApplications: getKpi('beta_applications') ? String(getKpi('beta_applications')) : '',
      })

      const reachKpi = kpis.find((k) => /reach|total_reach/i.test(k.metric_name))
      if (reachKpi) setStats((s) => ({ ...s, totalReach: Number(reachKpi.current_value) }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const saveQuickStats = async () => {
    setSavingQuickStats(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const toSave = [
        { metric_name: 'engagement_rate', current_value: parseFloat(quickStats.engagementRate) || 0, unit: 'percentage' },
        { metric_name: 'newsletter_subscribers', current_value: parseInt(quickStats.newsletterSubscribers, 10) || 0, unit: 'count' },
        { metric_name: 'beta_applications', current_value: parseInt(quickStats.betaApplications, 10) || 0, unit: 'count' },
      ]

      for (const k of toSave) {
        const { data: rows } = await supabase.from('kpis').select('id').eq('user_id', user.id).ilike('metric_name', k.metric_name).limit(1)
        const existing = rows?.[0]
        const payload = {
          user_id: user.id,
          metric_name: k.metric_name,
          current_value: k.current_value,
          unit: k.unit,
          tracked_date: new Date().toISOString().slice(0, 10),
        }
        if (existing) {
          await supabase.from('kpis').update(payload).eq('id', existing.id)
        } else {
          await supabase.from('kpis').insert(payload)
        }
        try {
          await supabase.from('kpi_snapshots').insert({
            user_id: user.id,
            metric_name: k.metric_name,
            value: k.current_value,
            snapshot_date: payload.tracked_date,
          })
        } catch (_) {
          // kpi_snapshots may not exist yet
        }
      }
      setEditingQuickStats(false)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingQuickStats(false)
    }
  }

  const formatDate = (d: string | null, t: string | null) => {
    if (!d) return '—'
    const date = new Date(d)
    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
    if (t) return `${day} ${t.slice(0, 5)}`
    return day
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Marketing Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Content Pieces" value={loading ? '—' : String(stats.contentPieces)} icon="📝" href="/dashboard/content/calendar" />
        <StatCard label="Total Reach" value={loading ? '—' : stats.totalReach === 0 ? '0' : stats.totalReach >= 1000 ? `${(stats.totalReach / 1000).toFixed(1)}K` : String(stats.totalReach)} icon="👥" />
        <StatCard label="Active Campaigns" value={loading ? '—' : String(stats.activeCampaigns)} icon="🎯" href="/dashboard/campaigns" />
        <StatCard label="Ambassadors" value={loading ? '—' : String(stats.ambassadors)} icon="⭐" href="/dashboard/ambassadors" />
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Active Campaigns</h2>
          <Link href="/dashboard/campaigns" className="text-chromara-purple hover:text-chromara-lilac text-sm">View all</Link>
        </div>
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-white/50">No campaigns. <Link href="/dashboard/campaigns" className="text-chromara-purple hover:underline">Add one</Link></p>
        ) : (
          <div className="space-y-3">
            {campaigns.filter((c) => c.status === 'active' || c.status === 'planning').map((c) => {
              const target = c.target_metrics || {}
              const actual = c.actual_metrics || {}
              const keys = Object.keys(target)
              const progress = keys.length ? Math.round((keys.reduce((sum, k) => sum + (actual[k] ?? 0), 0) / keys.reduce((sum, k) => sum + (target[k] ?? 1), 0)) * 100) : 0
              const reach = actual.reach ?? actual.monthly_reach ?? 0
              return (
                <div key={c.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{c.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/60 mb-2">
                    <span>Reach: {reach}</span>
                    <span>Progress: {Math.min(100, progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-chromara-purple to-chromara-pink" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">This Week&apos;s Content</h2>
            <Link href="/dashboard/content/calendar" className="text-chromara-purple hover:text-chromara-lilac text-sm">View calendar</Link>
          </div>
          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : weekContent.length === 0 ? (
            <p className="text-white/50">Nothing scheduled this week. <Link href="/dashboard/content/calendar" className="text-chromara-purple hover:underline">Schedule content</Link></p>
          ) : (
            <div className="space-y-2">
              {weekContent.map((item) => (
                <Link key={item.id} href="/dashboard/content/calendar" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                  <span className="text-xl">{item.platform === 'tiktok' ? '📱' : item.platform === 'instagram' ? '📸' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.title}</p>
                    <p className="text-xs text-white/60">{item.platform || '—'} • {formatDate(item.scheduled_date, item.scheduled_time)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Quick Stats</h2>
            {!editingQuickStats ? (
              <button onClick={() => setEditingQuickStats(true)} className="text-chromara-purple hover:text-chromara-lilac text-sm">Edit</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveQuickStats} disabled={savingQuickStats} className="text-chromara-purple hover:text-chromara-lilac text-sm disabled:opacity-50">Save</button>
                <button onClick={() => setEditingQuickStats(false)} className="text-white/60 hover:text-white text-sm">Cancel</button>
              </div>
            )}
          </div>
          {editingQuickStats ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Engagement Rate (%)</label>
                <input type="number" step="0.1" value={quickStats.engagementRate} onChange={(e) => setQuickStats((s) => ({ ...s, engagementRate: e.target.value }))} className="glass-input w-full" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Newsletter Subscribers</label>
                <input type="number" value={quickStats.newsletterSubscribers} onChange={(e) => setQuickStats((s) => ({ ...s, newsletterSubscribers: e.target.value }))} className="glass-input w-full" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Beta Applications</label>
                <input type="number" value={quickStats.betaApplications} onChange={(e) => setQuickStats((s) => ({ ...s, betaApplications: e.target.value }))} className="glass-input w-full" placeholder="0" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Engagement Rate</span>
                <span className="text-white font-bold">{quickStats.engagementRate || '0'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Newsletter Subscribers</span>
                <span className="text-white font-bold">{quickStats.newsletterSubscribers || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Beta Applications</span>
                <span className="text-white font-bold">{quickStats.betaApplications || '0'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, href }: { label: string; value: string; icon: string; href?: string }) {
  const card = (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
  if (href) return <Link href={href}>{card}</Link>
  return card
}
