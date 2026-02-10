'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type Keyword = {
  id: string
  keyword: string
  category: string | null
  search_volume: number | null
  competition: string | null
  relevance_score: number | null
  use_case: string | null
  related_keywords: string[] | null
  notes: string | null
}

const CATEGORIES = ['seo', 'pain_point', 'benefit', 'competitor', 'industry_term']
const USE_CASES = ['blog_seo', 'social_media', 'email_subject', 'ad_copy', 'website']

export default function KeywordLibraryPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'relevance' | 'search_volume' | 'competition'>('relevance')
  const [showModal, setShowModal] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Keyword | null>(null)
  const supabase = createClient()

  const loadKeywords = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('keyword_library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setKeywords((data as Keyword[]) || [])
    } catch (e) {
      console.error(e)
      setKeywords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKeywords()
  }, [])

  const deleteKeyword = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('keyword_library').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      loadKeywords()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const filteredAndSorted = useMemo(() => {
    let list = keywords.filter((k) => {
      if (filterCategory !== 'all' && k.category !== filterCategory) return false
      return true
    })
    if (sortBy === 'relevance') {
      list = [...list].sort(
        (a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0)
      )
    } else if (sortBy === 'search_volume') {
      list = [...list].sort(
        (a, b) => (b.search_volume ?? 0) - (a.search_volume ?? 0)
      )
    } else if (sortBy === 'competition') {
      const order = { low: 0, medium: 1, high: 2 }
      list = [...list].sort(
        (a, b) =>
          (order[a.competition as keyof typeof order] ?? 2) -
          (order[b.competition as keyof typeof order] ?? 2)
      )
    }
    return list
  }, [keywords, filterCategory, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
            Keyword Library
          </h1>
          <p className="text-white/60 mt-2">Track SEO keywords and content opportunities</p>
        </div>
        <button
          onClick={() => {
            setEditingKeyword(null)
            setShowModal(true)
          }}
          className="glass-button px-6 py-3"
        >
          Add Keyword
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">{keywords.length}</div>
          <div className="text-white/60 text-sm">Total Keywords</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {keywords.filter((k) => k.competition === 'low').length}
          </div>
          <div className="text-white/60 text-sm">Low Competition</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {keywords.filter((k) => (k.relevance_score ?? 0) >= 8).length}
          </div>
          <div className="text-white/60 text-sm">High Relevance</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-2xl font-bold text-white">
            {keywords
              .reduce((sum, k) => sum + (k.search_volume ?? 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-white/60 text-sm">Total Search Volume</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input px-4 py-3 w-full md:w-48"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'relevance' | 'search_volume' | 'competition')
            }
            className="glass-input px-4 py-3 w-full md:w-48"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="search_volume">Sort by Search Volume</option>
            <option value="competition">Sort by Competition</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h3 className="text-2xl font-bold text-white mb-2">No keywords yet</h3>
          <p className="text-white/60 mb-6">Start building your keyword library</p>
          <button onClick={() => setShowModal(true)} className="glass-button px-8 py-3">
            Add Your First Keyword
          </button>
        </div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/80 pb-3 pr-4">Keyword</th>
                <th className="text-left text-white/80 pb-3 pr-4">Category</th>
                <th className="text-left text-white/80 pb-3 pr-4">Search Volume</th>
                <th className="text-left text-white/80 pb-3 pr-4">Competition</th>
                <th className="text-left text-white/80 pb-3 pr-4">Relevance</th>
                <th className="text-left text-white/80 pb-3 pr-4">Use Case</th>
                <th className="text-left text-white/80 pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((keyword) => (
                <tr key={keyword.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-white">{keyword.keyword}</span>
                    {keyword.related_keywords && keyword.related_keywords.length > 0 && (
                      <div className="text-xs text-white/60 mt-1">
                        +{keyword.related_keywords.length} related
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-1 bg-chromara-purple/20 text-chromara-lilac rounded text-xs">
                      {keyword.category?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/70">
                    {keyword.search_volume != null
                      ? keyword.search_volume.toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        keyword.competition === 'low'
                          ? 'bg-green-500/20 text-green-300'
                          : keyword.competition === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {keyword.competition || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chromara-purple"
                          style={{
                            width: `${((keyword.relevance_score ?? 0) / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-white/70 text-sm">
                        {keyword.relevance_score ?? 0}/10
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/70 text-sm">
                    {keyword.use_case?.replace('_', ' ') || '—'}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        setEditingKeyword(keyword)
                        setShowModal(true)
                      }}
                      className="text-chromara-purple hover:text-chromara-lilac mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(keyword)}
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

      {showModal && (
        <KeywordModal
          keyword={editingKeyword}
          onClose={() => {
            setShowModal(false)
            setEditingKeyword(null)
          }}
          onSave={() => {
            loadKeywords()
            setShowModal(false)
            setEditingKeyword(null)
          }}
          supabase={supabase}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete keyword?"
        message={deleteTarget ? `"${deleteTarget.keyword}" will be removed.` : ''}
        onConfirm={deleteKeyword}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function KeywordModal({
  keyword,
  onClose,
  onSave,
  supabase,
}: {
  keyword: Keyword | null
  onClose: () => void
  onSave: () => void
  supabase: ReturnType<typeof createClient>
}) {
  const [formData, setFormData] = useState({
    keyword: keyword?.keyword ?? '',
    category: keyword?.category ?? 'seo',
    search_volume: keyword?.search_volume ?? '' as number | '',
    competition: keyword?.competition ?? 'medium',
    relevance_score: keyword?.relevance_score ?? '' as number | '',
    use_case: keyword?.use_case ?? '',
    related_keywords: (keyword?.related_keywords ?? []).join(', '),
    notes: keyword?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!formData.keyword.trim()) {
      alert('Keyword is required')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        keyword: formData.keyword.trim(),
        category: formData.category,
        search_volume:
          formData.search_volume !== '' && formData.search_volume >= 0
            ? formData.search_volume
            : null,
        competition: formData.competition || null,
        relevance_score:
          formData.relevance_score !== '' &&
          formData.relevance_score >= 1 &&
          formData.relevance_score <= 10
            ? formData.relevance_score
            : null,
        use_case: formData.use_case || null,
        related_keywords: formData.related_keywords
          ? formData.related_keywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
          : null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (keyword) {
        const { error } = await supabase
          .from('keyword_library')
          .update(payload)
          .eq('id', keyword.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('keyword_library').insert(payload)
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
        <h3 className="text-xl font-bold text-white mb-4">{keyword ? 'Edit Keyword' : 'Add Keyword'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Keyword *</label>
            <input
              value={formData.keyword}
              onChange={(e) => setFormData((p) => ({ ...p, keyword: e.target.value }))}
              className="glass-input w-full"
              placeholder="e.g. beauty tech startup"
            />
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
              <label className="block text-sm text-white/80 mb-1">Use Case</label>
              <select
                value={formData.use_case}
                onChange={(e) => setFormData((p) => ({ ...p, use_case: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="">—</option>
                {USE_CASES.map((u) => (
                  <option key={u} value={u}>{u.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Search Volume</label>
              <input
                type="number"
                min={0}
                value={formData.search_volume}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    search_volume: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  }))
                }
                className="glass-input w-full"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Competition</label>
              <select
                value={formData.competition}
                onChange={(e) => setFormData((p) => ({ ...p, competition: e.target.value }))}
                className="glass-input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Relevance (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.relevance_score}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    relevance_score: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  }))
                }
                className="glass-input w-full"
                placeholder="—"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Related Keywords (comma-separated)</label>
            <input
              value={formData.related_keywords}
              onChange={(e) => setFormData((p) => ({ ...p, related_keywords: e.target.value }))}
              className="glass-input w-full"
              placeholder="keyword1, keyword2"
            />
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
