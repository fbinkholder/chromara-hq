'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type ContentItem = {
  id: string
  title: string
  platform: string | null
  content_type: string | null
  description: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  status: string
  content_url: string | null
  notes: string | null
  created_at: string
}

const PLATFORMS = ['twitter', 'linkedin', 'tiktok', 'pinterest', 'blog', 'email']
const CONTENT_TYPES = ['post', 'video', 'article', 'email', 'story']
const STATUSES = ['draft', 'scheduled', 'published', 'cancelled'] as const
const platformColors: Record<string, string> = {
  twitter: 'bg-blue-500',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-pink-500',
  pinterest: 'bg-red-500',
  blog: 'bg-purple-500',
  email: 'bg-green-500',
}

export default function ContentCalendarPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true, nullsFirst: true })
      if (error) throw error
      setItems((data as ContentItem[]) || [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const filtered = items.filter((i) => {
    if (filterPlatform !== 'all' && i.platform !== filterPlatform) return false
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    return true
  })

  const openAdd = (date?: string) => {
    setEditing(null)
    setDefaultDate(date || null)
    setModalOpen(true)
  }
  const openEdit = (item: ContentItem) => {
    setEditing(item)
    setDefaultDate(null)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setDefaultDate(null)
  }

  const handleSave = async (form: Record<string, string | null>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        title: form.title || 'Untitled',
        platform: form.platform || null,
        content_type: form.content_type || null,
        description: form.description || null,
        scheduled_date: form.scheduled_date || null,
        scheduled_time: form.scheduled_time || null,
        status: form.status || 'draft',
        content_url: form.content_url || null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (editing) {
        const { error } = await supabase.from('content_calendar').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('content_calendar').insert(payload)
        if (error) throw error
      }
      closeModal()
      loadItems()
    } catch (e: unknown) {
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('content_calendar').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      loadItems()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const markPublished = async (item: ContentItem) => {
    try {
      await supabase.from('content_calendar').update({ status: 'published', updated_at: new Date().toISOString() }).eq('id', item.id)
      loadItems()
    } catch (e) {
      alert('Failed to update')
    }
  }

  const duplicateItem = async (item: ContentItem) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('content_calendar').insert({
      user_id: user.id,
      title: item.title + ' (copy)',
      platform: item.platform,
      content_type: item.content_type,
      description: item.description,
      scheduled_date: null,
      scheduled_time: null,
      status: 'draft',
      content_url: item.content_url,
      notes: item.notes,
    })
    if (!error) loadItems()
  }

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
  const firstDay = new Date(month.year, month.month, 1).getDay()
  const calendarDays: (ContentItem[] | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push(filtered.filter((i) => i.scheduled_date === dateStr))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Content Calendar</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-lg ${view === 'calendar' ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80'}`}>
            Calendar
          </button>
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80'}`}>
            List
          </button>
          <button onClick={() => openAdd()} className="glass-button px-4 py-2">
            Add Content
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="glass-input w-40">
          <option value="all">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="glass-input w-40">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No content scheduled yet"
          description="Add posts, videos, or articles to your calendar."
          buttonText="Add Content"
          onButtonClick={() => openAdd()}
        />
      ) : view === 'calendar' ? (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth((m) => (m.month === 0 ? { ...m, year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }))} className="glass-button px-3 py-1">←</button>
            <h2 className="text-white font-semibold">{new Date(month.year, month.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => setMonth((m) => (m.month === 11 ? { ...m, year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }))} className="glass-button px-3 py-1">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="text-white/60 text-sm py-2">{d}</div>
            ))}
            {calendarDays.map((dayItems, i) => (
              <div
                key={i}
                className="min-h-[80px] p-2 bg-white/5 rounded-lg border border-white/10 hover:border-chromara-purple/50 cursor-pointer"
                onClick={() => openAdd(`${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(i - firstDay + 1).padStart(2, '0')}`)}
              >
                {dayItems === null ? null : (
                  <>
                    <span className="text-white text-sm">{i - firstDay + 1}</span>
                    <div className="mt-1 space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                          className={`text-xs truncate px-1 py-0.5 rounded ${platformColors[item.platform || ''] || 'bg-gray-500'} text-white`}
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 3 && <span className="text-white/50 text-xs">+{dayItems.length - 3}</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card p-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-white/60 text-sm">{item.platform} · {item.content_type} · {item.status}</p>
                {item.scheduled_date && <p className="text-white/50 text-xs">{item.scheduled_date} {item.scheduled_time || ''}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => markPublished(item)} className="text-xs glass-button px-2 py-1" disabled={item.status === 'published'}>Mark published</button>
                <button onClick={() => duplicateItem(item)} className="text-xs glass-button px-2 py-1">Duplicate</button>
                <button onClick={() => openEdit(item)} className="text-xs glass-button px-2 py-1">Edit</button>
                <button onClick={() => setDeleteTarget(item)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ContentModal
          initial={editing}
          defaultScheduledDate={defaultDate}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete content?"
        message={deleteTarget ? `"${deleteTarget.title}" will be removed.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function ContentModal({
  initial,
  defaultScheduledDate,
  onSave,
  onClose,
  saving,
}: {
  initial: ContentItem | null
  defaultScheduledDate?: string | null
  onSave: (form: Record<string, string | null>) => void
  onClose: () => void
  saving: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [content_type, setContent_type] = useState(initial?.content_type ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [scheduled_date, setScheduled_date] = useState(initial?.scheduled_date ?? defaultScheduledDate ?? '')
  const [scheduled_time, setScheduled_time] = useState(initial?.scheduled_time?.slice(0, 5) ?? '')
  const [status, setStatus] = useState(initial?.status ?? 'draft')
  const [content_url, setContent_url] = useState(initial?.content_url ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = () => {
    if (!title.trim()) { alert('Title required'); return }
    onSave({
      title: title.trim(),
      platform: platform || null,
      content_type: content_type || null,
      description: description || null,
      scheduled_date: scheduled_date || null,
      scheduled_time: scheduled_time ? scheduled_time + ':00' : null,
      status,
      content_url: content_url || null,
      notes: notes || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" data-content-form onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit content' : 'Add content'}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Title *</label>
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input w-full" placeholder="Post title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="glass-input w-full">
                <option value="">—</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Content type</label>
              <select value={content_type} onChange={(e) => setContent_type(e.target.value)} className="glass-input w-full">
                <option value="">—</option>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="glass-input w-full min-h-[80px]" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Scheduled date</label>
              <input id="form-scheduled_date" type="date" value={scheduled_date} onChange={(e) => setScheduled_date(e.target.value)} className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Time</label>
              <input type="time" value={scheduled_time} onChange={(e) => setScheduled_time(e.target.value)} className="glass-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass-input w-full">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Content URL</label>
            <input type="url" value={content_url} onChange={(e) => setContent_url(e.target.value)} className="glass-input w-full" placeholder="https://..." />
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
