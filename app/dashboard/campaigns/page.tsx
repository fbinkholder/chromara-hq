'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type Campaign = {
  id: string
  name: string
  objective: string | null
  start_date: string | null
  end_date: string | null
  budget: number | null
  status: string
  channels: string[] | null
  target_metrics: Record<string, number> | null
  actual_metrics: Record<string, number> | null
  notes: string | null
}

const OBJECTIVES = ['brand_awareness', 'waitlist_growth', 'partnership', 'fundraising']
const STATUSES = ['planning', 'active', 'paused', 'completed'] as const
const CHANNEL_OPTIONS = ['twitter', 'linkedin', 'email', 'tiktok', 'blog', 'instagram']

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setCampaigns((data as Campaign[]) || [])
    } catch (e) {
      console.error(e)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleSave = async (form: Partial<Campaign> & { target_metrics?: Record<string, number>; actual_metrics?: Record<string, number> }) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        name: form.name || 'Unnamed campaign',
        objective: form.objective || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget != null ? Number(form.budget) : null,
        status: form.status || 'planning',
        channels: form.channels || null,
        target_metrics: form.target_metrics ?? null,
        actual_metrics: form.actual_metrics ?? null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (editing) {
        const { error } = await supabase.from('campaigns').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('campaigns').insert(payload)
        if (error) throw error
      }
      setModalOpen(false)
      setEditing(null)
      loadCampaigns()
    } catch (e: unknown) {
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await supabase.from('campaigns').delete().eq('id', deleteTarget.id)
      setDeleteTarget(null)
      loadCampaigns()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const duplicateCampaign = async (c: Campaign) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('campaigns').insert({
      user_id: user.id,
      name: c.name + ' (copy)',
      objective: c.objective,
      start_date: null,
      end_date: null,
      budget: c.budget,
      status: 'planning',
      channels: c.channels,
      target_metrics: c.target_metrics,
      actual_metrics: c.actual_metrics,
      notes: c.notes,
    })
    if (!error) loadCampaigns()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Campaign Tracker</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="glass-button px-4 py-2">
          Launch your first campaign
        </button>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="No campaigns yet"
          description="Create campaigns and track objectives, budget, and metrics."
          buttonText="Launch your first campaign"
          onButtonClick={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((c) => (
            <div key={c.id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{c.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  c.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  c.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                  c.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-white/20 text-white/80'
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-2">{c.objective?.replace('_', ' ') || '—'}</p>
              {(c.start_date || c.end_date) && (
                <p className="text-white/50 text-xs mb-3">
                  {c.start_date} → {c.end_date || 'Ongoing'}
                </p>
              )}
              {c.budget != null && <p className="text-white/70 text-sm mb-3">Budget: ${c.budget.toLocaleString()}</p>}
              {c.channels?.length ? <p className="text-white/60 text-xs mb-3">Channels: {c.channels.join(', ')}</p> : null}
              {c.target_metrics && Object.keys(c.target_metrics).length > 0 && (
                <div className="space-y-2 mt-3">
                  {Object.entries(c.target_metrics).slice(0, 3).map(([key, target]) => {
                    const actual = c.actual_metrics?.[key] ?? 0
                    const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-white/70 mb-0.5">
                          <span>{key.replace(/_/g, ' ')}</span>
                          <span>{actual} / {target} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-chromara-purple' : 'bg-yellow-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditing(c); setModalOpen(true); }} className="text-sm glass-button px-3 py-1.5">Edit</button>
                <button onClick={() => duplicateCampaign(c)} className="text-sm glass-button px-3 py-1.5">Duplicate</button>
                <button onClick={() => setDeleteTarget(c)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CampaignModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete campaign?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function CampaignModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Campaign | null
  onSave: (form: Partial<Campaign> & { target_metrics?: Record<string, number>; actual_metrics?: Record<string, number> }) => void
  onClose: () => void
  saving: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [objective, setObjective] = useState(initial?.objective ?? '')
  const [start_date, setStart_date] = useState(initial?.start_date ?? '')
  const [end_date, setEnd_date] = useState(initial?.end_date ?? '')
  const [budget, setBudget] = useState(initial?.budget != null ? String(initial.budget) : '')
  const [status, setStatus] = useState(initial?.status ?? 'planning')
  const [channels, setChannels] = useState<string[]>(initial?.channels ?? [])
  const [targetRows, setTargetRows] = useState<{ k: string; v: string }[]>(
    initial?.target_metrics ? Object.entries(initial.target_metrics).map(([k, v]) => ({ k, v: String(v) })) : [{ k: '', v: '' }]
  )
  const [actualRows, setActualRows] = useState<{ k: string; v: string }[]>(
    initial?.actual_metrics ? Object.entries(initial.actual_metrics).map(([k, v]) => ({ k, v: String(v) })) : [{ k: '', v: '' }]
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const toggleChannel = (ch: string) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))
  }

  const addTargetRow = () => setTargetRows((r) => [...r, { k: '', v: '' }])
  const addActualRow = () => setActualRows((r) => [...r, { k: '', v: '' }])

  const submit = () => {
    if (!name.trim()) { alert('Campaign name required'); return }
    const target_metrics: Record<string, number> = {}
    targetRows.forEach(({ k, v }) => { if (k.trim()) target_metrics[k.trim()] = Number(v) || 0 })
    const actual_metrics: Record<string, number> = {}
    actualRows.forEach(({ k, v }) => { if (k.trim()) actual_metrics[k.trim()] = Number(v) || 0 })
    onSave({
      name: name.trim(),
      objective: objective || null,
      start_date: start_date || null,
      end_date: end_date || null,
      budget: budget === '' ? null : Number(budget),
      status,
      channels: channels.length ? channels : null,
      target_metrics: Object.keys(target_metrics).length ? target_metrics : undefined,
      actual_metrics: Object.keys(actual_metrics).length ? actual_metrics : undefined,
      notes: notes || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="glass-card p-6 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit campaign' : 'New campaign'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="glass-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Objective</label>
            <select value={objective} onChange={(e) => setObjective(e.target.value)} className="glass-input w-full">
              <option value="">—</option>
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Start date</label>
              <input type="date" value={start_date} onChange={(e) => setStart_date(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">End date</label>
              <input type="date" value={end_date} onChange={(e) => setEnd_date(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Budget ($)</label>
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="glass-input w-full" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input w-full">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1 rounded-lg text-sm ${channels.includes(ch) ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/70'}`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Target metrics (name → value)</label>
            {targetRows.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={row.k}
                  onChange={(e) => setTargetRows((r) => r.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))}
                  className="glass-input flex-1"
                  placeholder="e.g. waitlist_signups"
                />
                <input
                  type="number"
                  value={row.v}
                  onChange={(e) => setTargetRows((r) => r.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))}
                  className="glass-input w-24"
                  placeholder="500"
                />
              </div>
            ))}
            <button type="button" onClick={addTargetRow} className="text-xs text-chromara-purple hover:underline">+ Add metric</button>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Actual metrics (name → value)</label>
            {actualRows.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={row.k}
                  onChange={(e) => setActualRows((r) => r.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))}
                  className="glass-input flex-1"
                  placeholder="e.g. waitlist_signups"
                />
                <input
                  type="number"
                  value={row.v}
                  onChange={(e) => setActualRows((r) => r.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))}
                  className="glass-input w-24"
                  placeholder="342"
                />
              </div>
            ))}
            <button type="button" onClick={addActualRow} className="text-xs text-chromara-purple hover:underline">+ Add metric</button>
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
