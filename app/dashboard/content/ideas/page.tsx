'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type ContentIdea = {
  id: string
  title: string
  description: string | null
  platform: string[] | null
  category: string | null
  content_type: string | null
  status: string
  priority: string | null
  target_audience: string | null
  keywords: string[] | null
  notes: string | null
  draft_content: string | null
}

const PLATFORMS = ['twitter', 'linkedin', 'tiktok', 'pinterest', 'blog']
const CATEGORIES = ['educational', 'founder_story', 'product_teaser', 'industry_news', 'behind_the_scenes']
const CONTENT_TYPES = ['post', 'video', 'carousel', 'article', 'thread']
const TARGET_AUDIENCES = ['beauty_brands', 'consumers', 'investors', 'press', 'general']
const STATUS_COLUMNS = ['idea', 'in_progress', 'ready', 'scheduled', 'published']

export default function ContentIdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<ContentIdea | null>(null)
  const supabase = createClient()

  const loadIdeas = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setIdeas((data as ContentIdea[]) || [])
    } catch (e) {
      console.error(e)
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIdeas()
  }, [])

  const deleteIdea = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('content_ideas').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      loadIdeas()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase
        .from('content_ideas')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
      loadIdeas()
    } catch (e) {
      alert('Failed to update')
    }
  }

  const filteredIdeas = ideas.filter((i) => {
    if (filterPlatform !== 'all' && (!i.platform || !i.platform.includes(filterPlatform))) return false
    if (filterCategory !== 'all' && i.category !== filterCategory) return false
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
            Content Ideas
          </h1>
          <p className="text-white/60 mt-2">Your content pipeline from idea to publish</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            className="glass-button px-4 py-2"
          >
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </button>
          <button onClick={() => { setEditingIdea(null); setShowModal(true); }} className="glass-button px-6 py-3">
            New Idea
          </button>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-4">
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="glass-input px-4 py-2">
          <option value="all">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="glass-input px-4 py-2">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="glass-input px-4 py-2">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {STATUS_COLUMNS.map((status) => (
              <div key={status} className="glass-card p-4">
                <div className="text-2xl font-bold text-white">
                  {filteredIdeas.filter((i) => i.status === status).length}
                </div>
                <div className="text-white/60 text-sm capitalize">{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {STATUS_COLUMNS.map((status) => (
                <div key={status} className="min-w-[280px]">
                  <div className="glass-card p-3 mb-4">
                    <h3 className="font-bold text-white capitalize">
                      {status.replace('_', ' ')} ({filteredIdeas.filter((i) => i.status === status).length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {filteredIdeas
                      .filter((i) => i.status === status)
                      .map((idea) => (
                        <IdeaCard
                          key={idea.id}
                          idea={idea}
                          onEdit={() => {
                            setEditingIdea(idea)
                            setShowModal(true)
                          }}
                          onDelete={() => setDeleteTarget(idea)}
                          onStatusChange={(newStatus) => updateStatus(idea.id, newStatus)}
                          statusColumns={STATUS_COLUMNS}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="glass-card p-6 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 pb-3">Title</th>
                    <th className="text-left text-white/80 pb-3">Platform</th>
                    <th className="text-left text-white/80 pb-3">Category</th>
                    <th className="text-left text-white/80 pb-3">Status</th>
                    <th className="text-left text-white/80 pb-3">Priority</th>
                    <th className="text-left text-white/80 pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 text-white">{idea.title}</td>
                      <td className="py-3 text-white/70">{idea.platform?.join(', ') || '—'}</td>
                      <td className="py-3 text-white/70">{idea.category?.replace('_', ' ') || '—'}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-chromara-purple/30 text-chromara-lilac">
                          {idea.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            idea.priority === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : idea.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {idea.priority || '—'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            setEditingIdea(idea)
                            setShowModal(true)
                          }}
                          className="text-chromara-purple hover:text-chromara-lilac mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(idea)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredIdeas.length === 0 && (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-white mb-2">No content ideas yet</h3>
              <p className="text-white/60 mb-6">Start building your content pipeline</p>
              <button onClick={() => setShowModal(true)} className="glass-button px-8 py-3">
                Add Your First Idea
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <IdeaModal
          idea={editingIdea}
          onClose={() => {
            setShowModal(false)
            setEditingIdea(null)
          }}
          onSave={() => {
            loadIdeas()
            setShowModal(false)
            setEditingIdea(null)
          }}
          supabase={supabase}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete idea?"
        message={deleteTarget ? `"${deleteTarget.title}" will be removed.` : ''}
        onConfirm={deleteIdea}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function IdeaCard({
  idea,
  onEdit,
  onDelete,
  onStatusChange,
  statusColumns,
}: {
  idea: ContentIdea
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
  statusColumns: string[]
}) {
  const statusIdx = statusColumns.indexOf(idea.status)
  return (
    <div
      className="glass-card p-4 hover:border-chromara-purple/50 transition-all group cursor-pointer"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white text-sm">{idea.title}</h4>
        <span
          className={`px-2 py-1 rounded text-xs ${
            idea.priority === 'high'
              ? 'bg-red-500/20 text-red-300'
              : idea.priority === 'medium'
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-green-500/20 text-green-300'
          }`}
        >
          {idea.priority || '—'}
        </span>
      </div>
      {idea.description && (
        <p className="text-white/60 text-xs mb-3 line-clamp-2">{idea.description}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {idea.platform?.slice(0, 2).map((p) => (
          <span key={p} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
            {p}
          </span>
        ))}
        {idea.platform && idea.platform.length > 2 && (
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
            +{idea.platform.length - 2}
          </span>
        )}
      </div>
      {statusIdx > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange(statusColumns[statusIdx - 1])
          }}
          className="text-xs text-white/60 hover:text-white mr-2"
        >
          ← Prev
        </button>
      )}
      {statusIdx >= 0 && statusIdx < statusColumns.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange(statusColumns[statusIdx + 1])
          }}
          className="text-xs text-chromara-lilac hover:text-chromara-purple"
        >
          Next →
        </button>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="text-chromara-purple text-xs hover:text-chromara-lilac"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-400 text-xs hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function IdeaModal({
  idea,
  onClose,
  onSave,
  supabase,
}: {
  idea: ContentIdea | null
  onClose: () => void
  onSave: () => void
  supabase: ReturnType<typeof createClient>
}) {
  const [formData, setFormData] = useState({
    title: idea?.title ?? '',
    description: idea?.description ?? '',
    platform: idea?.platform ?? [] as string[],
    category: idea?.category ?? 'educational',
    content_type: idea?.content_type ?? 'post',
    status: idea?.status ?? 'idea',
    priority: idea?.priority ?? 'medium',
    target_audience: idea?.target_audience ?? 'general',
    keywords: (idea?.keywords ?? []).join(', '),
    notes: idea?.notes ?? '',
    draft_content: idea?.draft_content ?? '',
  })
  const [saving, setSaving] = useState(false)

  const togglePlatform = (p: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: prev.platform.includes(p) ? prev.platform.filter((x) => x !== p) : [...prev.platform, p],
    }))
  }

  const submit = async () => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description || null,
        platform: formData.platform.length ? formData.platform : null,
        category: formData.category,
        content_type: formData.content_type,
        status: formData.status,
        priority: formData.priority,
        target_audience: formData.target_audience,
        keywords: formData.keywords
          ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : null,
        notes: formData.notes || null,
        draft_content: formData.draft_content || null,
        updated_at: new Date().toISOString(),
      }
      if (idea) {
        const { error } = await supabase.from('content_ideas').update(payload).eq('id', idea.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('content_ideas').insert(payload)
        if (error) throw error
      }
      onSave()
    } catch (e) {
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">{idea ? 'Edit Idea' : 'New Idea'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="glass-input w-full"
              placeholder="Idea title"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="glass-input w-full min-h-[80px]"
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.platform.includes(p) ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="glass-input w-full"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Content Type</label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData((p) => ({ ...p, content_type: e.target.value }))}
                className="glass-input w-full"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="glass-input w-full"
              >
                {STATUS_COLUMNS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Target Audience</label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData((p) => ({ ...p, target_audience: e.target.value }))}
                className="glass-input w-full"
              >
                {TARGET_AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Keywords (comma-separated)</label>
            <input
              value={formData.keywords}
              onChange={(e) => setFormData((p) => ({ ...p, keywords: e.target.value }))}
              className="glass-input w-full"
              placeholder="keyword1, keyword2"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              className="glass-input w-full min-h-[60px]"
              placeholder="Internal notes"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Draft Content</label>
            <textarea
              value={formData.draft_content}
              onChange={(e) => setFormData((p) => ({ ...p, draft_content: e.target.value }))}
              className="glass-input w-full min-h-[100px]"
              placeholder="Early draft of the content"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
