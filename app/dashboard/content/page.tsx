'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type CalendarItem = {
  id: string
  title: string
  platform: string | null
  scheduled_date: string | null
  scheduled_time: string | null
}

type PerformanceMetric = {
  label: string
  key: string
  format: 'number' | 'percentage'
}

const SNAPSHOT_METRICS: PerformanceMetric[] = [
  { label: 'Total Views', key: 'total_views', format: 'number' },
  { label: 'Engagement', key: 'engagement', format: 'percentage' },
  { label: 'Followers', key: 'followers', format: 'number' },
  { label: 'Shares', key: 'shares', format: 'number' },
]

type TopPerformer = { id: string; title: string; views: string; engagement: string }
const TOP_PERFORMERS_KEY = 'chromara-top-performers'

export default function ContentSocial() {
  const [loading, setLoading] = useState(true)
  const [weekSchedule, setWeekSchedule] = useState<CalendarItem[]>([])
  const [snapshotValues, setSnapshotValues] = useState<Record<string, string>>({})
  const [editingSnapshot, setEditingSnapshot] = useState(false)
  const [savingSnapshot, setSavingSnapshot] = useState(false)
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [editingPerformers, setEditingPerformers] = useState(false)
  const [newPerformer, setNewPerformer] = useState({ title: '', views: '', engagement: '' })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(TOP_PERFORMERS_KEY) : null
    if (raw) {
      try {
        setTopPerformers(JSON.parse(raw))
      } catch (_) {}
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() + 7)
      const weekEndStr = weekEnd.toISOString().slice(0, 10)

      const [calendarRes, kpisRes] = await Promise.all([
        supabase
          .from('content_calendar')
          .select('id, title, platform, scheduled_date, scheduled_time')
          .eq('user_id', user.id)
          .not('scheduled_date', 'is', null)
          .gte('scheduled_date', today)
          .lte('scheduled_date', weekEndStr)
          .order('scheduled_date', { ascending: true })
          .limit(10),
        supabase.from('kpis').select('metric_name, current_value').eq('user_id', user.id),
      ])

      setWeekSchedule((calendarRes.data as CalendarItem[]) || [])

      const kpis = (kpisRes.data || []) as { metric_name: string; current_value: number }[]
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '_')
      const vals: Record<string, string> = {}
      for (const m of SNAPSHOT_METRICS) {
        const k = kpis.find((k) => norm(k.metric_name) === m.key)
        vals[m.key] = k != null ? String(k.current_value) : ''
      }
      setSnapshotValues(vals)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveSnapshot = async () => {
    setSavingSnapshot(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().slice(0, 10)
      for (const m of SNAPSHOT_METRICS) {
        const val = parseFloat(snapshotValues[m.key] || '0') || 0
        const { data: rows } = await supabase
          .from('kpis')
          .select('id')
          .eq('user_id', user.id)
          .ilike('metric_name', m.key)
          .limit(1)
        const payload = {
          user_id: user.id,
          metric_name: m.key,
          current_value: val,
          unit: m.format === 'percentage' ? 'percentage' : 'count',
          tracked_date: today,
        }
        if (rows?.[0]) {
          await supabase.from('kpis').update(payload).eq('id', rows[0].id)
        } else {
          await supabase.from('kpis').insert(payload)
        }
        try {
          await supabase.from('kpi_snapshots').insert({
            user_id: user.id,
            metric_name: m.key,
            value: val,
            snapshot_date: today,
          })
        } catch (_) {}
      }
      setEditingSnapshot(false)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingSnapshot(false)
    }
  }

  const saveTopPerformers = (list: TopPerformer[]) => {
    setTopPerformers(list)
    if (typeof window !== 'undefined') localStorage.setItem(TOP_PERFORMERS_KEY, JSON.stringify(list))
  }

  const addPerformer = () => {
    const t = newPerformer.title.trim()
    if (!t) return
    saveTopPerformers([...topPerformers, { id: Date.now().toString(), title: t, views: newPerformer.views || '0', engagement: newPerformer.engagement || '0%' }])
    setNewPerformer({ title: '', views: '', engagement: '' })
  }

  const removePerformer = (id: string) => {
    saveTopPerformers(topPerformers.filter((p) => p.id !== id))
  }

  const formatValue = (val: string, fmt: 'number' | 'percentage') => {
    const n = parseFloat(val)
    if (isNaN(n)) return val
    if (fmt === 'percentage') return `${n}%`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
  }

  const formatDate = (d: string | null, t: string | null) => {
    if (!d) return '—'
    const date = new Date(d)
    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)
    if (d === today) return t ? `Today ${t.slice(0, 5)}` : 'Today'
    if (d === tomorrowStr) return t ? `Tomorrow ${t.slice(0, 5)}` : 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + (t ? ` ${t.slice(0, 5)}` : '')
  }

  const platformIcon = (p: string | null) => {
    const v = (p || '').toLowerCase()
    if (v === 'tiktok') return '📱'
    if (v === 'instagram') return '📸'
    if (v === 'linkedin') return '💼'
    if (v === 'twitter') return '🐦'
    return '📝'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">📱 Content & Social</h1>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">📅 This Week&apos;s Schedule</h2>
          <Link href="/dashboard/content/calendar" className="text-chromara-purple hover:text-chromara-pink text-sm underline">Add content</Link>
        </div>
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : weekSchedule.length === 0 ? (
          <p className="text-white/50">Nothing scheduled this week. <Link href="/dashboard/content/calendar" className="text-chromara-purple hover:underline">Add content to the calendar</Link></p>
        ) : (
          <div className="space-y-3">
            {weekSchedule.map((item) => (
              <Link key={item.id} href="/dashboard/content/calendar" className="flex items-start gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                <span className="text-2xl">{platformIcon(item.platform)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <p className="text-xs text-white/60 mt-1">{item.platform || '—'} • {formatDate(item.scheduled_date, item.scheduled_time)}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-chromara-purple/20 text-chromara-purple rounded-full">{item.platform || '—'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">📊 Performance Snapshot</h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/analytics" className="text-chromara-purple hover:text-chromara-pink text-sm underline">View all KPIs</Link>
            {!editingSnapshot ? (
              <button onClick={() => setEditingSnapshot(true)} className="text-chromara-purple hover:text-chromara-pink text-sm">Edit</button>
            ) : (
              <>
                <button onClick={saveSnapshot} disabled={savingSnapshot} className="text-chromara-purple hover:text-chromara-pink text-sm disabled:opacity-50">Save</button>
                <button onClick={() => { setEditingSnapshot(false); loadData(); }} className="text-white/60 hover:text-white text-sm">Cancel</button>
              </>
            )}
          </div>
        </div>
        {editingSnapshot ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SNAPSHOT_METRICS.map((m) => (
              <div key={m.key}>
                <label className="block text-xs text-white/60 mb-1">{m.label}</label>
                <input
                  type="number"
                  step={m.format === 'percentage' ? 0.1 : 1}
                  value={snapshotValues[m.key] ?? ''}
                  onChange={(e) => setSnapshotValues((s) => ({ ...s, [m.key]: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SNAPSHOT_METRICS.map((m) => (
              <div key={m.key} className="glass-card p-4">
                <p className="text-2xl font-bold text-white mb-1">
                  {loading ? '—' : formatValue(snapshotValues[m.key] ?? '', m.format)}
                </p>
                <p className="text-xs text-white/60">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">🔥 Top Performers</h2>
            <button onClick={() => setEditingPerformers(!editingPerformers)} className="text-chromara-purple hover:text-chromara-pink text-sm">
              {editingPerformers ? 'Done' : 'Edit'}
            </button>
          </div>
          {editingPerformers ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPerformer.title}
                  onChange={(e) => setNewPerformer((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Post title"
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm"
                />
                <input
                  type="text"
                  value={newPerformer.views}
                  onChange={(e) => setNewPerformer((p) => ({ ...p, views: e.target.value }))}
                  placeholder="Views"
                  className="w-20 px-2 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm"
                />
                <input
                  type="text"
                  value={newPerformer.engagement}
                  onChange={(e) => setNewPerformer((p) => ({ ...p, engagement: e.target.value }))}
                  placeholder="Eng%"
                  className="w-16 px-2 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm"
                />
                <button onClick={addPerformer} className="px-3 py-2 bg-chromara-purple rounded-lg text-white text-sm font-medium">Add</button>
              </div>
              {topPerformers.map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-white/60">👁️ {p.views} • 💬 {p.engagement}</p>
                  </div>
                  <button onClick={() => removePerformer(p.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {topPerformers.length === 0 ? (
                <p className="text-white/50 text-sm">No top performers yet. Click Edit to add your best posts.</p>
              ) : (
                topPerformers.map((p) => (
                  <div key={p.id} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white font-medium text-sm mb-2">{p.title}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>👁️ {p.views}</span>
                      <span>💬 {p.engagement}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📝 Quick Links</h2>
          <div className="space-y-2">
            <QuickLink href="/dashboard/content/ideas" icon="💡" label="Content Ideas" />
            <QuickLink href="/dashboard/content/hashtags" icon="#️⃣" label="Hashtag Library" />
            <QuickLink href="/dashboard/content/keywords" icon="🔑" label="Keyword Library" />
            <QuickLink href="/dashboard/content/strategies" icon="📱" label="Platform Strategies" />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
      <span className="text-xl">{icon}</span>
      <span className="text-white font-medium">{label}</span>
      <span className="ml-auto text-white/40">→</span>
    </Link>
  )
}
