'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type Ambassador = {
  id: string
  name: string
  email: string | null
  social_handle: string | null
  platform: string | null
  follower_count: number | null
  tier: string | null
  status: string
  onboard_date: string | null
  total_posts: number
  total_engagement: number
  notes: string | null
}

type Activity = {
  id: string
  ambassador_id: string
  activity_type: string | null
  platform: string | null
  content_url: string | null
  post_date: string | null
  engagement_count: number | null
  notes: string | null
}

const PLATFORMS = ['twitter', 'linkedin', 'tiktok', 'instagram']
const TIERS = ['micro', 'mid', 'macro', 'mega']
const STATUSES = ['prospect', 'reached_out', 'onboarded', 'active', 'inactive']
const ACTIVITY_TYPES = ['post', 'story', 'video', 'review']

function suggestTier(followers: number): string {
  if (followers >= 1_000_000) return 'mega'
  if (followers >= 100_000) return 'macro'
  if (followers >= 10_000) return 'mid'
  return 'micro'
}

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Ambassador | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ambassador | null>(null)
  const [deleteAmb, setDeleteAmb] = useState<Ambassador | null>(null)
  const [deleteAct, setDeleteAct] = useState<Activity | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
  const supabase = createClient()

  const loadAmbassadors = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('ambassadors').select('*').eq('user_id', user.id).order('name')
    if (!error) setAmbassadors((data as Ambassador[]) || [])
  }

  const loadActivities = async (ambassadorId: string) => {
    const { data, error } = await supabase.from('ambassador_activities').select('*').eq('ambassador_id', ambassadorId).order('post_date', { ascending: false })
    if (!error) setActivities((data as Activity[]) || [])
  }

  useEffect(() => {
    setLoading(true)
    loadAmbassadors().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selected) loadActivities(selected.id)
    else setActivities([])
  }, [selected?.id])

  const filtered = ambassadors.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterTier !== 'all' && a.tier !== filterTier) return false
    return true
  })

  const handleSaveAmbassador = async (form: Partial<Ambassador>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        name: form.name || '',
        email: form.email || null,
        social_handle: form.social_handle || null,
        platform: form.platform || null,
        follower_count: form.follower_count != null ? Number(form.follower_count) : null,
        tier: form.tier || null,
        status: form.status || 'prospect',
        onboard_date: form.onboard_date || null,
        total_posts: form.total_posts ?? 0,
        total_engagement: form.total_engagement ?? 0,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (editing) {
        await supabase.from('ambassadors').update(payload).eq('id', editing.id)
      } else {
        await supabase.from('ambassadors').insert(payload)
      }
      setModalOpen(false)
      setEditing(null)
      loadAmbassadors()
      if (selected && editing && selected.id === editing.id) setSelected({ ...selected, ...payload } as Ambassador)
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveActivity = async (form: Partial<Activity> & { engagement_count?: number }) => {
    if (!selected) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const engagement = Number(form.engagement_count) || 0
      if (editingAct) {
        await supabase.from('ambassador_activities').update({
          activity_type: form.activity_type || null,
          platform: form.platform || null,
          content_url: form.content_url || null,
          post_date: form.post_date || null,
          engagement_count: engagement,
          notes: form.notes || null,
        }).eq('id', editingAct.id)
      } else {
        await supabase.from('ambassador_activities').insert({
          user_id: user.id,
          ambassador_id: selected.id,
          activity_type: form.activity_type || null,
          platform: form.platform || null,
          content_url: form.content_url || null,
          post_date: form.post_date || null,
          engagement_count: engagement,
          notes: form.notes || null,
        })
      }
      const { data: acts } = await supabase.from('ambassador_activities').select('engagement_count').eq('ambassador_id', selected.id)
      const totalEng = (acts || []).reduce((s, a) => s + (a.engagement_count || 0), 0)
      const totalP = (acts || []).length
      await supabase.from('ambassadors').update({ total_posts: totalP, total_engagement: totalEng, updated_at: new Date().toISOString() }).eq('id', selected.id)
      setActivityModalOpen(false)
      setEditingAct(null)
      loadActivities(selected.id)
      loadAmbassadors()
      if (selected) setSelected({ ...selected, total_posts: totalP, total_engagement: totalEng })
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const [editingAct, setEditingAct] = useState<Activity | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Ambassadors</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="glass-button px-4 py-2">Add ambassador</button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="glass-input w-36">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="glass-input w-36">
          <option value="all">All tiers</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : ambassadors.length === 0 ? (
        <EmptyState icon="👥" title="No ambassadors yet" buttonText="Add ambassador" onButtonClick={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className={`glass-card p-4 cursor-pointer transition-all ${selected?.id === a.id ? 'ring-2 ring-chromara-purple' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white/60">👤</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{a.name}</p>
                    <p className="text-white/60 text-sm truncate">{a.social_handle || a.email || '—'}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {a.tier && <span className="px-2 py-0.5 rounded text-xs bg-chromara-purple/30 text-white">{a.tier}</span>}
                      <span className="px-2 py-0.5 rounded text-xs bg-white/10">{a.status}</span>
                    </div>
                    <p className="text-white/50 text-xs mt-1">{a.follower_count != null ? a.follower_count.toLocaleString() + ' followers' : ''} · {a.total_posts} posts · {a.total_engagement} engagement</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditing(a); setModalOpen(true); }} className="text-xs glass-button px-2 py-1">Edit</button>
                  <button onClick={() => setDeleteAmb(a)} className="text-xs text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selected ? (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-2">{selected.name}</h3>
                <p className="text-white/70 text-sm mb-4">{selected.platform} · {selected.social_handle} · {selected.follower_count != null ? selected.follower_count.toLocaleString() + ' followers' : ''}</p>
                <button onClick={() => { setEditingAct(null); setActivityModalOpen(true); }} className="glass-button px-3 py-2 text-sm mb-4">Add activity</button>
                {activities.length === 0 ? (
                  <EmptyState icon="📋" title="No activities logged" buttonText="Add activity" onButtonClick={() => setActivityModalOpen(true)} />
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{act.post_date} · {act.activity_type} · {act.platform}</p>
                          {act.content_url && <a href={act.content_url} target="_blank" rel="noopener noreferrer" className="text-chromara-purple text-xs hover:underline">Link</a>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">{act.engagement_count ?? 0} engagement</span>
                          <button onClick={() => { setEditingAct(act); setActivityModalOpen(true); }} className="text-xs glass-button px-2 py-1">Edit</button>
                          <button onClick={() => setDeleteAct(act)} className="text-xs text-red-400">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-white/50">Select an ambassador to view activities</div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <AmbassadorModal
          initial={editing}
          onSave={handleSaveAmbassador}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}

      {activityModalOpen && selected && (
        <ActivityModal
          initial={editingAct}
          onSave={handleSaveActivity}
          onClose={() => { setActivityModalOpen(false); setEditingAct(null); }}
          saving={saving}
        />
      )}

      <ConfirmDialog isOpen={!!deleteAmb} title="Delete ambassador?" message={deleteAmb ? `Remove ${deleteAmb.name}?` : ''} onConfirm={async () => { if (deleteAmb) await supabase.from('ambassadors').delete().eq('id', deleteAmb.id); setDeleteAmb(null); setSelected(null); loadAmbassadors(); }} onCancel={() => setDeleteAmb(null)} />
      <ConfirmDialog isOpen={!!deleteAct} title="Delete activity?" message="This activity will be removed." onConfirm={async () => { if (deleteAct && selected) { const ambId = selected.id; await supabase.from('ambassador_activities').delete().eq('id', deleteAct.id); const { data } = await supabase.from('ambassador_activities').select('engagement_count').eq('ambassador_id', ambId); const totalEng = (data || []).reduce((s, a) => s + (a.engagement_count || 0), 0); await supabase.from('ambassadors').update({ total_posts: (data || []).length, total_engagement: totalEng }).eq('id', ambId); loadActivities(ambId); loadAmbassadors(); setSelected((s) => s && s.id === ambId ? { ...s, total_posts: (data || []).length, total_engagement: totalEng } : s); } setDeleteAct(null); }} onCancel={() => setDeleteAct(null)} />
    </div>
  )
}

function AmbassadorModal({ initial, onSave, onClose, saving }: { initial: Ambassador | null; onSave: (f: Partial<Ambassador>) => void; onClose: () => void; saving: boolean }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [social_handle, setSocial_handle] = useState(initial?.social_handle ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [follower_count, setFollower_count] = useState(initial?.follower_count != null ? String(initial.follower_count) : '')
  const [tier, setTier] = useState(initial?.tier ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'prospect')
  const [onboard_date, setOnboard_date] = useState(initial?.onboard_date ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const updateTierSuggestion = () => {
    const n = parseInt(follower_count, 10)
    if (!Number.isNaN(n) && tier === '') setTier(suggestTier(n))
  }
  const submit = () => {
    if (!name.trim()) { alert('Name required'); return }
    onSave({
      name: name.trim(),
      email: email || null,
      social_handle: social_handle || null,
      platform: platform || null,
      follower_count: follower_count === '' ? null : parseInt(follower_count, 10),
      tier: tier || null,
      status,
      onboard_date: onboard_date || null,
      notes: notes || null,
    })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit ambassador' : 'Add ambassador'}</h3>
        <div className="space-y-3">
          <div><label className="block text-sm text-white/80 mb-1">Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Social handle</label><input value={social_handle} onChange={(e) => setSocial_handle(e.target.value)} className="glass-input w-full" placeholder="@username" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Platform</label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="glass-input w-full"><option value="">—</option>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Follower count (tier auto-suggested)</label>
            <input type="number" value={follower_count} onChange={(e) => setFollower_count(e.target.value)} onBlur={updateTierSuggestion} className="glass-input w-full" />
          </div>
          <div><label className="block text-sm text-white/80 mb-1">Tier</label><select value={tier} onChange={(e) => setTier(e.target.value)} className="glass-input w-full"><option value="">—</option>{TIERS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input w-full">{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Onboard date</label><input type="date" value={onboard_date} onChange={(e) => setOnboard_date(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full min-h-[60px]" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button><button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
      </div>
    </div>
  )
}

function ActivityModal({ initial, onSave, onClose, saving }: { initial: Activity | null; onSave: (f: Partial<Activity> & { engagement_count?: number }) => void; onClose: () => void; saving: boolean }) {
  const [activity_type, setActivity_type] = useState(initial?.activity_type ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [content_url, setContent_url] = useState(initial?.content_url ?? '')
  const [post_date, setPost_date] = useState(initial?.post_date ?? new Date().toISOString().slice(0, 10))
  const [engagement_count, setEngagement_count] = useState(initial?.engagement_count != null ? String(initial.engagement_count) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const submit = () => {
    onSave({ activity_type: activity_type || null, platform: platform || null, content_url: content_url || null, post_date: post_date || null, engagement_count: Number(engagement_count) || 0, notes: notes || null })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit activity' : 'Add activity'}</h3>
        <div className="space-y-3">
          <div><label className="block text-sm text-white/80 mb-1">Type</label><select value={activity_type} onChange={(e) => setActivity_type(e.target.value)} className="glass-input w-full"><option value="">—</option>{ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Platform</label><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="glass-input w-full"><option value="">—</option>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Content URL</label><input type="url" value={content_url} onChange={(e) => setContent_url(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Post date</label><input type="date" value={post_date} onChange={(e) => setPost_date(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Engagement count</label><input type="number" value={engagement_count} onChange={(e) => setEngagement_count(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full min-h-[60px]" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button><button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
      </div>
    </div>
  )
}
