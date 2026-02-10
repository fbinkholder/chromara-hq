'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'chromara-engineering-dashboard'

type Update = { id: string; text: string; date: string; type: 'progress' | 'milestone' }
type StatusCard = { id: string; title: string; status: string; progress: number; target: string; color: string }
type TimelineItem = { id: string; title: string; date: string; status: 'complete' | 'in-progress' | 'upcoming'; description: string }
type DocCard = { id: string; title: string; date: string; type: string }

type EditFormState = Partial<Omit<StatusCard & TimelineItem & DocCard, 'status'> & { status?: string }>

const DEFAULT_STATUS: StatusCard[] = []
const DEFAULT_TIMELINE: TimelineItem[] = []
const DEFAULT_DOCS: DocCard[] = []

export default function EngineeringDashboard() {
  const [newUpdate, setNewUpdate] = useState('')
  const [updates, setUpdates] = useState<Update[]>([])
  const [statusCards, setStatusCards] = useState<StatusCard[]>(DEFAULT_STATUS)
  const [timeline, setTimeline] = useState<TimelineItem[]>(DEFAULT_TIMELINE)
  const [docs, setDocs] = useState<DocCard[]>(DEFAULT_DOCS)
  const [editing, setEditing] = useState<{ section: string; id?: string } | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({})

  const load = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data.updates?.length) setUpdates(data.updates)
        if (data.statusCards?.length) setStatusCards(data.statusCards)
        if (data.timeline?.length) setTimeline(data.timeline)
        if (data.docs?.length) setDocs(data.docs)
      }
    } catch (_) {}
  }

  const save = (u: Update[], s: StatusCard[], t: TimelineItem[], d: DocCard[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ updates: u, statusCards: s, timeline: t, docs: d }))
  }

  useEffect(() => {
    load()
  }, [])

  const addUpdate = () => {
    if (!newUpdate.trim()) return
    const u: Update = { id: Date.now().toString(), text: newUpdate.trim(), date: new Date().toISOString().slice(0, 10), type: 'progress' }
    const next = [u, ...updates]
    setUpdates(next)
    setNewUpdate('')
    save(next, statusCards, timeline, docs)
  }

  const deleteUpdate = (id: string) => {
    const next = updates.filter((x) => x.id !== id)
    setUpdates(next)
    save(next, statusCards, timeline, docs)
  }

  const addStatusCard = () => {
    const s: StatusCard = { id: Date.now().toString(), title: 'New Prototype', status: 'Planning', progress: 0, target: new Date().getFullYear().toString(), color: 'from-blue-500 to-purple-500' }
    const next = [...statusCards, s]
    setStatusCards(next)
    setEditing(null)
    save(updates, next, timeline, docs)
  }

  const updateStatusCard = (id: string, patch: Partial<StatusCard>) => {
    const next = statusCards.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setStatusCards(next)
    setEditing(null)
    save(updates, next, timeline, docs)
  }

  const deleteStatusCard = (id: string) => {
    const next = statusCards.filter((x) => x.id !== id)
    setStatusCards(next)
    setEditing(null)
    save(updates, next, timeline, docs)
  }

  const addTimeline = () => {
    const t: TimelineItem = { id: Date.now().toString(), title: 'New Phase', date: '', status: 'upcoming', description: '' }
    const next = [...timeline, t]
    setTimeline(next)
    setEditing(null)
    save(updates, statusCards, next, docs)
  }

  const updateTimeline = (id: string, patch: Partial<TimelineItem>) => {
    const next = timeline.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setTimeline(next)
    setEditing(null)
    save(updates, statusCards, next, docs)
  }

  const deleteTimeline = (id: string) => {
    const next = timeline.filter((x) => x.id !== id)
    setTimeline(next)
    setEditing(null)
    save(updates, statusCards, next, docs)
  }

  const addDoc = () => {
    const d: DocCard = { id: Date.now().toString(), title: 'New Document', date: new Date().toISOString().slice(0, 7), type: 'PDF' }
    const next = [...docs, d]
    setDocs(next)
    setEditing(null)
    save(updates, statusCards, timeline, next)
  }

  const updateDoc = (id: string, patch: Partial<DocCard>) => {
    const next = docs.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setDocs(next)
    setEditing(null)
    save(updates, statusCards, timeline, next)
  }

  const deleteDoc = (id: string) => {
    const next = docs.filter((x) => x.id !== id)
    setDocs(next)
    setEditing(null)
    save(updates, statusCards, timeline, next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Engineering Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/engineering/software" className="glass-button px-4 py-2 text-sm">Software →</Link>
          <Link href="/dashboard/engineering/mechanical" className="glass-button px-4 py-2 text-sm">Mechanical →</Link>
          <Link href="/dashboard/engineering/planning" className="glass-button px-4 py-2 text-sm">Planning →</Link>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Prototype Status</h2>
          <button onClick={addStatusCard} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {statusCards.length === 0 ? (
          <p className="text-white/50">No prototypes yet. Add one to track progress.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusCards.map((s) => (
              <div key={s.id} className="glass-card p-4 group">
                {editing?.section === 'status' && editing?.id === s.id ? (
                  <div className="space-y-2">
                    <input value={editForm.title ?? s.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full text-sm" placeholder="Title" />
                    <input value={editForm.status ?? s.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="glass-input w-full text-sm" placeholder="Status" />
                    <div className="flex gap-2">
                      <input type="number" min={0} max={100} value={editForm.progress ?? s.progress} onChange={(e) => setEditForm((f) => ({ ...f, progress: parseInt(e.target.value, 10) || 0 }))} className="glass-input w-20 text-sm" />
                      <input value={editForm.target ?? s.target} onChange={(e) => setEditForm((f) => ({ ...f, target: e.target.value }))} className="glass-input flex-1 text-sm" placeholder="Target" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatusCard(s.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 hover:text-white text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-white/60 mb-3">{s.status}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{s.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${s.color} transition-all`} style={{ width: `${s.progress}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-white/60">Target: {s.target}</p>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'status', id: s.id }); setEditForm(s); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteStatusCard(s.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Prototype Updates</h2>
        <div className="space-y-3 mb-4">
          {updates.map((u) => (
            <div key={u.id} className={`p-4 bg-white/5 rounded-lg border-l-4 ${u.type === 'milestone' ? 'border-chromara-pink' : 'border-blue-500'} flex justify-between items-start gap-2`}>
              <div>
                <p className="text-white font-medium">{u.text}</p>
                <p className="text-sm text-white/60 mt-1">{u.date}</p>
              </div>
              <button onClick={() => deleteUpdate(u.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUpdate()} placeholder="Add prototype update..." className="flex-1 glass-input" />
          <button onClick={addUpdate} className="glass-button px-4 py-2">Add Update</button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Product Development Timeline</h2>
          <button onClick={addTimeline} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {timeline.length === 0 ? (
          <p className="text-white/50">No timeline items yet. Add phases to track your roadmap.</p>
        ) : (
          <div className="relative pl-8 space-y-6">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chromara-purple via-chromara-pink to-blue-500" />
            {timeline.map((t) => (
              <div key={t.id} className="relative">
                <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-black/50 ${t.status === 'complete' ? 'bg-green-500' : t.status === 'in-progress' ? 'bg-chromara-purple' : 'bg-white/40'}`} />
                {editing?.section === 'timeline' && editing?.id === t.id ? (
                  <div className="glass-card p-4 space-y-2">
                    <input value={editForm.title ?? t.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <input value={editForm.date ?? t.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="glass-input w-full" placeholder="Date" />
                    <input value={editForm.description ?? t.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="glass-input w-full" placeholder="Description" />
                    <select value={editForm.status ?? t.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TimelineItem['status'] }))} className="glass-input w-full">
                      <option value="upcoming">Upcoming</option>
                      <option value="in-progress">In Progress</option>
                      <option value="complete">Complete</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => updateTimeline(t.id, { ...editForm, status: (editForm.status || t.status) as TimelineItem['status'] })} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 hover:text-white text-xs">Cancel</button>
                      <button onClick={() => deleteTimeline(t.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-4 group">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-white font-semibold">{t.title}</h3>
                      <span className="text-xs text-white/60 whitespace-nowrap">{t.date || '—'}</span>
                    </div>
                    <p className="text-sm text-white/60">{t.description || '—'}</p>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'timeline', id: t.id }); setEditForm(t); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteTimeline(t.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Technical Documentation</h2>
          <button onClick={addDoc} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {docs.length === 0 ? (
          <p className="text-white/50">No documents yet. Add specs and docs here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 group">
                {editing?.section === 'doc' && editing?.id === d.id ? (
                  <div className="flex-1 space-y-2">
                    <input value={editForm.title ?? d.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full text-sm" placeholder="Title" />
                    <input value={editForm.date ?? d.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="glass-input w-full text-sm" placeholder="Date" />
                    <select value={editForm.type ?? d.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))} className="glass-input w-full text-sm">
                      <option value="PDF">PDF</option>
                      <option value="DOC">DOC</option>
                      <option value="XLSX">XLSX</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => updateDoc(d.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteDoc(d.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl">{d.type === 'PDF' ? '📄' : d.type === 'DOC' ? '📝' : '📊'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-white/60">{d.date}</p>
                    </div>
                    <span className="text-xs text-white/40">{d.type}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'doc', id: d.id }); setEditForm(d); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteDoc(d.id)} className="text-red-400 text-xs">Del</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
