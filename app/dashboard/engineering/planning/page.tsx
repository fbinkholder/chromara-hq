'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'chromara-engineering-planning'

type Initiative = { id: string; title: string; description: string; target: string }
type RDIdea = { id: string; icon: string; title: string; description: string }

export default function EngineeringPlanning() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [rdIdeas, setRdIdeas] = useState<RDIdea[]>([])
  const [editing, setEditing] = useState<{ section: string; id?: string } | null>(null)
  const [editForm, setEditForm] = useState<Partial<Initiative & RDIdea>>({})

  const load = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data.initiatives?.length) setInitiatives(data.initiatives)
        if (data.rdIdeas?.length) setRdIdeas(data.rdIdeas)
      }
    } catch (_) {}
  }

  const save = (i: Initiative[], r: RDIdea[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ initiatives: i, rdIdeas: r }))
  }

  useEffect(() => {
    load()
  }, [])

  const addInitiative = () => {
    const x: Initiative = { id: Date.now().toString(), title: 'New Initiative', description: '', target: '' }
    const next = [...initiatives, x]
    setInitiatives(next)
    save(next, rdIdeas)
  }

  const updateInitiative = (id: string, patch: Partial<Initiative>) => {
    const next = initiatives.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setInitiatives(next)
    setEditing(null)
    save(next, rdIdeas)
  }

  const deleteInitiative = (id: string) => {
    const next = initiatives.filter((x) => x.id !== id)
    setInitiatives(next)
    setEditing(null)
    save(next, rdIdeas)
  }

  const addRDIdea = () => {
    const r: RDIdea = { id: Date.now().toString(), icon: '💡', title: 'New R&D Idea', description: '' }
    const next = [...rdIdeas, r]
    setRdIdeas(next)
    save(initiatives, next)
  }

  const updateRDIdea = (id: string, patch: Partial<RDIdea>) => {
    const next = rdIdeas.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setRdIdeas(next)
    setEditing(null)
    save(initiatives, next)
  }

  const deleteRDIdea = (id: string) => {
    const next = rdIdeas.filter((x) => x.id !== id)
    setRdIdeas(next)
    setEditing(null)
    save(initiatives, next)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Engineering Planning</h1>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Future Initiatives</h2>
          <button onClick={addInitiative} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {initiatives.length === 0 ? (
          <p className="text-white/50">No initiatives yet. Add future products or phases.</p>
        ) : (
          <div className="space-y-3">
            {initiatives.map((i) => (
              <div key={i.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-chromara-purple/50 group">
                {editing?.section === 'initiative' && editing?.id === i.id ? (
                  <div className="space-y-2">
                    <input value={editForm.title ?? i.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <input value={editForm.description ?? i.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="glass-input w-full" placeholder="Description" />
                    <input value={editForm.target ?? i.target} onChange={(e) => setEditForm((f) => ({ ...f, target: e.target.value }))} className="glass-input w-full" placeholder="Target (e.g. Q4 2027)" />
                    <div className="flex gap-2">
                      <button onClick={() => updateInitiative(i.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteInitiative(i.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-semibold mb-2">{i.title}</h3>
                    <p className="text-sm text-white/60 mb-2">{i.description || '—'}</p>
                    <div className="flex justify-between items-center">
                      {i.target && <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">{i.target}</span>}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button onClick={() => { setEditing({ section: 'initiative', id: i.id }); setEditForm(i); }} className="text-chromara-purple text-xs">Edit</button>
                        <button onClick={() => deleteInitiative(i.id)} className="text-red-400 text-xs">Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Research & Development</h2>
          <button onClick={addRDIdea} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {rdIdeas.length === 0 ? (
          <p className="text-white/50">No R&D ideas yet. Add research directions or features.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rdIdeas.map((r) => (
              <div key={r.id} className="glass-card p-4 group">
                {editing?.section === 'rd' && editing?.id === r.id ? (
                  <div className="space-y-2">
                    <input value={editForm.icon ?? r.icon} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))} className="glass-input w-full" placeholder="Icon (emoji)" />
                    <input value={editForm.title ?? r.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <input value={editForm.description ?? r.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="glass-input w-full" placeholder="Description" />
                    <div className="flex gap-2">
                      <button onClick={() => updateRDIdea(r.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteRDIdea(r.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl mb-2 block">{r.icon}</span>
                    <h3 className="text-white font-semibold mb-1">{r.title}</h3>
                    <p className="text-xs text-white/60">{r.description || '—'}</p>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'rd', id: r.id }); setEditForm(r); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteRDIdea(r.id)} className="text-red-400 text-xs">Delete</button>
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
