'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type Hashtag = {
  id: string
  hashtag: string
  category: string | null
  platform: string[] | null
  performance_score: number | null
  estimated_reach: string | null
  use_count: number
  notes: string | null
}

const CATEGORIES = ['beauty', 'tech', 'startup', 'innovation', 'founder', 'custom']
const PLATFORMS = ['twitter', 'linkedin', 'tiktok', 'pinterest', 'blog']
const REACH_LEVELS = ['low', 'medium', 'high', 'viral']

export default function HashtagLibraryPage() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingHashtag, setEditingHashtag] = useState<Hashtag | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Hashtag | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  const loadHashtags = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let query = supabase
        .from('hashtag_library')
        .select('*')
        .eq('user_id', user.id)
        .order('use_count', { ascending: false })
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory)
      }
      const { data, error } = await query
      if (error) throw error
      setHashtags((data as Hashtag[]) || [])
    } catch (e) {
      console.error(e)
      setHashtags([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHashtags()
  }, [filterCategory])

  const copyHashtag = async (hashtag: Hashtag) => {
    await navigator.clipboard.writeText('#' + hashtag.hashtag)
    setCopiedId(hashtag.id)
    setTimeout(() => setCopiedId(null), 1500)
    await supabase
      .from('hashtag_library')
      .update({
        use_count: hashtag.use_count + 1,
        last_used: new Date().toISOString(),
      })
      .eq('id', hashtag.id)
    loadHashtags()
  }

  const copyHashtagSet = (category: string) => {
    const categoryHashtags = hashtags
      .filter((h) => h.category === category)
      .slice(0, 10)
      .map((h) => '#' + h.hashtag)
      .join(' ')
    navigator.clipboard.writeText(categoryHashtags)
    setCopiedId('set-' + category)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const deleteHashtag = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('hashtag_library').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      loadHashtags()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const filteredHashtags = hashtags.filter((h) =>
    h.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
            Hashtag Library
          </h1>
          <p className="text-white/60 mt-2">Organize and track your hashtag performance</p>
        </div>
        <button
          onClick={() => {
            setEditingHashtag(null)
            setShowModal(true)
          }}
          className="glass-button px-6 py-3"
        >
          Add Hashtag
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 glass-input px-4 py-3"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input px-4 py-3 w-full md:w-48"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-4">Quick Copy Sets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => copyHashtagSet(cat)}
              disabled={hashtags.filter((h) => h.category === cat).length === 0}
              className="glass-button py-3 text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              #{cat}
              <span className="ml-2 text-xs text-white/60">
                ({hashtags.filter((h) => h.category === cat).length})
              </span>
              {copiedId === 'set-' + cat && (
                <span className="ml-2 text-xs text-green-400">✓ Copied</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : filteredHashtags.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">#</div>
          <h3 className="text-2xl font-bold text-white mb-2">No hashtags yet</h3>
          <p className="text-white/60 mb-6">Build your hashtag library</p>
          <button onClick={() => setShowModal(true)} className="glass-button px-8 py-3">
            Add Your First Hashtag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHashtags.map((hashtag) => (
            <div
              key={hashtag.id}
              className="glass-card p-4 hover:border-chromara-purple/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-chromara-purple">#{hashtag.hashtag}</h4>
                  <span className="text-xs text-white/60 capitalize">{hashtag.category || '—'}</span>
                </div>
                <button
                  onClick={() => copyHashtag(hashtag)}
                  className="glass-button px-3 py-1 text-xs"
                >
                  {copiedId === hashtag.id ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              {hashtag.notes && (
                <p className="text-white/70 text-sm mb-3 line-clamp-2">{hashtag.notes}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
                {hashtag.performance_score != null && <span>⭐ {hashtag.performance_score}/10</span>}
                {hashtag.estimated_reach && <span>📊 {hashtag.estimated_reach} reach</span>}
                <span>🔄 Used {hashtag.use_count}x</span>
              </div>
              {hashtag.platform && hashtag.platform.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {hashtag.platform.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => {
                    setEditingHashtag(hashtag)
                    setShowModal(true)
                  }}
                  className="text-chromara-purple text-xs hover:text-chromara-lilac"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(hashtag)}
                  className="text-red-400 text-xs hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <HashtagModal
          hashtag={editingHashtag}
          onClose={() => {
            setShowModal(false)
            setEditingHashtag(null)
          }}
          onSave={() => {
            loadHashtags()
            setShowModal(false)
            setEditingHashtag(null)
          }}
          supabase={supabase}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete hashtag?"
        message={deleteTarget ? `#${deleteTarget.hashtag} will be removed.` : ''}
        onConfirm={deleteHashtag}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function HashtagModal({
  hashtag,
  onClose,
  onSave,
  supabase,
}: {
  hashtag: Hashtag | null
  onClose: () => void
  onSave: () => void
  supabase: ReturnType<typeof createClient>
}) {
  const [formData, setFormData] = useState({
    hashtag: hashtag?.hashtag.replace(/^#/, '') ?? '',
    category: hashtag?.category ?? 'custom',
    platform: hashtag?.platform ?? [] as string[],
    performance_score: hashtag?.performance_score ?? '' as number | '',
    estimated_reach: hashtag?.estimated_reach ?? '',
    notes: hashtag?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const togglePlatform = (p: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: prev.platform.includes(p) ? prev.platform.filter((x) => x !== p) : [...prev.platform, p],
    }))
  }

  const submit = async () => {
    const tag = formData.hashtag.replace(/^#/, '').trim()
    if (!tag) {
      alert('Hashtag is required')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        hashtag: tag,
        category: formData.category,
        platform: formData.platform.length ? formData.platform : null,
        performance_score:
          formData.performance_score !== '' && formData.performance_score >= 1 && formData.performance_score <= 10
            ? formData.performance_score
            : null,
        estimated_reach: formData.estimated_reach || null,
        notes: formData.notes || null,
      }
      if (hashtag) {
        const { error } = await supabase.from('hashtag_library').update(payload).eq('id', hashtag.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('hashtag_library').insert(payload)
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
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">{hashtag ? 'Edit Hashtag' : 'Add Hashtag'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Hashtag * (without #)</label>
            <input
              value={formData.hashtag}
              onChange={(e) => setFormData((p) => ({ ...p, hashtag: e.target.value }))}
              className="glass-input w-full"
              placeholder="chromara"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="glass-input w-full"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
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
              <label className="block text-sm text-white/80 mb-1">Performance (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.performance_score}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    performance_score: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  }))
                }
                className="glass-input w-full"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Estimated Reach</label>
              <select
                value={formData.estimated_reach}
                onChange={(e) => setFormData((p) => ({ ...p, estimated_reach: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="">—</option>
                {REACH_LEVELS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              className="glass-input w-full min-h-[80px]"
              placeholder="Optional notes"
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
