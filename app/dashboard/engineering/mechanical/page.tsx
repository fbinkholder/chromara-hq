'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'chromara-engineering-mechanical'

type Component = { id: string; title: string; description: string; status: string }
type Spec = { id: string; label: string; value: string }

export default function MechanicalEngineering() {
  const [components, setComponents] = useState<Component[]>([])
  const [specs, setSpecs] = useState<Spec[]>([])
  const [editing, setEditing] = useState<{ section: string; id?: string } | null>(null)
  const [editForm, setEditForm] = useState<Partial<Component & Spec>>({})

  const load = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data.components?.length) setComponents(data.components)
        if (data.specs?.length) setSpecs(data.specs)
      }
    } catch (_) {}
  }

  const save = (c: Component[], s: Spec[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ components: c, specs: s }))
  }

  useEffect(() => {
    load()
  }, [])

  const addComponent = () => {
    const comp: Component = { id: Date.now().toString(), title: 'New Component', description: '', status: 'Planning' }
    const next = [...components, comp]
    setComponents(next)
    save(next, specs)
  }

  const updateComponent = (id: string, patch: Partial<Component>) => {
    const next = components.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setComponents(next)
    setEditing(null)
    save(next, specs)
  }

  const deleteComponent = (id: string) => {
    const next = components.filter((x) => x.id !== id)
    setComponents(next)
    setEditing(null)
    save(next, specs)
  }

  const addSpec = () => {
    const s: Spec = { id: Date.now().toString(), label: 'New Spec', value: '' }
    const next = [...specs, s]
    setSpecs(next)
    save(components, next)
  }

  const updateSpec = (id: string, patch: Partial<Spec>) => {
    const next = specs.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setSpecs(next)
    setEditing(null)
    save(components, next)
  }

  const deleteSpec = (id: string) => {
    const next = specs.filter((x) => x.id !== id)
    setSpecs(next)
    setEditing(null)
    save(components, next)
  }

  const statusColors: Record<string, string> = {
    Planning: 'bg-yellow-500/20 text-yellow-400',
    'CAD Modeling': 'bg-purple-500/20 text-purple-400',
    'Design Complete': 'bg-green-500/20 text-green-400',
    Prototyping: 'bg-blue-500/20 text-blue-400',
    Testing: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mechanical Engineering</h1>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Hardware Components</h2>
          <button onClick={addComponent} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {components.length === 0 ? (
          <p className="text-white/50">No components yet. Add hardware components to track.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {components.map((c) => (
              <div key={c.id} className="glass-card p-4 group">
                {editing?.section === 'component' && editing?.id === c.id ? (
                  <div className="space-y-2">
                    <input value={editForm.title ?? c.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <input value={editForm.description ?? c.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="glass-input w-full" placeholder="Description" />
                    <input value={editForm.status ?? c.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="glass-input w-full" placeholder="Status" />
                    <div className="flex gap-2">
                      <button onClick={() => updateComponent(c.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteComponent(c.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-semibold mb-2">{c.title}</h3>
                    <p className="text-sm text-white/60 mb-3">{c.description || '—'}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[c.status] || 'bg-white/10 text-white/60'}`}>{c.status}</span>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'component', id: c.id }); setEditForm(c); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteComponent(c.id)} className="text-red-400 text-xs">Delete</button>
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
          <h2 className="text-xl font-bold text-white">Engineering Specs</h2>
          <button onClick={addSpec} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {specs.length === 0 ? (
          <p className="text-white/50">No specs yet. Add dimensions, weight, accuracy, etc.</p>
        ) : (
          <div className="space-y-3">
            {specs.map((s) => (
              <div key={s.id} className="p-4 bg-white/5 rounded-lg group">
                {editing?.section === 'spec' && editing?.id === s.id ? (
                  <div className="space-y-2">
                    <input value={editForm.label ?? s.label} onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))} className="glass-input w-full" placeholder="Label" />
                    <input value={editForm.value ?? s.value} onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))} className="glass-input w-full" placeholder="Value" />
                    <div className="flex gap-2">
                      <button onClick={() => updateSpec(s.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteSpec(s.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">{s.value || '—'}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button onClick={() => { setEditing({ section: 'spec', id: s.id }); setEditForm(s); }} className="text-chromara-purple text-xs">Edit</button>
                        <button onClick={() => deleteSpec(s.id)} className="text-red-400 text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div className="h-full w-full bg-gradient-to-r from-chromara-purple to-chromara-pink" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
