'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'chromara-engineering-software'

type SystemCard = { id: string; title: string; status: string; version: string }
type RoadmapItem = { id: string; title: string; status: string; priority: string }
type TechBadge = { id: string; name: string; icon: string }

export default function SoftwareEngineering() {
  const [systems, setSystems] = useState<SystemCard[]>([])
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([])
  const [techStack, setTechStack] = useState<TechBadge[]>([])
  const [editing, setEditing] = useState<{ section: string; id?: string } | null>(null)
  const [editForm, setEditForm] = useState<Partial<SystemCard & RoadmapItem & TechBadge>>({})

  const load = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const data = JSON.parse(raw)
        if (data.systems?.length) setSystems(data.systems)
        if (data.roadmap?.length) setRoadmap(data.roadmap)
        if (data.techStack?.length) setTechStack(data.techStack)
      }
    } catch (_) {}
  }

  const save = (s: SystemCard[], r: RoadmapItem[], t: TechBadge[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ systems: s, roadmap: r, techStack: t }))
  }

  useEffect(() => {
    load()
  }, [])

  const addSystem = () => {
    const s: SystemCard = { id: Date.now().toString(), title: 'New System', status: 'Planning', version: 'v0.1' }
    const next = [...systems, s]
    setSystems(next)
    save(next, roadmap, techStack)
  }

  const updateSystem = (id: string, patch: Partial<SystemCard>) => {
    const next = systems.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setSystems(next)
    setEditing(null)
    save(next, roadmap, techStack)
  }

  const deleteSystem = (id: string) => {
    const next = systems.filter((x) => x.id !== id)
    setSystems(next)
    setEditing(null)
    save(next, roadmap, techStack)
  }

  const addRoadmap = () => {
    const r: RoadmapItem = { id: Date.now().toString(), title: 'New Item', status: 'Backlog', priority: 'Medium' }
    const next = [...roadmap, r]
    setRoadmap(next)
    save(systems, next, techStack)
  }

  const updateRoadmap = (id: string, patch: Partial<RoadmapItem>) => {
    const next = roadmap.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setRoadmap(next)
    setEditing(null)
    save(systems, next, techStack)
  }

  const deleteRoadmap = (id: string) => {
    const next = roadmap.filter((x) => x.id !== id)
    setRoadmap(next)
    setEditing(null)
    save(systems, next, techStack)
  }

  const addTech = () => {
    const t: TechBadge = { id: Date.now().toString(), name: 'New Tech', icon: '🔧' }
    const next = [...techStack, t]
    setTechStack(next)
    save(systems, roadmap, next)
  }

  const updateTech = (id: string, patch: Partial<TechBadge>) => {
    const next = techStack.map((x) => (x.id === id ? { ...x, ...patch } : x))
    setTechStack(next)
    setEditing(null)
    save(systems, roadmap, next)
  }

  const deleteTech = (id: string) => {
    const next = techStack.filter((x) => x.id !== id)
    setTechStack(next)
    setEditing(null)
    save(systems, roadmap, next)
  }

  const priorityColors: Record<string, string> = {
    Critical: 'border-red-500/30 bg-red-500/10',
    High: 'border-yellow-500/30 bg-yellow-500/10',
    Medium: 'border-blue-500/30 bg-blue-500/10',
    Low: 'border-white/20 bg-white/5',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Software Engineering</h1>

      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Core Systems</h2>
          <button onClick={addSystem} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {systems.length === 0 ? (
          <p className="text-white/50">No systems yet. Add core systems to track.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((s) => (
              <div key={s.id} className="glass-card p-4 group">
                {editing?.section === 'system' && editing?.id === s.id ? (
                  <div className="space-y-2">
                    <input value={editForm.title ?? s.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <input value={editForm.status ?? s.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="glass-input w-full" placeholder="Status" />
                    <input value={editForm.version ?? s.version} onChange={(e) => setEditForm((f) => ({ ...f, version: e.target.value }))} className="glass-input w-full" placeholder="Version" />
                    <div className="flex gap-2">
                      <button onClick={() => updateSystem(s.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteSystem(s.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{s.status}</span>
                      <span className="text-xs text-white/60">{s.version}</span>
                    </div>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing({ section: 'system', id: s.id }); setEditForm(s); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteSystem(s.id)} className="text-red-400 text-xs">Delete</button>
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
          <h2 className="text-xl font-bold text-white">Development Roadmap</h2>
          <button onClick={addRoadmap} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {roadmap.length === 0 ? (
          <p className="text-white/50">No roadmap items yet. Add tasks to track.</p>
        ) : (
          <div className="space-y-3">
            {roadmap.map((r) => (
              <div key={r.id} className={`p-4 rounded-lg border-l-4 ${priorityColors[r.priority] || priorityColors.Medium} group`}>
                {editing?.section === 'roadmap' && editing?.id === r.id ? (
                  <div className="space-y-2">
                    <input value={editForm.title ?? r.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="glass-input w-full" placeholder="Title" />
                    <select value={editForm.status ?? r.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} className="glass-input w-full">
                      <option value="Backlog">Backlog</option>
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Testing">Testing</option>
                      <option value="Complete">Complete</option>
                    </select>
                    <select value={editForm.priority ?? r.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))} className="glass-input w-full">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => updateRoadmap(r.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                      <button onClick={() => deleteRoadmap(r.id)} className="text-red-400 text-xs">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">{r.title}</h3>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">{r.status}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">{r.priority}</span>
                      <button onClick={() => { setEditing({ section: 'roadmap', id: r.id }); setEditForm(r); }} className="text-chromara-purple text-xs opacity-0 group-hover:opacity-100">Edit</button>
                      <button onClick={() => deleteRoadmap(r.id)} className="text-red-400 text-xs opacity-0 group-hover:opacity-100">Delete</button>
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
          <h2 className="text-xl font-bold text-white">Tech Stack</h2>
          <button onClick={addTech} className="glass-button px-3 py-1 text-sm">+ Add</button>
        </div>
        {techStack.length === 0 ? (
          <p className="text-white/50">No tech stack yet. Add technologies you use.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {techStack.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg group">
                {editing?.section === 'tech' && editing?.id === t.id ? (
                  <div className="flex-1 space-y-2">
                    <input value={editForm.name ?? t.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="glass-input w-full text-sm" placeholder="Name" />
                    <input value={editForm.icon ?? t.icon} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))} className="glass-input w-full text-sm" placeholder="Icon (emoji)" />
                    <div className="flex gap-2">
                      <button onClick={() => updateTech(t.id, editForm)} className="glass-button px-2 py-1 text-xs">Save</button>
                      <button onClick={() => setEditing(null)} className="px-2 py-1 text-white/60 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-sm text-white font-medium flex-1 truncate">{t.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button onClick={() => { setEditing({ section: 'tech', id: t.id }); setEditForm(t); }} className="text-chromara-purple text-xs">Edit</button>
                      <button onClick={() => deleteTech(t.id)} className="text-red-400 text-xs">Del</button>
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
