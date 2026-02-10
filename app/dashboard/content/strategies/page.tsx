'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type PlatformStrategy = {
  id: string
  platform: string
  objective: string
  target_audience: string | null
  content_pillars: string[] | null
  posting_frequency: string | null
  best_times_to_post: string[] | null
  content_formats: string[] | null
  key_metrics: string[] | null
  current_stats: Record<string, number> | null
  goals: Record<string, number> | null
  strategy_notes: string | null
  examples: string | null
}

const PLATFORMS = ['twitter', 'linkedin', 'tiktok', 'pinterest', 'blog', 'email']
const PLATFORM_ICONS: Record<string, string> = {
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  pinterest: '📌',
  blog: '📝',
  email: '📧',
}
const POSTING_FREQUENCIES = ['daily', '3x_week', 'weekly', 'bi_weekly']
const BEST_TIMES = ['6am', '9am', '12pm', '3pm', '5pm', '7pm', '9pm']
const CONTENT_FORMATS = ['carousel', 'video', 'text_post', 'article', 'story', 'reel']
const KEY_METRICS = ['engagement_rate', 'follower_growth', 'waitlist_signups', 'website_clicks', 'reach']

export default function PlatformStrategiesPage() {
  const [strategies, setStrategies] = useState<PlatformStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<PlatformStrategy | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<PlatformStrategy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlatformStrategy | null>(null)
  const supabase = createClient()

  const loadStrategies = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('platform_strategies')
        .select('*')
        .eq('user_id', user.id)
      if (error) throw error
      setStrategies((data as PlatformStrategy[]) || [])
    } catch (e) {
      console.error(e)
      setStrategies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStrategies()
  }, [])

  const deleteStrategy = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase
        .from('platform_strategies')
        .delete()
        .eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      setSelectedStrategy(null)
      loadStrategies()
    } catch (e) {
      alert('Failed to delete')
    }
  }

  const openCreateForPlatform = (platform: string) => {
    setEditingStrategy({
      id: '',
      platform,
      objective: '',
      target_audience: null,
      content_pillars: null,
      posting_frequency: null,
      best_times_to_post: null,
      content_formats: null,
      key_metrics: null,
      current_stats: null,
      goals: null,
      strategy_notes: null,
      examples: null,
    } as PlatformStrategy)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
            Platform Strategies
          </h1>
          <p className="text-white/60 mt-2">Your content playbook for each channel</p>
        </div>
        <button
          onClick={() => {
            setEditingStrategy(null)
            setShowModal(true)
          }}
          className="glass-button px-6 py-3"
        >
          Add Strategy
        </button>
      </div>

      {loading ? (
        <div className="text-white/50 py-12 text-center">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => {
            const strategy = strategies.find((s) => s.platform === platform)
            return (
              <div
                key={platform}
                onClick={() => strategy && setSelectedStrategy(strategy)}
                className={`glass-card p-6 transition-all cursor-pointer group ${
                  strategy ? 'hover:border-chromara-purple/50' : ''
                } ${selectedStrategy?.id === strategy?.id ? 'ring-2 ring-chromara-purple' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{PLATFORM_ICONS[platform]}</span>
                    <h3 className="text-xl font-bold text-white capitalize">{platform}</h3>
                  </div>
                  {strategy ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                      Not Set
                    </span>
                  )}
                </div>

                {strategy ? (
                  <>
                    <p className="text-white/80 mb-4">
                      <strong>Objective:</strong>{' '}
                      {strategy.objective || '—'}
                    </p>
                    {strategy.posting_frequency && (
                      <p className="text-white/70 text-sm mb-2">
                        📅 {strategy.posting_frequency.replace('_', ' ')}
                      </p>
                    )}
                    {strategy.content_pillars && strategy.content_pillars.length > 0 && (
                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Content Pillars:</p>
                        <div className="flex flex-wrap gap-2">
                          {strategy.content_pillars.slice(0, 3).map((pillar) => (
                            <span
                              key={pillar}
                              className="px-2 py-1 bg-chromara-purple/20 text-chromara-lilac rounded text-xs"
                            >
                              {pillar.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {strategy.current_stats && strategy.goals && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="text-xs text-white/60 mb-2">Progress to Goals</div>
                        {Object.keys(strategy.goals).slice(0, 3).map((metric) => (
                          <div key={metric} className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/70 capitalize">
                                {metric.replace(/_/g, ' ')}
                              </span>
                              <span className="text-white/60">
                                {strategy.current_stats[metric] ?? 0} / {strategy.goals[metric]}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-chromara-purple"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((strategy.current_stats[metric] ?? 0) / strategy.goals[metric]) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingStrategy(strategy)
                          setShowModal(true)
                        }}
                        className="text-chromara-purple text-xs hover:text-chromara-lilac"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(strategy)
                        }}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 mb-4">No strategy set</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openCreateForPlatform(platform)
                      }}
                      className="glass-button px-4 py-2 text-sm"
                    >
                      Create Strategy
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedStrategy && (
        <StrategyDetailModal
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          onEdit={() => {
            setEditingStrategy(selectedStrategy)
            setShowModal(true)
            setSelectedStrategy(null)
          }}
        />
      )}

      {showModal && (
        <StrategyModal
          strategy={editingStrategy}
          onClose={() => {
            setShowModal(false)
            setEditingStrategy(null)
          }}
          onSave={() => {
            loadStrategies()
            setShowModal(false)
            setEditingStrategy(null)
          }}
          supabase={supabase}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete strategy?"
        message={
          deleteTarget
            ? `Strategy for ${deleteTarget.platform} will be removed.`
            : ''
        }
        onConfirm={deleteStrategy}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function StrategyDetailModal({
  strategy,
  onClose,
  onEdit,
}: {
  strategy: PlatformStrategy
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
            <span>{PLATFORM_ICONS[strategy.platform]}</span>
            {strategy.platform} Strategy
          </h3>
          <div className="flex gap-2">
            <button onClick={onEdit} className="glass-button px-4 py-2">
              Edit
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">
              Close
            </button>
          </div>
        </div>
        <div className="space-y-4 text-white/90">
          <div>
            <strong className="text-white">Objective:</strong> {strategy.objective || '—'}
          </div>
          {strategy.target_audience && (
            <div>
              <strong className="text-white">Target Audience:</strong>{' '}
              {strategy.target_audience}
            </div>
          )}
          {strategy.posting_frequency && (
            <div>
              <strong className="text-white">Posting Frequency:</strong>{' '}
              {strategy.posting_frequency.replace(/_/g, ' ')}
            </div>
          )}
          {strategy.best_times_to_post && strategy.best_times_to_post.length > 0 && (
            <div>
              <strong className="text-white">Best Times:</strong>{' '}
              {strategy.best_times_to_post.join(', ')}
            </div>
          )}
          {strategy.content_pillars && strategy.content_pillars.length > 0 && (
            <div>
              <strong className="text-white">Content Pillars:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {strategy.content_pillars.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-1 bg-chromara-purple/20 text-chromara-lilac rounded text-sm"
                  >
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {strategy.content_formats && strategy.content_formats.length > 0 && (
            <div>
              <strong className="text-white">Content Formats:</strong>{' '}
              {strategy.content_formats.map((f) => f.replace(/_/g, ' ')).join(', ')}
            </div>
          )}
          {strategy.current_stats && Object.keys(strategy.current_stats).length > 0 && (
            <div>
              <strong className="text-white">Current Stats:</strong>
              <pre className="mt-2 p-4 bg-black/30 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(strategy.current_stats, null, 2)}
              </pre>
            </div>
          )}
          {strategy.goals && Object.keys(strategy.goals).length > 0 && (
            <div>
              <strong className="text-white">Goals:</strong>
              <pre className="mt-2 p-4 bg-black/30 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(strategy.goals, null, 2)}
              </pre>
            </div>
          )}
          {strategy.strategy_notes && (
            <div>
              <strong className="text-white">Strategy Notes:</strong>
              <p className="mt-2 text-white/80 whitespace-pre-wrap">{strategy.strategy_notes}</p>
            </div>
          )}
          {strategy.examples && (
            <div>
              <strong className="text-white">Examples:</strong>
              <p className="mt-2 text-white/80 whitespace-pre-wrap">{strategy.examples}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StrategyModal({
  strategy,
  onClose,
  onSave,
  supabase,
}: {
  strategy: PlatformStrategy | null
  onClose: () => void
  onSave: () => void
  supabase: ReturnType<typeof createClient>
}) {
  const [formData, setFormData] = useState({
    platform: strategy?.platform ?? 'twitter',
    objective: strategy?.objective ?? '',
    target_audience: strategy?.target_audience ?? '',
    content_pillars: (strategy?.content_pillars ?? []).join(', '),
    posting_frequency: strategy?.posting_frequency ?? '',
    best_times_to_post: strategy?.best_times_to_post ?? [] as string[],
    content_formats: strategy?.content_formats ?? [] as string[],
    key_metrics: strategy?.key_metrics ?? [] as string[],
    current_stats: strategy?.current_stats
      ? JSON.stringify(strategy.current_stats, null, 2)
      : '{\n  "followers": 0,\n  "engagement_rate": 0,\n  "monthly_reach": 0\n}',
    goals: strategy?.goals
      ? JSON.stringify(strategy.goals, null, 2)
      : '{\n  "followers": 5000,\n  "engagement_rate": 12,\n  "monthly_reach": 50000\n}',
    strategy_notes: strategy?.strategy_notes ?? '',
    examples: strategy?.examples ?? '',
  })
  const [saving, setSaving] = useState(false)

  const toggleArray = (field: 'best_times_to_post' | 'content_formats' | 'key_metrics', val: string) => {
    setFormData((prev) => {
      const arr = prev[field]
      const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
      return { ...prev, [field]: next }
    })
  }

  const submit = async () => {
    if (!formData.objective.trim()) {
      alert('Objective is required')
      return
    }
    let currentStats: Record<string, number> | null = null
    let goals: Record<string, number> | null = null
    try {
      currentStats = JSON.parse(formData.current_stats) as Record<string, number>
    } catch {
      alert('Invalid JSON in Current Stats')
      return
    }
    try {
      goals = JSON.parse(formData.goals) as Record<string, number>
    } catch {
      alert('Invalid JSON in Goals')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        platform: formData.platform,
        objective: formData.objective.trim(),
        target_audience: formData.target_audience || null,
        content_pillars: formData.content_pillars
          ? formData.content_pillars.split(',').map((p) => p.trim()).filter(Boolean)
          : null,
        posting_frequency: formData.posting_frequency || null,
        best_times_to_post:
          formData.best_times_to_post.length > 0 ? formData.best_times_to_post : null,
        content_formats:
          formData.content_formats.length > 0 ? formData.content_formats : null,
        key_metrics: formData.key_metrics.length > 0 ? formData.key_metrics : null,
        current_stats: currentStats,
        goals,
        strategy_notes: formData.strategy_notes || null,
        examples: formData.examples || null,
        updated_at: new Date().toISOString(),
      }
      if (strategy?.id) {
        const { error } = await supabase
          .from('platform_strategies')
          .update(payload)
          .eq('id', strategy.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('platform_strategies').insert(payload)
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
        className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">
          {strategy?.id ? 'Edit Strategy' : 'Add Strategy'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Platform *</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))}
              className="glass-input w-full"
              disabled={!!strategy?.id}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Objective *</label>
            <input
              value={formData.objective}
              onChange={(e) => setFormData((p) => ({ ...p, objective: e.target.value }))}
              className="glass-input w-full"
              placeholder="e.g. brand_awareness, thought_leadership"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Target Audience</label>
            <input
              value={formData.target_audience}
              onChange={(e) => setFormData((p) => ({ ...p, target_audience: e.target.value }))}
              className="glass-input w-full"
              placeholder="e.g. beauty brands, investors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Content Pillars (comma-separated)</label>
            <input
              value={formData.content_pillars}
              onChange={(e) => setFormData((p) => ({ ...p, content_pillars: e.target.value }))}
              className="glass-input w-full"
              placeholder="founder_journey, product_education"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Posting Frequency</label>
            <select
              value={formData.posting_frequency}
              onChange={(e) => setFormData((p) => ({ ...p, posting_frequency: e.target.value }))}
              className="glass-input w-full"
            >
              <option value="">—</option>
              {POSTING_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">Best Times to Post</label>
            <div className="flex flex-wrap gap-2">
              {BEST_TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleArray('best_times_to_post', t)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.best_times_to_post.includes(t)
                      ? 'bg-chromara-purple text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">Content Formats</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleArray('content_formats', f)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.content_formats.includes(f)
                      ? 'bg-chromara-purple text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-2">Key Metrics</label>
            <div className="flex flex-wrap gap-2">
              {KEY_METRICS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArray('key_metrics', m)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    formData.key_metrics.includes(m)
                      ? 'bg-chromara-purple text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {m.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Current Stats (JSON)</label>
            <textarea
              value={formData.current_stats}
              onChange={(e) => setFormData((p) => ({ ...p, current_stats: e.target.value }))}
              className="glass-input w-full min-h-[120px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Goals (JSON)</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData((p) => ({ ...p, goals: e.target.value }))}
              className="glass-input w-full min-h-[120px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Strategy Notes</label>
            <textarea
              value={formData.strategy_notes}
              onChange={(e) => setFormData((p) => ({ ...p, strategy_notes: e.target.value }))}
              className="glass-input w-full min-h-[80px]"
              placeholder="Your strategic notes"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Examples (links to successful posts)</label>
            <textarea
              value={formData.examples}
              onChange={(e) => setFormData((p) => ({ ...p, examples: e.target.value }))}
              className="glass-input w-full min-h-[80px]"
              placeholder="URLs or notes"
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
