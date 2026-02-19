'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import ConfirmDialog from '@/app/components/ConfirmDialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Kpi = {
  id: string
  metric_name: string
  category: string | null
  current_value: number
  target_value: number | null
  unit: string | null
  tracked_date: string | null
  notes: string | null
}

const CATEGORIES = ['growth', 'engagement', 'partnership', 'fundraising', 'product']
const UNITS = ['count', 'percentage', 'dollars', 'days']

type Period = 'month' | 'quarter' | 'year'
const PERIOD_DAYS: Record<Period, number> = { month: 30, quarter: 90, year: 365 }

const CHART_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<Kpi[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [sort, setSort] = useState<'name' | 'value' | 'date'>('name')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Kpi | null>(null)
  const [logModal, setLogModal] = useState<Kpi | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Kpi | null>(null)
  const [saving, setSaving] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<Period>('quarter')
  const [snapshots, setSnapshots] = useState<{ metric_name: string; value: number; snapshot_date: string }[]>([])
  const supabase = createClient()

  const loadKpis = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [kpisRes, snapRes] = await Promise.all([
        supabase.from('kpis').select('*').eq('user_id', user.id).order('metric_name'),
        supabase.from('kpi_snapshots').select('metric_name, value, snapshot_date').eq('user_id', user.id).order('snapshot_date', { ascending: true }),
      ])
      if (kpisRes.error) throw kpisRes.error
      const kpisData = (kpisRes.data as Kpi[]) || []
      let snapData = snapRes.error ? [] : (snapRes.data as { metric_name: string; value: number; snapshot_date: string }[]) || []
      if (kpisData.length > 0 && snapData.length === 0) {
        try {
          const today = new Date().toISOString().slice(0, 10)
          for (const k of kpisData) {
            await supabase.from('kpi_snapshots').insert({
              user_id: user.id,
              metric_name: k.metric_name,
              value: k.current_value,
              snapshot_date: k.tracked_date || today,
            })
          }
          const { data: refetch } = await supabase.from('kpi_snapshots').select('metric_name, value, snapshot_date').eq('user_id', user.id).order('snapshot_date', { ascending: true })
          snapData = (refetch as { metric_name: string; value: number; snapshot_date: string }[]) || []
        } catch (_) {
          // kpi_snapshots table may not exist yet; run supabase/kpi_snapshots_schema.sql
        }
      }
      setKpis(kpisData)
      setSnapshots(snapData)
    } catch (e) {
      console.error(e)
      setKpis([])
      setSnapshots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKpis()
  }, [])

  const filtered = kpis
    .filter((k) => filter === 'all' || k.category === filter)
    .sort((a, b) => {
      if (sort === 'name') return (a.metric_name || '').localeCompare(b.metric_name || '')
      if (sort === 'value') return b.current_value - a.current_value
      return (b.tracked_date || '').localeCompare(a.tracked_date || '')
    })

  const chartData = useMemo(() => {
    const days = PERIOD_DAYS[chartPeriod]
    const cut = new Date()
    cut.setDate(cut.getDate() - days)
    const start = cut.toISOString().slice(0, 10)
    const byDate = new Map<string, Record<string, number>>()
    for (const s of snapshots) {
      if (s.snapshot_date < start) continue
      const key = s.snapshot_date
      const safeName = s.metric_name.replace(/\s+/g, '_')
      if (!byDate.has(key)) byDate.set(key, { date: key })
      byDate.get(key)![safeName] = Number(s.value)
    }
    const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v)
    return sorted
  }, [snapshots, chartPeriod])

  const chartMetrics = useMemo(() => {
    const days = PERIOD_DAYS[chartPeriod]
    const cut = new Date()
    cut.setDate(cut.getDate() - days)
    const start = cut.toISOString().slice(0, 10)
    const set = new Set<string>()
    for (const s of snapshots) {
      if (s.snapshot_date >= start) set.add(s.metric_name.replace(/\s+/g, '_'))
    }
    return [...set]
  }, [snapshots, chartPeriod])

  const handleSave = async (form: Partial<Kpi>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        metric_name: form.metric_name || 'Unnamed',
        category: form.category || null,
        current_value: Number(form.current_value) ?? 0,
        target_value: form.target_value != null ? Number(form.target_value) : null,
        unit: form.unit || null,
        tracked_date: form.tracked_date || new Date().toISOString().slice(0, 10),
        notes: form.notes || null,
      }
      if (editing) {
        const { error } = await supabase.from('kpis').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('kpis').insert(payload)
        if (error) throw error
      }
      await supabase.from('kpi_snapshots').insert({
        user_id: user.id,
        metric_name: payload.metric_name,
        value: payload.current_value,
        snapshot_date: payload.tracked_date,
      })
      setModalOpen(false)
      setEditing(null)
      loadKpis()
    } catch (e: unknown) {
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSaving(false)
    }
  }

  const handleLogValue = async (kpiId: string, value: number, date: string) => {
    try {
      const kpi = kpis.find((k) => k.id === kpiId)
      await supabase.from('kpis').update({
        current_value: value,
        tracked_date: date,
      }).eq('id', kpiId)
      const { data: { user } } = await supabase.auth.getUser()
      if (user && kpi) {
        await supabase.from('kpi_snapshots').insert({
          user_id: user.id,
          metric_name: kpi.metric_name,
          value,
          snapshot_date: date,
        })
      }
      setLogModal(null)
      loadKpis()
    } catch (e) {
      alert('Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await supabase.from('kpis').delete().eq('id', deleteTarget.id)
      setDeleteTarget(null)
      loadKpis()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">KPIs & Analytics</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="glass-button px-4 py-2">
          Track your first metric
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-white">Growth over time</h2>
          <div className="flex gap-2">
            {(['month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartPeriod === p ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {p === 'month' ? 'Month' : p === 'quarter' ? 'Quarter' : 'Year'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-white/60 text-sm mb-4">Updates automatically when you save or log KPI values on this page or the Marketing dashboard.</p>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-white/50 rounded-lg bg-white/5">
            No history yet. Save or log KPI values to see growth over time.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => value.replace(/_/g, ' ')} />
                {chartMetrics.map((metric, i) => (
                  <Line key={metric} type="monotone" dataKey={metric} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={metric.replace(/_/g, ' ')} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="glass-input w-40">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'value' | 'date')} className="glass-input w-40">
          <option value="name">Sort by name</option>
          <option value="value">Sort by value</option>
          <option value="date">Sort by date</option>
        </select>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📈"
          title="No KPIs tracked yet"
          description="Add metrics to track growth, engagement, partnerships, and more."
          buttonText="Track your first metric"
          onButtonClick={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <div key={k.id} className="glass-card p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">{k.metric_name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80">{k.category || '—'}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {k.current_value} {k.unit ? ` ${k.unit}` : ''}
              </p>
              {k.target_value != null && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Target: {k.target_value}</span>
                    <span>{Math.round((k.current_value / k.target_value) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chromara-purple rounded-full"
                      style={{ width: `${Math.min(100, (k.current_value / k.target_value) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {k.tracked_date && <p className="text-xs text-white/50 mt-2">Updated {k.tracked_date}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setLogModal(k)} className="text-xs glass-button px-2 py-1">Log value</button>
                <button onClick={() => { setEditing(k); setModalOpen(true); }} className="text-xs glass-button px-2 py-1">Edit</button>
                <button onClick={() => setDeleteTarget(k)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <KpiModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}

      {logModal && (
        <LogValueModal
          kpi={logModal}
          onSave={(value, date) => handleLogValue(logModal.id, value, date)}
          onClose={() => setLogModal(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete KPI?"
        message={deleteTarget ? `"${deleteTarget.metric_name}" will be removed.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function KpiModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Kpi | null
  onSave: (form: Partial<Kpi>) => void
  onClose: () => void
  saving: boolean
}) {
  const [metric_name, setMetric_name] = useState(initial?.metric_name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [current_value, setCurrent_value] = useState(String(initial?.current_value ?? ''))
  const [target_value, setTarget_value] = useState(initial?.target_value != null ? String(initial.target_value) : '')
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [tracked_date, setTracked_date] = useState(initial?.tracked_date ?? new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = () => {
    if (!metric_name.trim()) { alert('Metric name required'); return }
    const curr = Number(current_value)
    if (Number.isNaN(curr)) { alert('Current value must be a number'); return }
    onSave({
      metric_name: metric_name.trim(),
      category: category || null,
      current_value: curr,
      target_value: target_value === '' ? null : Number(target_value),
      unit: unit || null,
      tracked_date: tracked_date || null,
      notes: notes || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit KPI' : 'Add KPI'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Metric name *</label>
            <input value={metric_name} onChange={(e) => setMetric_name(e.target.value)} className="glass-input w-full" placeholder="e.g. Waitlist signups" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input w-full">
              <option value="">—</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Current value *</label>
              <input type="number" value={current_value} onChange={(e) => setCurrent_value(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Target value</label>
              <input type="number" value={target_value} onChange={(e) => setTarget_value(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="glass-input w-full">
              <option value="">—</option>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Tracked date</label>
            <input type="date" value={tracked_date} onChange={(e) => setTracked_date(e.target.value)} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full min-h-[60px]" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button>
          <button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function LogValueModal({ kpi, onSave, onClose }: { kpi: Kpi; onSave: (value: number, date: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(String(kpi.current_value))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const submit = () => {
    const v = Number(value)
    if (Number.isNaN(v)) { alert('Enter a number'); return }
    onSave(v, date)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-2">Log new value</h3>
        <p className="text-white/70 text-sm mb-4">{kpi.metric_name}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Value</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass-input w-full" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button>
          <button onClick={submit} className="glass-button px-4 py-2">Save</button>
        </div>
      </div>
    </div>
  )
}
