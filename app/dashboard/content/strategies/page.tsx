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
  status?: 'active' | 'testing' | 'paused'
  category?: string | string[]
}

type StrategyStatus = 'active' | 'testing' | 'paused'

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

function FloatingPulsingOrb({ status }: { status: StrategyStatus; id: string }) {
  if (status === 'paused') return <div className="w-2.5 h-2.5 rounded-full bg-[#503A6A]/60" />
  return (
    <div
      className="w-3 h-3 rounded-full animate-[orb-pulse_2s_ease-in-out_infinite]"
      style={{ backgroundColor: '#8C52FF', boxShadow: '0 0 12px rgba(140,82,255,0.6)' }}
    />
  )
}

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
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, px: 500, py: 400 })
  const supabase = createClient()

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCursorPos({ x, y, px: e.clientX, py: e.clientY })
  }

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

  const getStatus = (s: PlatformStrategy | undefined): StrategyStatus => {
    if (!s) return 'paused'
    return (s.status as StrategyStatus) || 'active'
  }
  const getCategories = (s: PlatformStrategy | undefined, platform: string): string[] => {
    if (s?.content_pillars?.length) return s.content_pillars.slice(0, 4)
    const defaults: Record<string, string> = {
      twitter: 'SOCIAL',
      linkedin: 'B2B',
      tiktok: 'DTC',
      pinterest: 'DTC',
      blog: 'B2B',
      email: 'B2B',
    }
    return [defaults[platform] || 'SOCIAL']
  }

  const roiProgress = (s: PlatformStrategy | undefined) => {
    if (!s?.current_stats || !s?.goals || Object.keys(s.goals).length === 0) return 0.45
    const pct = Object.keys(s.goals).slice(0, 3).reduce((sum, k) => {
      const curr = (s.current_stats ?? {})[k] ?? 0
      const goal = (s.goals ?? {})[k] || 1
      return sum + (curr / goal) * 100
    }, 0) / Math.min(3, Object.keys(s.goals).length)
    return Math.min(1, pct / 100)
  }

  return (
    <div
      className="min-h-screen -m-6 -mb-0 p-6 lg:p-8 relative overflow-hidden"
      style={{ backgroundColor: '#050505' }}
      onMouseMove={handleMouseMove}
    >
      {/* Full-screen Aura: shifting Chromara Purple + Lilac, backlit gemstone */}
      <div
        className="pointer-events-none fixed inset-0 z-0 blur-3xl animate-[aura-shift_12s_ease-in-out_infinite]"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 20% 30%, rgba(140,82,255,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 70% 70% at 80% 70%, rgba(200,182,226,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(140,82,255,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* Nova Cursor: soft Lilac follow-light illuminating the page */}
      <div
        className="pointer-events-none fixed z-[100] w-[32rem] h-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,top] duration-100 ease-out"
        style={{
          left: cursorPos.px || 0,
          top: cursorPos.py || 0,
          background: 'radial-gradient(circle, rgba(200,182,226,0.14) 0%, rgba(140,82,255,0.05) 35%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle 400px at ${cursorPos.x}% ${cursorPos.y}%, rgba(200,182,226,0.08) 0%, transparent 50%)`,
        }}
      />

      {/* Grain overlay - satin texture */}
      <div className="strategies-grain fixed inset-0 z-[1] opacity-[0.035]" />

      {/* North Star - massive behind content */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
        <span
          className="block text-[8rem] md:text-[12rem] font-thin text-[#CBCBC0]/10 whitespace-nowrap"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          TARGET: $2M ARR
        </span>
      </div>

      {/* Pinned header - Executive Monolith */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 px-6 pt-6 pb-4 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1
              className="text-2xl md:text-3xl font-light uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#C4B5FD] via-[#A855F7] to-[#503A6A]"
              style={{ letterSpacing: '0.4em' }}
            >
              Platform Strategies
            </h1>
            <p className="text-[#503A6A]/80 text-sm mt-1 font-light tracking-wide">
              Primary GTM objective: scale channel-led growth across social & content
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStrategy(null)
              setShowModal(true)
            }}
            className="border border-[#CBCBC0]/60 text-[#CBCBC0] bg-transparent px-6 py-3 rounded-lg text-sm font-medium tracking-wide hover:bg-[#8C52FF] hover:border-[#8C52FF] hover:text-white transition-all shrink-0"
          >
            Add Strategy
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-[#503A6A]/80 py-12 text-center font-jetbrains text-sm relative z-10">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {PLATFORMS.map((platform) => {
            const strategy = strategies.find((s) => s.platform === platform)
            const status = getStatus(strategy)
            const categories = getCategories(strategy, platform)
            const isSelected = selectedStrategy?.id === strategy?.id
            const progress = roiProgress(strategy)

            return (
              <div
                key={platform}
                onClick={() => strategy && setSelectedStrategy(strategy)}
                className={`
                  relative overflow-hidden rounded-xl p-6 cursor-pointer group
                  bg-[rgba(200,182,226,0.05)] backdrop-blur-[60px]
                  transition-all duration-300
                  drop-shadow-[0_0_30px_rgba(140,82,255,0.15)]
                  hover:bg-[rgba(200,182,226,0.09)] group-hover:drop-shadow-[0_0_40px_rgba(140,82,255,0.2)]
                  ${strategy ? '' : 'opacity-90'}
                  ${isSelected ? 'ring-1 ring-[#8C52FF]/60 drop-shadow-[0_0_40px_rgba(140,82,255,0.25)]' : ''}
                `}
                style={{
                  border: '1px solid transparent',
                  backgroundImage: 'linear-gradient(rgba(200,182,226,0.05), rgba(200,182,226,0.05)), linear-gradient(135deg, #8C52FF, #C8B6E2, transparent 80%)',
                  backgroundOrigin: 'padding-box, border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{PLATFORM_ICONS[platform]}</span>
                      <h3
                        className="text-sm font-light text-[#C8B6E2] uppercase"
                        style={{ letterSpacing: '0.4em' }}
                      >
                        {platform}
                      </h3>
                    </div>
                    <FloatingPulsingOrb status={status} id={platform} />
                  </div>

                  {/* Micro-glass pills - dimmed Deep Violet */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter text-[#503A6A]/90"
                        style={{
                          background: 'rgba(80,58,106,0.15)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: 'inset 0 0 8px rgba(140,82,255,0.05)',
                        }}
                      >
                        {typeof cat === 'string' ? cat.replace(/_/g, ' ') : cat}
                      </span>
                    ))}
                  </div>

                  {strategy ? (
                    <>
                      <p className="text-[#C8B6E2]/90 text-sm mb-3 leading-relaxed font-light">
                        {strategy.objective || '—'}
                      </p>
                      {strategy.posting_frequency && (
                        <p className="font-jetbrains text-xs text-[#503A6A]/70 mb-3">
                          {strategy.posting_frequency.replace(/_/g, ' ')}
                        </p>
                      )}
                      {strategy.current_stats && (
                        <p className="font-jetbrains text-[10px] text-[#503A6A]/60 mb-3">
                          {Object.entries(strategy.current_stats).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}

                      {/* Burn/Value ratio bar */}
                      <div className="mt-4 pt-4 border-t border-[#503A6A]/30">
                        <div className="h-1 w-full bg-[#503A6A]/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8C52FF] transition-all duration-500"
                            style={{
                              width: `${progress * 100}%`,
                              boxShadow: '0 0 8px rgba(140,82,255,0.5)',
                            }}
                          />
                        </div>
                        <p className="font-jetbrains text-[10px] text-[#503A6A]/70 mt-1">
                          ROI Progress · {Math.round(progress * 100)}%
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-[#503A6A]/30 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingStrategy(strategy)
                            setShowModal(true)
                          }}
                          className="text-[#8C52FF] text-xs font-medium"
                          style={{ textShadow: '0 0 10px rgba(140,82,255,0.5)' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(strategy)
                          }}
                          className="text-red-400/80 text-xs hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#503A6A]/70 text-sm mb-4 font-jetbrains">No strategy set</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openCreateForPlatform(platform)
                        }}
                        className="border border-[#503A6A]/50 text-[#C8B6E2]/90 px-4 py-2 rounded-lg text-xs hover:bg-[#8C52FF]/20 hover:border-[#8C52FF]/50 transition-all"
                      >
                        Create Strategy
                      </button>
                    </div>
                  )}
                </div>
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
    status: (strategy?.status as StrategyStatus) ?? 'active',
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
        status: formData.status || 'active',
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
            <label className="block text-sm text-white/80 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as StrategyStatus }))}
              className="glass-input w-full"
            >
              <option value="active">Active / Scaling</option>
              <option value="testing">Testing</option>
              <option value="paused">Paused</option>
            </select>
          </div>
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
