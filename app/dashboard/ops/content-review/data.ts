/**
 * Content Review Hub – types and seed data
 *
 * To add new checklist items: push to the appropriate lens array in LENS_CHECKLISTS
 * (legal_compliance, brand_ethics, or ux_safety). Each item needs id, lens, label,
 * description, required.
 *
 * To add a new lens in the future: (1) add a new ReviewLens value, (2) add a
 * LensReview field on Asset, (3) add a checklist array in LENS_CHECKLISTS,
 * (4) add the lens panel in the detail view and workflow logic.
 *
 * Persistence: Supabase tables content_review_assets and content_review_comments.
 * Use assetToRow/rowToAsset to convert; save on every update so data is backed up to the cloud.
 */

export type ReviewLens = 'legal_compliance' | 'brand_ethics' | 'ux_safety'

export type LensStatus = 'not_started' | 'in_review' | 'changes_requested' | 'approved'

export type AssetStatus = 'draft' | 'in_review' | 'approved' | 'blocked' | 'archived'

export interface LensChecklistItem {
  id: string
  lens: ReviewLens
  label: string
  description: string
  required: boolean
}

export interface LensReview {
  lens: ReviewLens
  status: LensStatus
  reviewerName?: string
  lastUpdated: string
  checklistResponses: {
    itemId: string
    passed: boolean
    notes?: string
  }[]
  overallNotes?: string
}

export interface Asset {
  id: string
  title: string
  assetType: 'tiktok_script' | 'ig_static' | 'deck_slide' | 'landing_page' | 'email' | 'other'
  channel: 'tiktok' | 'instagram' | 'site' | 'deck' | 'email' | 'paid_ads' | 'other'
  linkOrPath?: string
  description?: string
  createdBy: string
  createdAt: string
  status: AssetStatus
  tags: string[]
  riskLevel: 'low' | 'medium' | 'high'
  legalReview: LensReview
  brandReview: LensReview
  uxReview: LensReview
}

/** DB row shape (snake_case) for content_review_assets */
export interface ContentReviewAssetRow {
  id: string
  user_id: string
  title: string
  asset_type: Asset['assetType']
  channel: Asset['channel']
  link_or_path: string | null
  description: string | null
  created_by: string
  created_at: string
  status: AssetStatus
  tags: string[]
  risk_level: Asset['riskLevel']
  legal_review: LensReview
  brand_review: LensReview
  ux_review: LensReview
  updated_at?: string
}

export function assetToRow(asset: Asset, userId: string): Omit<ContentReviewAssetRow, 'updated_at'> {
  return {
    id: asset.id,
    user_id: userId,
    title: asset.title,
    asset_type: asset.assetType,
    channel: asset.channel,
    link_or_path: asset.linkOrPath ?? null,
    description: asset.description ?? null,
    created_by: asset.createdBy,
    created_at: asset.createdAt,
    status: asset.status,
    tags: asset.tags,
    risk_level: asset.riskLevel,
    legal_review: asset.legalReview,
    brand_review: asset.brandReview,
    ux_review: asset.uxReview,
  }
}

export function rowToAsset(row: ContentReviewAssetRow): Asset {
  return {
    id: row.id,
    title: row.title,
    assetType: row.asset_type,
    channel: row.channel,
    linkOrPath: row.link_or_path ?? undefined,
    description: row.description ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    status: row.status,
    tags: row.tags ?? [],
    riskLevel: row.risk_level,
    legalReview: row.legal_review as LensReview,
    brandReview: row.brand_review as LensReview,
    uxReview: row.ux_review as LensReview,
  }
}

/** Create a new asset for "Add asset". Caller provides id (e.g. crypto.randomUUID()). */
export function createNewAsset(input: {
  id: string
  title: string
  assetType?: Asset['assetType']
  channel?: Asset['channel']
  description?: string
  linkOrPath?: string
  createdBy?: string
  tags?: string[]
  riskLevel?: Asset['riskLevel']
}): Asset {
  return seedAsset({
    id: input.id,
    title: input.title,
    assetType: input.assetType ?? 'other',
    channel: input.channel ?? 'other',
    description: input.description,
    linkOrPath: input.linkOrPath,
    createdBy: input.createdBy ?? 'You',
    createdAt: new Date().toISOString(),
    status: 'draft',
    tags: input.tags ?? [],
    riskLevel: input.riskLevel ?? 'low',
  })
}

// --- Lens checklists (edit here to add/change items) ---

export const LENS_CHECKLISTS: Record<ReviewLens, LensChecklistItem[]> = {
  legal_compliance: [
    { id: 'legal-1', lens: 'legal_compliance', label: 'No unauthorized third party logos, packaging, or IP', description: 'Ensure no use of competitor or unlicensed IP.', required: true },
    { id: 'legal-2', lens: 'legal_compliance', label: 'All performance or result claims are supportable and not exaggerated', description: 'Claims must be backed by data or clear disclaimers.', required: true },
    { id: 'legal-3', lens: 'legal_compliance', label: 'No mention of medical outcomes or drug-like claims', description: 'Avoid anything that could be construed as a drug or medical claim.', required: true },
    { id: 'legal-4', lens: 'legal_compliance', label: 'Privacy and data handling language matches current policy', description: 'Scans and personal data must align with privacy policy.', required: true },
    { id: 'legal-5', lens: 'legal_compliance', label: 'Regulatory language (FTC, FDA) considered where applicable', description: 'Ad claims and beauty product language must comply.', required: true },
    { id: 'legal-6', lens: 'legal_compliance', label: 'No implied endorsements or testimonials without consent', description: 'Testimonials and endorsements must have proper consent.', required: true },
  ],
  brand_ethics: [
    { id: 'brand-1', lens: 'brand_ethics', label: 'Tone matches Chromara brand voice: cinematic, intelligent, emotionally grounded', description: 'Voice should feel premium and thoughtful.', required: true },
    { id: 'brand-2', lens: 'brand_ethics', label: 'No body shaming or appearance-based judgment', description: 'Content should not judge or shame any body type.', required: true },
    { id: 'brand-3', lens: 'brand_ethics', label: 'No appropriation of cultures, communities, or identities', description: 'Avoid cultural appropriation or stereotyping.', required: true },
    { id: 'brand-4', lens: 'brand_ethics', label: 'No exploitative or fear-based framing', description: 'Do not use fear or manipulation to sell.', required: true },
    { id: 'brand-5', lens: 'brand_ethics', label: 'Representation is inclusive and authentic', description: 'Diversity should feel genuine, not tokenized.', required: true },
    { id: 'brand-6', lens: 'brand_ethics', label: 'Aligned with Chromara values and mission', description: 'Content should support our mission and values.', required: true },
  ],
  ux_safety: [
    { id: 'ux-1', lens: 'ux_safety', label: 'Consumer can clearly understand what NovaMirror is and what it does', description: 'No confusion about product or technology.', required: true },
    { id: 'ux-2', lens: 'ux_safety', label: 'No content that could mislead about how data, scans, or shade matching works', description: 'Accuracy of technical and data claims.', required: true },
    { id: 'ux-3', lens: 'ux_safety', label: 'No suggestions that override consumer safety, hygiene, or dermatologist advice', description: 'Do not contradict health or safety guidance.', required: true },
    { id: 'ux-4', lens: 'ux_safety', label: 'Clarity of CTA and next steps', description: 'User knows what to do next without confusion.', required: false },
    { id: 'ux-5', lens: 'ux_safety', label: 'No misuse or misinterpretation risk', description: 'Content cannot be read in a harmful or wrong way.', required: true },
    { id: 'ux-6', lens: 'ux_safety', label: 'Accessibility and comprehension considered', description: 'Readable and understandable for target audience.', required: false },
  ],
}

function emptyLensReview(lens: ReviewLens): LensReview {
  const items = LENS_CHECKLISTS[lens]
  return {
    lens,
    status: 'not_started',
    lastUpdated: new Date().toISOString(),
    checklistResponses: items.map((i) => ({ itemId: i.id, passed: false })),
  }
}

function seedAsset(overrides: Partial<Asset> & { id: string; title: string }): Asset {
  const base: Asset = {
    id: overrides.id,
    title: overrides.title,
    assetType: overrides.assetType ?? 'other',
    channel: overrides.channel ?? 'other',
    linkOrPath: overrides.linkOrPath,
    description: overrides.description,
    createdBy: overrides.createdBy ?? 'Faith',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    status: overrides.status ?? 'draft',
    tags: overrides.tags ?? [],
    riskLevel: overrides.riskLevel ?? 'low',
    legalReview: overrides.legalReview ?? emptyLensReview('legal_compliance'),
    brandReview: overrides.brandReview ?? emptyLensReview('brand_ethics'),
    uxReview: overrides.uxReview ?? emptyLensReview('ux_safety'),
  }
  return { ...base, ...overrides }
}

const now = new Date().toISOString()
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

export function getSeedAssets(): Asset[] {
  const legalApproved: LensReview = {
    ...emptyLensReview('legal_compliance'),
    status: 'approved',
    reviewerName: 'Legal',
    lastUpdated: twoDaysAgo,
    checklistResponses: LENS_CHECKLISTS.legal_compliance.map((i) => ({ itemId: i.id, passed: true })),
  }
  const brandApproved: LensReview = {
    ...emptyLensReview('brand_ethics'),
    status: 'approved',
    reviewerName: 'Brand',
    lastUpdated: twoDaysAgo,
    checklistResponses: LENS_CHECKLISTS.brand_ethics.map((i) => ({ itemId: i.id, passed: true })),
  }
  const uxInReview: LensReview = {
    ...emptyLensReview('ux_safety'),
    status: 'in_review',
    reviewerName: 'UX',
    lastUpdated: now,
    checklistResponses: LENS_CHECKLISTS.ux_safety.map((i) => ({ itemId: i.id, passed: i.id === 'ux-1' || i.id === 'ux-2' })),
  }
  const uxApproved: LensReview = {
    ...emptyLensReview('ux_safety'),
    status: 'approved',
    reviewerName: 'UX',
    lastUpdated: lastWeek,
    checklistResponses: LENS_CHECKLISTS.ux_safety.map((i) => ({ itemId: i.id, passed: true })),
  }

  return [
    seedAsset({
      id: '1',
      title: 'NovaMirror launch TikTok script',
      assetType: 'tiktok_script',
      channel: 'tiktok',
      description: '60s script for launch day TikTok. Focus on shade matching and personalization.',
      linkOrPath: 'https://drive.google.com/script-doc-1',
      createdBy: 'Faith',
      createdAt: lastWeek,
      status: 'in_review',
      tags: ['launch', 'tiktok', 'nova'],
      riskLevel: 'medium',
      legalReview: legalApproved,
      brandReview: brandApproved,
      uxReview: uxInReview,
    }),
    seedAsset({
      id: '2',
      title: 'IG static: Foundation shade range',
      assetType: 'ig_static',
      channel: 'instagram',
      description: 'Carousel post showing 4.5M shades concept with NovaMirror device.',
      createdBy: 'Faith',
      createdAt: twoDaysAgo,
      status: 'approved',
      tags: ['instagram', 'shade', 'product'],
      riskLevel: 'low',
      legalReview: legalApproved,
      brandReview: brandApproved,
      uxReview: uxApproved,
    }),
    seedAsset({
      id: '3',
      title: 'Investor deck slide: Market size',
      assetType: 'deck_slide',
      channel: 'deck',
      description: 'Slide with TAM/SAM/SOM and source citations.',
      linkOrPath: 'https://figma.com/deck-slide-3',
      createdBy: 'Faith',
      createdAt: twoDaysAgo,
      status: 'draft',
      tags: ['investor', 'deck', 'market'],
      riskLevel: 'low',
    }),
    seedAsset({
      id: '4',
      title: 'Landing page: How NovaMirror works',
      assetType: 'landing_page',
      channel: 'site',
      description: 'Consumer-facing explainer page for scan and shade matching.',
      linkOrPath: 'https://chromarabeauty.com/how-it-works',
      createdBy: 'Faith',
      createdAt: now,
      status: 'in_review',
      tags: ['site', 'explainer', 'ux'],
      riskLevel: 'high',
      legalReview: { ...emptyLensReview('legal_compliance'), status: 'in_review', lastUpdated: now },
      brandReview: { ...emptyLensReview('brand_ethics'), status: 'not_started' },
      uxReview: { ...emptyLensReview('ux_safety'), status: 'in_review', lastUpdated: now },
    }),
    seedAsset({
      id: '5',
      title: 'Newsletter: Beta waitlist email',
      assetType: 'email',
      channel: 'email',
      description: 'Email copy for beta waitlist signup confirmation.',
      createdBy: 'Faith',
      createdAt: lastWeek,
      status: 'approved',
      tags: ['email', 'beta', 'waitlist'],
      riskLevel: 'low',
      legalReview: { ...emptyLensReview('legal_compliance'), status: 'approved', reviewerName: 'Legal', lastUpdated: lastWeek, checklistResponses: LENS_CHECKLISTS.legal_compliance.map((i) => ({ itemId: i.id, passed: true })) },
      brandReview: { ...emptyLensReview('brand_ethics'), status: 'approved', reviewerName: 'Brand', lastUpdated: lastWeek, checklistResponses: LENS_CHECKLISTS.brand_ethics.map((i) => ({ itemId: i.id, passed: true })) },
      uxReview: { ...emptyLensReview('ux_safety'), status: 'approved', reviewerName: 'UX', lastUpdated: lastWeek, checklistResponses: LENS_CHECKLISTS.ux_safety.map((i) => ({ itemId: i.id, passed: true })) },
    }),
    seedAsset({
      id: '6',
      title: 'Paid ad: Retargeting creative (claims)',
      assetType: 'ig_static',
      channel: 'paid_ads',
      description: 'Static ad with before/after framing. Needs strict legal review.',
      createdBy: 'Faith',
      createdAt: twoDaysAgo,
      status: 'blocked',
      tags: ['paid', 'retargeting', 'claims'],
      riskLevel: 'high',
      legalReview: { ...emptyLensReview('legal_compliance'), status: 'changes_requested', reviewerName: 'Legal', lastUpdated: twoDaysAgo, overallNotes: 'Claims need citations.', checklistResponses: LENS_CHECKLISTS.legal_compliance.map((i) => ({ itemId: i.id, passed: i.id !== 'legal-2' })) },
      brandReview: { ...emptyLensReview('brand_ethics'), status: 'approved', reviewerName: 'Brand', lastUpdated: twoDaysAgo, checklistResponses: LENS_CHECKLISTS.brand_ethics.map((i) => ({ itemId: i.id, passed: true })) },
      uxReview: { ...emptyLensReview('ux_safety'), status: 'not_started' },
    }),
  ]
}
