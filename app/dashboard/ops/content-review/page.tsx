'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  getSeedAssets,
  LENS_CHECKLISTS,
  assetToRow,
  rowToAsset,
  type Asset,
  type ReviewLens,
  type LensStatus,
  type LensReview,
  type AssetStatus,
} from './data'
import { createClient } from '@/lib/supabase'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const LENS_LABELS: Record<ReviewLens, string> = {
  legal_compliance: 'Legal & compliance',
  brand_ethics: 'Brand & ethics',
  ux_safety: 'UX, safety & experience',
}

const STATUS_LABELS: Record<AssetStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  blocked: 'Blocked',
  archived: 'Archived',
}

const RISK_COLORS = {
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const LENS_STATUS_COLORS: Record<LensStatus, string> = {
  not_started: 'text-white/50',
  in_review: 'text-amber-300',
  changes_requested: 'text-red-300',
  approved: 'text-green-300',
}

// --- Workflow helpers (can be moved to API later) ---

function deriveAssetStatus(asset: Asset): AssetStatus {
  const lenses = [asset.legalReview, asset.brandReview, asset.uxReview]
  const anyChangesRequested = lenses.some((l) => l.status === 'changes_requested')
  if (anyChangesRequested && asset.riskLevel === 'high') return 'blocked'
  const allApproved = lenses.every((l) => l.status === 'approved')
  if (allApproved) return 'approved'
  const anyInReview = lenses.some((l) => l.status === 'in_review' || l.status === 'changes_requested')
  if (anyInReview) return 'in_review'
  return asset.status === 'approved' || asset.status === 'blocked' ? asset.status : 'draft'
}

function updateLensAndDeriveStatus(
  asset: Asset,
  lens: ReviewLens,
  update: Partial<LensReview>
): Asset {
  const key = lens === 'legal_compliance' ? 'legalReview' : lens === 'brand_ethics' ? 'brandReview' : 'uxReview'
  const next = { ...asset, [key]: { ...asset[key], ...update, lastUpdated: new Date().toISOString() } }
  next.status = deriveAssetStatus(next)
  return next
}

export default function ContentReviewPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'all'>('all')
  const [filterRisk, setFilterRisk] = useState<'low' | 'medium' | 'high' | 'all'>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterAssetType, setFilterAssetType] = useState<string>('all')
  const [filterLensNotApproved, setFilterLensNotApproved] = useState<ReviewLens | 'all'>('all')
  const [comments, setComments] = useState<{ id: string; text: string; at: string }[]>([])
  const [newComment, setNewComment] = useState('')
  const supabase = createClient()

  // Load assets from Supabase (cloud backup). Seed demo data if empty.
  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data: rows, error } = await supabase
        .from('content_review_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (error) {
        console.error('Content review load error:', error)
        setLoading(false)
        return
      }
      if (!cancelled) {
        if (rows && rows.length > 0) {
          setAssets(rows.map((r) => rowToAsset(r as any)))
        } else {
          const seed = getSeedAssets()
          const toInsert = seed.map((a) => assetToRow(a, user.id))
          const { error: insertErr } = await supabase.from('content_review_assets').insert(toInsert)
          if (!insertErr && !cancelled) {
            setAssets(seed)
          }
        }
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Load comments for selected asset
  useEffect(() => {
    if (!selectedId) {
      setComments([])
      return
    }
    let cancelled = false
    supabase
      .from('content_review_comments')
      .select('id, text, created_at')
      .eq('asset_id', selectedId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error) return
        setComments((data ?? []).map((c) => ({ id: c.id, text: c.text, at: c.created_at })))
      })
    return () => { cancelled = true }
  }, [selectedId])

  const lensKey = filterLensNotApproved === 'legal_compliance' ? 'legalReview' : filterLensNotApproved === 'brand_ethics' ? 'brandReview' : 'uxReview'
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (search) {
        const q = search.toLowerCase()
        if (!a.title.toLowerCase().includes(q) && !a.tags.some((t) => t.toLowerCase().includes(q))) return false
      }
      if (filterStatus !== 'all' && a.status !== filterStatus) return false
      if (filterRisk !== 'all' && a.riskLevel !== filterRisk) return false
      if (filterChannel !== 'all' && a.channel !== filterChannel) return false
      if (filterAssetType !== 'all' && a.assetType !== filterAssetType) return false
      if (filterLensNotApproved !== 'all') {
        const r = lensKey === 'legalReview' ? a.legalReview : lensKey === 'brandReview' ? a.brandReview : a.uxReview
        if (r.status === 'approved') return false
      }
      return true
    })
  }, [assets, search, filterStatus, filterRisk, filterChannel, filterAssetType, filterLensNotApproved, lensKey])

  const selectedAsset = selectedId ? (assets.find((a) => a.id === selectedId) ?? null) : null

  const updateAsset = useCallback((id: string, next: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? next : a)))
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setSaving(true)
      const row = assetToRow(next, user.id)
      await supabase.from('content_review_assets').upsert(
        { ...row, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
      setSaving(false)
    })()
  }, [])

  const addComment = useCallback(async () => {
    if (!selectedId) return
    const text = newComment.trim()
    if (!text) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: inserted, error } = await supabase
      .from('content_review_comments')
      .insert({ asset_id: selectedId, user_id: user.id, text })
      .select('id, text, created_at')
      .single()
    if (!error && inserted) {
      setComments((prev) => [...prev, { id: inserted.id, text: inserted.text, at: inserted.created_at }])
      setNewComment('')
    }
  }, [selectedId, newComment])

  const channels = useMemo(() => [...new Set(assets.map((a) => a.channel))], [assets])
  const assetTypes = useMemo(() => [...new Set(assets.map((a) => a.assetType))], [assets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
            Content Review Hub
          </h1>
          <p className="text-white/60 mt-2">Three-lens asset review: Legal, Brand, UX. Saved to the cloud.</p>
        </div>
        {saving && <span className="text-sm text-white/50">Saving…</span>}
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-white/60">Loading…</div>
      ) : selectedAsset ? (
        <AssetDetailView
          asset={selectedAsset}
          onBack={() => setSelectedId(null)}
          onUpdate={(next) => updateAsset(selectedAsset.id, next)}
          comments={comments}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onAddComment={addComment}
        />
      ) : (
        <>
          <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by title or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input pl-9 pr-4 py-2 w-full"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'all')} className="glass-input px-4 py-2">
              <option value="all">All statuses</option>
              {(Object.entries(STATUS_LABELS) as [AssetStatus, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value as 'low' | 'medium' | 'high' | 'all')} className="glass-input px-4 py-2">
              <option value="all">All risk</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="glass-input px-4 py-2">
              <option value="all">All channels</option>
              {channels.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={filterAssetType} onChange={(e) => setFilterAssetType(e.target.value)} className="glass-input px-4 py-2">
              <option value="all">All types</option>
              {assetTypes.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={filterLensNotApproved} onChange={(e) => setFilterLensNotApproved(e.target.value as ReviewLens | 'all')} className="glass-input px-4 py-2">
              <option value="all">Any lens</option>
              <option value="legal_compliance">Legal not approved</option>
              <option value="brand_ethics">Brand not approved</option>
              <option value="ux_safety">UX not approved</option>
            </select>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 text-left text-sm text-white/70">
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Channel</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Risk</th>
                    <th className="p-4 font-semibold">Legal</th>
                    <th className="p-4 font-semibold">Brand</th>
                    <th className="p-4 font-semibold">UX</th>
                    <th className="p-4 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const lastUpdated = [asset.legalReview.lastUpdated, asset.brandReview.lastUpdated, asset.uxReview.lastUpdated].sort().pop()!
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedId(asset.id)}
                        className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-medium text-white">{asset.title}</td>
                        <td className="p-4 text-white/80">{asset.channel}</td>
                        <td className="p-4 text-white/80">{asset.assetType.replace(/_/g, ' ')}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/20">
                            {STATUS_LABELS[asset.status]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${RISK_COLORS[asset.riskLevel]}`}>
                            {asset.riskLevel}
                          </span>
                        </td>
                        <td className={`p-4 text-sm ${LENS_STATUS_COLORS[asset.legalReview.status]}`}>{asset.legalReview.status.replace('_', ' ')}</td>
                        <td className={`p-4 text-sm ${LENS_STATUS_COLORS[asset.brandReview.status]}`}>{asset.brandReview.status.replace('_', ' ')}</td>
                        <td className={`p-4 text-sm ${LENS_STATUS_COLORS[asset.uxReview.status]}`}>{asset.uxReview.status.replace('_', ' ')}</td>
                        <td className="p-4 text-white/60 text-sm">{formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredAssets.length === 0 && (
              <div className="p-12 text-center text-white/50">No assets match filters.</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


function AssetDetailView({
  asset,
  onBack,
  onUpdate,
  comments,
  newComment,
  onNewCommentChange,
  onAddComment,
}: {
  asset: Asset
  onBack: () => void
  onUpdate: (next: Asset) => void
  comments: { id: string; text: string; at: string }[]
  newComment: string
  onNewCommentChange: (v: string) => void
  onAddComment: () => void
}) {
  const [expandedLens, setExpandedLens] = useState<ReviewLens | null>('legal_compliance')

  const setLensStatus = (lens: ReviewLens, status: LensStatus) => {
    const key = lens === 'legal_compliance' ? 'legalReview' : lens === 'brand_ethics' ? 'brandReview' : 'uxReview'
    const review = asset[key]
    onUpdate(updateLensAndDeriveStatus(asset, lens, { ...review, status, reviewerName: review.reviewerName || 'Reviewer' }))
  }

  const setChecklistResponse = (lens: ReviewLens, itemId: string, passed: boolean, notes?: string) => {
    const key = lens === 'legal_compliance' ? 'legalReview' : lens === 'brand_ethics' ? 'brandReview' : 'uxReview'
    const review = asset[key]
    const nextResponses = review.checklistResponses.map((r) =>
      r.itemId === itemId ? { ...r, passed, notes } : r
    )
    onUpdate(updateLensAndDeriveStatus(asset, lens, { ...review, checklistResponses: nextResponses }))
  }

  const setOverallNotes = (lens: ReviewLens, overallNotes: string) => {
    const key = lens === 'legal_compliance' ? 'legalReview' : lens === 'brand_ethics' ? 'brandReview' : 'uxReview'
    const review = asset[key]
    onUpdate(updateLensAndDeriveStatus(asset, lens, { ...review, overallNotes }))
  }

  const isUrl = (s?: string) => s && /^https?:\/\//i.test(s)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{asset.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${RISK_COLORS[asset.riskLevel]}`}>
                {STATUS_LABELS[asset.status]}
              </span>
              <span className="text-white/60 text-sm">{asset.channel}</span>
              <span className="text-white/60 text-sm">{asset.assetType.replace(/_/g, ' ')}</span>
              <span className="text-white/60 text-sm">by {asset.createdBy}</span>
              <span className="text-white/60 text-sm">{formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}</span>
            </div>
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {asset.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {asset.description && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Asset summary</h3>
            <p className="text-white/90 text-sm">{asset.description}</p>
          </div>
        )}
        {asset.linkOrPath && (
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Link / file reference</h3>
            {isUrl(asset.linkOrPath) ? (
              <a href={asset.linkOrPath} target="_blank" rel="noopener noreferrer" className="text-chromara-purple hover:underline inline-flex items-center gap-1">
                {asset.linkOrPath} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-white/80">{asset.linkOrPath}</span>
            )}
          </div>
        )}
      </div>

      {(['legal_compliance', 'brand_ethics', 'ux_safety'] as const).map((lens) => {
        const review = lens === 'legal_compliance' ? asset.legalReview : lens === 'brand_ethics' ? asset.brandReview : asset.uxReview
        const items = LENS_CHECKLISTS[lens]
        const isExpanded = expandedLens === lens
        return (
          <div key={lens} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpandedLens(isExpanded ? null : lens)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-semibold text-white">{LENS_LABELS[lens]}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${LENS_STATUS_COLORS[review.status]}`}>{review.status.replace('_', ' ')}</span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronRight className="w-4 h-4 text-white/60" />}
              </div>
            </button>
            {isExpanded && (
              <div className="p-4 pt-0 border-t border-white/10 space-y-4">
                {review.reviewerName && <p className="text-sm text-white/60">Reviewer: {review.reviewerName} · {formatDistanceToNow(new Date(review.lastUpdated), { addSuffix: true })}</p>}
                <ul className="space-y-3">
                  {items.map((item) => {
                    const resp = review.checklistResponses.find((r) => r.itemId === item.id)
                    const passed = resp?.passed ?? false
                    return (
                      <li key={item.id} className="flex items-start gap-3">
                        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={passed}
                            onChange={(e) => setChecklistResponse(lens, item.id, e.target.checked)}
                            className="rounded border-white/30 bg-white/10 text-chromara-purple focus:ring-chromara-purple"
                          />
                          <span className="text-white/90 text-sm">{item.label}</span>
                        </label>
                        <span className="text-white/40 flex-shrink-0" title={item.description}>
                          <Info className="w-4 h-4 inline" />
                        </span>
                        <input
                          type="text"
                          placeholder="Notes"
                          value={resp?.notes ?? ''}
                          onChange={(e) => setChecklistResponse(lens, item.id, passed, e.target.value)}
                          className="glass-input flex-1 min-w-0 text-sm py-1"
                        />
                      </li>
                    )
                  })}
                </ul>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Overall notes</label>
                  <textarea
                    value={review.overallNotes ?? ''}
                    onChange={(e) => setOverallNotes(lens, e.target.value)}
                    placeholder="Optional notes for this lens..."
                    rows={2}
                    className="glass-input w-full text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setLensStatus(lens, 'in_review')} className="glass-button px-3 py-2 text-sm">Mark as in review</button>
                  <button onClick={() => setLensStatus(lens, 'changes_requested')} className="glass-button px-3 py-2 text-sm">Request changes</button>
                  <button onClick={() => setLensStatus(lens, 'approved')} className="glass-button px-3 py-2 text-sm bg-green-500/20 border-green-500/30 text-green-300">Approve lens</button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-3">Overall comments</h3>
        <ul className="space-y-2 mb-4">
          {comments.map((c) => (
            <li key={c.id} className="text-sm text-white/90 pl-3 border-l-2 border-white/20">
              {c.text}
              <span className="text-white/50 ml-2">{formatDistanceToNow(new Date(c.at), { addSuffix: true })}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="glass-input flex-1 text-sm"
          />
          <button onClick={onAddComment} className="glass-button px-4 py-2 self-end">Add</button>
        </div>
      </div>
    </div>
  )
}
