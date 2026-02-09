'use client'

import { useEffect, useState } from 'react'

type Resource = {
  id: string
  title: string
  url: string
  description: string
  category: string
  created_at: string
}

const CATEGORIES = ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Leonardo', 'Firefly', 'Tools', 'Prompts', 'Other']

export default function ImageGenResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [resources, searchQuery, filterCategory])

  const loadResources = () => {
    const stored = localStorage.getItem('chromara-image-gen-resources')
    if (stored) {
      setResources(JSON.parse(stored))
    }
  }

  const applyFilters = () => {
    let filtered = [...resources]

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === filterCategory)
    }

    setFilteredResources(filtered)
  }

  const saveResources = (newResources: Resource[]) => {
    setResources(newResources)
    localStorage.setItem('chromara-image-gen-resources', JSON.stringify(newResources))
  }

  const deleteResource = (id: string) => {
    if (!confirm('Delete this resource?')) return
    const updated = resources.filter(r => r.id !== id)
    saveResources(updated)
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Image Generation 🎨</h1>
          <p className="text-white/60 mt-1">AI image tools, prompts, and resources</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="glass-button">
          ➕ Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Resources" value={resources.length} icon="📢" />
        <StatCard label="Categories" value={new Set(resources.map(r => r.category)).size} icon="📁" />
        <StatCard label="Quick Access" value="∞" icon="⚡" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-white/60 text-sm">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-white mb-2">No resources yet</h3>
          <p className="text-white/60 mb-4">Add your favorite marketing tools and platforms</p>
          <button onClick={() => setShowAddModal(true)} className="glass-button">
            ➕ Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={() => setEditingResource(resource)}
              onDelete={() => deleteResource(resource.id)}
              onCopyUrl={() => copyUrl(resource.url)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingResource) && (
        <ResourceModal
          resource={editingResource}
          categories={CATEGORIES}
          onClose={() => {
            setShowAddModal(false)
            setEditingResource(null)
          }}
          onSave={(resource) => {
            if (editingResource) {
              const updated = resources.map(r => r.id === resource.id ? resource : r)
              saveResources(updated)
            } else {
              saveResources([...resources, { ...resource, id: Date.now().toString(), created_at: new Date().toISOString() }])
            }
            setShowAddModal(false)
            setEditingResource(null)
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function ResourceCard({ resource, onEdit, onDelete, onCopyUrl }: {
  resource: Resource
  onEdit: () => void
  onDelete: () => void
  onCopyUrl: () => void
}) {
  return (
    <div className="glass-card p-5 group hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{resource.title}</h3>
          <p className="text-sm text-white/60 mb-2">{resource.description}</p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-chromara-pink hover:underline break-all"
          >
            {resource.url}
          </a>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          <button
            onClick={onEdit}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 bg-white/10 hover:bg-red-500/20 rounded-lg text-white text-sm transition-all"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
          📁 {resource.category}
        </span>
        <button
          onClick={onCopyUrl}
          className="px-3 py-1 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white text-xs hover:shadow-glass-hover transition-all"
        >
          📋 Copy URL
        </button>
      </div>
    </div>
  )
}

function ResourceModal({ resource, categories, onClose, onSave }: {
  resource: Resource | null
  categories: string[]
  onClose: () => void
  onSave: (resource: Resource) => void
}) {
  const [title, setTitle] = useState(resource?.title || '')
  const [url, setUrl] = useState(resource?.url || '')
  const [description, setDescription] = useState(resource?.description || '')
  const [category, setCategory] = useState(resource?.category || categories[0])

  const handleSave = () => {
    if (!title.trim() || !url.trim()) {
      alert('Title and URL are required!')
      return
    }

    onSave({
      id: resource?.id || '',
      title,
      url,
      description,
      category,
      created_at: resource?.created_at || ''
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">
            {resource ? 'Edit Resource' : 'Add Resource'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Semrush"
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this resource..."
              className="glass-input w-full min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input w-full">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
          <button onClick={onClose} className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-button">
            💾 Save Resource
          </button>
        </div>
      </div>
    </div>
  )
}
