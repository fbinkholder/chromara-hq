'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import EmptyState from '@/app/components/EmptyState'
import ConfirmDialog from '@/app/components/ConfirmDialog'

type PRContact = {
  id: string
  publication: string
  contact_name: string | null
  email: string | null
  twitter_handle: string | null
  beat: string | null
  tier: string | null
  last_contact_date: string | null
  relationship_status: string
  notes: string | null
}

type PRCoverage = {
  id: string
  publication: string
  article_title: string | null
  article_url: string | null
  published_date: string | null
  coverage_type: string | null
  sentiment: string | null
  reach_estimate: number | null
  notes: string | null
}

const TIERS = ['tier1', 'tier2', 'tier3', 'niche']
const RELATIONSHIP = ['cold', 'warm', 'hot', 'active']
const COVERAGE_TYPES = ['feature', 'mention', 'interview', 'product_review']
const SENTIMENTS = ['positive', 'neutral', 'negative']
const tierColors: Record<string, string> = {
  tier1: 'bg-yellow-500/30 text-yellow-300',
  tier2: 'bg-blue-500/30 text-blue-300',
  tier3: 'bg-green-500/30 text-green-300',
  niche: 'bg-purple-500/30 text-purple-300',
}

export default function PressPage() {
  const [tab, setTab] = useState<'contacts' | 'coverage'>('contacts')
  const [contacts, setContacts] = useState<PRContact[]>([])
  const [coverage, setCoverage] = useState<PRCoverage[]>([])
  const [loading, setLoading] = useState(true)
  const [contactModal, setContactModal] = useState(false)
  const [coverageModal, setCoverageModal] = useState(false)
  const [editingContact, setEditingContact] = useState<PRContact | null>(null)
  const [editingCoverage, setEditingCoverage] = useState<PRCoverage | null>(null)
  const [deleteContact, setDeleteContact] = useState<PRContact | null>(null)
  const [deleteCoverage, setDeleteCoverage] = useState<PRCoverage | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterTier, setFilterTier] = useState<string>('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const loadContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('pr_contacts').select('*').eq('user_id', user.id).order('publication')
    if (!error) setContacts((data as PRContact[]) || [])
  }
  const loadCoverage = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('pr_coverage').select('*').eq('user_id', user.id).order('published_date', { ascending: false })
    if (!error) setCoverage((data as PRCoverage[]) || [])
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadContacts(), loadCoverage()]).finally(() => setLoading(false))
  }, [])

  const filteredContacts = contacts.filter((c) => {
    if (filterTier !== 'all' && c.tier !== filterTier) return false
    if (search && !c.publication.toLowerCase().includes(search.toLowerCase()) && !(c.contact_name || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSaveContact = async (form: Partial<PRContact>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        publication: form.publication || '',
        contact_name: form.contact_name || null,
        email: form.email || null,
        twitter_handle: form.twitter_handle || null,
        beat: form.beat || null,
        tier: form.tier || null,
        last_contact_date: form.last_contact_date || null,
        relationship_status: form.relationship_status || 'cold',
        notes: form.notes || null,
      }
      if (editingContact) {
        await supabase.from('pr_contacts').update(payload).eq('id', editingContact.id)
      } else {
        await supabase.from('pr_contacts').insert(payload)
      }
      setContactModal(false)
      setEditingContact(null)
      loadContacts()
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCoverage = async (form: Partial<PRCoverage>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const payload = {
        user_id: user.id,
        publication: form.publication || '',
        article_title: form.article_title || null,
        article_url: form.article_url || null,
        published_date: form.published_date || null,
        coverage_type: form.coverage_type || null,
        sentiment: form.sentiment || null,
        reach_estimate: form.reach_estimate != null ? Number(form.reach_estimate) : null,
        notes: form.notes || null,
      }
      if (editingCoverage) {
        await supabase.from('pr_coverage').update(payload).eq('id', editingCoverage.id)
      } else {
        await supabase.from('pr_coverage').insert(payload)
      }
      setCoverageModal(false)
      setEditingCoverage(null)
      loadCoverage()
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const markContacted = async (c: PRContact) => {
    await supabase.from('pr_contacts').update({ last_contact_date: new Date().toISOString().slice(0, 10) }).eq('id', c.id)
    loadContacts()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">PR Tracker</h1>
      <div className="flex gap-2 border-b border-white/20 pb-2">
        <button onClick={() => setTab('contacts')} className={`px-4 py-2 rounded-lg ${tab === 'contacts' ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80'}`}>PR Contacts</button>
        <button onClick={() => setTab('coverage')} className={`px-4 py-2 rounded-lg ${tab === 'coverage' ? 'bg-chromara-purple text-white' : 'bg-white/10 text-white/80'}`}>Coverage</button>
      </div>

      {tab === 'contacts' && (
        <>
          <div className="flex flex-wrap gap-4">
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input w-48" />
            <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="glass-input w-32">
              <option value="all">All tiers</option>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => { setEditingContact(null); setContactModal(true); }} className="glass-button px-4 py-2">Add contact</button>
          </div>
          {loading ? <div className="text-white/50 py-8">Loading…</div> : filteredContacts.length === 0 ? (
            <EmptyState icon="📰" title="No press contacts yet" buttonText="Add contact" onButtonClick={() => setContactModal(true)} />
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((c) => (
                <div key={c.id} className="glass-card p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-white font-medium">{c.publication}</p>
                    <p className="text-white/70 text-sm">{c.contact_name || '—'} · {c.email || '—'}</p>
                    {c.twitter_handle && <p className="text-white/60 text-xs">@{c.twitter_handle.replace('@', '')}</p>}
                    <div className="flex gap-2 mt-2">
                      {c.tier && <span className={`px-2 py-0.5 rounded text-xs ${tierColors[c.tier] || ''}`}>{c.tier}</span>}
                      <span className="px-2 py-0.5 rounded text-xs bg-white/10">{c.relationship_status}</span>
                      {c.last_contact_date && <span className="text-white/50 text-xs">Last contact: {c.last_contact_date}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markContacted(c)} className="text-xs glass-button px-2 py-1">Mark contacted</button>
                    <button onClick={() => { setEditingContact(c); setContactModal(true); }} className="text-xs glass-button px-2 py-1">Edit</button>
                    <button onClick={() => setDeleteContact(c)} className="text-xs text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'coverage' && (
        <>
          <button onClick={() => { setEditingCoverage(null); setCoverageModal(true); }} className="glass-button px-4 py-2">Add coverage</button>
          {loading ? <div className="text-white/50 py-8">Loading…</div> : coverage.length === 0 ? (
            <EmptyState icon="📄" title="No coverage yet" buttonText="Add coverage" onButtonClick={() => setCoverageModal(true)} />
          ) : (
            <div className="space-y-3">
              {coverage.map((cov) => (
                <div key={cov.id} className="glass-card p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-white font-medium">{cov.publication}</p>
                    {cov.article_url ? (
                      <a href={cov.article_url} target="_blank" rel="noopener noreferrer" className="text-chromara-purple hover:underline">{cov.article_title || 'Article'}</a>
                    ) : <p className="text-white/80">{cov.article_title || '—'}</p>}
                    <div className="flex gap-2 mt-2">
                      {cov.coverage_type && <span className="px-2 py-0.5 rounded text-xs bg-white/10">{cov.coverage_type}</span>}
                      {cov.sentiment && <span>{cov.sentiment === 'positive' ? '😊' : cov.sentiment === 'negative' ? '😞' : '😐'}</span>}
                      {cov.reach_estimate != null && <span className="text-white/50 text-xs">Reach: {cov.reach_estimate}</span>}
                      {cov.published_date && <span className="text-white/50 text-xs">{cov.published_date}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCoverage(cov); setCoverageModal(true); }} className="text-xs glass-button px-2 py-1">Edit</button>
                    <button onClick={() => setDeleteCoverage(cov)} className="text-xs text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {contactModal && (
        <PRContactModal initial={editingContact} onSave={handleSaveContact} onClose={() => { setContactModal(false); setEditingContact(null); }} saving={saving} />
      )}
      {coverageModal && (
        <PRCoverageModal initial={editingCoverage} onSave={handleSaveCoverage} onClose={() => { setCoverageModal(false); setEditingCoverage(null); }} saving={saving} />
      )}
      <ConfirmDialog isOpen={!!deleteContact} title="Delete contact?" message={deleteContact ? `Remove ${deleteContact.publication}?` : ''} onConfirm={async () => { if (deleteContact) await supabase.from('pr_contacts').delete().eq('id', deleteContact.id); setDeleteContact(null); loadContacts(); }} onCancel={() => setDeleteContact(null)} />
      <ConfirmDialog isOpen={!!deleteCoverage} title="Delete coverage?" message={deleteCoverage ? `Remove this entry?` : ''} onConfirm={async () => { if (deleteCoverage) await supabase.from('pr_coverage').delete().eq('id', deleteCoverage.id); setDeleteCoverage(null); loadCoverage(); }} onCancel={() => setDeleteCoverage(null)} />
    </div>
  )
}

function PRContactModal({ initial, onSave, onClose, saving }: { initial: PRContact | null; onSave: (f: Partial<PRContact>) => void; onClose: () => void; saving: boolean }) {
  const [publication, setPublication] = useState(initial?.publication ?? '')
  const [contact_name, setContact_name] = useState(initial?.contact_name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [twitter_handle, setTwitter_handle] = useState(initial?.twitter_handle ?? '')
  const [beat, setBeat] = useState(initial?.beat ?? '')
  const [tier, setTier] = useState(initial?.tier ?? '')
  const [last_contact_date, setLast_contact_date] = useState(initial?.last_contact_date ?? '')
  const [relationship_status, setRelationship_status] = useState(initial?.relationship_status ?? 'cold')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const submit = () => {
    if (!publication.trim()) { alert('Publication required'); return }
    onSave({ publication: publication.trim(), contact_name: contact_name || null, email: email || null, twitter_handle: twitter_handle || null, beat: beat || null, tier: tier || null, last_contact_date: last_contact_date || null, relationship_status, notes: notes || null })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit contact' : 'Add contact'}</h3>
        <div className="space-y-3">
          <div><label className="block text-sm text-white/80 mb-1">Publication *</label><input value={publication} onChange={(e) => setPublication(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Contact name</label><input value={contact_name} onChange={(e) => setContact_name(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Twitter handle</label><input value={twitter_handle} onChange={(e) => setTwitter_handle(e.target.value)} className="glass-input w-full" placeholder="@handle" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Beat</label><input value={beat} onChange={(e) => setBeat(e.target.value)} className="glass-input w-full" placeholder="beauty, tech, startups" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Tier</label><select value={tier} onChange={(e) => setTier(e.target.value)} className="glass-input w-full"><option value="">—</option>{TIERS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Last contact date</label><input type="date" value={last_contact_date} onChange={(e) => setLast_contact_date(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Relationship</label><select value={relationship_status} onChange={(e) => setRelationship_status(e.target.value)} className="glass-input w-full">{RELATIONSHIP.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full min-h-[60px]" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button><button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
      </div>
    </div>
  )
}

function PRCoverageModal({ initial, onSave, onClose, saving }: { initial: PRCoverage | null; onSave: (f: Partial<PRCoverage>) => void; onClose: () => void; saving: boolean }) {
  const [publication, setPublication] = useState(initial?.publication ?? '')
  const [article_title, setArticle_title] = useState(initial?.article_title ?? '')
  const [article_url, setArticle_url] = useState(initial?.article_url ?? '')
  const [published_date, setPublished_date] = useState(initial?.published_date ?? '')
  const [coverage_type, setCoverage_type] = useState(initial?.coverage_type ?? '')
  const [sentiment, setSentiment] = useState(initial?.sentiment ?? '')
  const [reach_estimate, setReach_estimate] = useState(initial?.reach_estimate != null ? String(initial.reach_estimate) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const submit = () => {
    if (!publication.trim()) { alert('Publication required'); return }
    onSave({ publication: publication.trim(), article_title: article_title || null, article_url: article_url || null, published_date: published_date || null, coverage_type: coverage_type || null, sentiment: sentiment || null, reach_estimate: reach_estimate === '' ? null : Number(reach_estimate), notes: notes || null })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{initial ? 'Edit coverage' : 'Add coverage'}</h3>
        <div className="space-y-3">
          <div><label className="block text-sm text-white/80 mb-1">Publication *</label><input value={publication} onChange={(e) => setPublication(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Article title</label><input value={article_title} onChange={(e) => setArticle_title(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Article URL</label><input type="url" value={article_url} onChange={(e) => setArticle_url(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Published date</label><input type="date" value={published_date} onChange={(e) => setPublished_date(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Coverage type</label><select value={coverage_type} onChange={(e) => setCoverage_type(e.target.value)} className="glass-input w-full"><option value="">—</option>{COVERAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Sentiment</label><select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="glass-input w-full"><option value="">—</option>{SENTIMENTS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-sm text-white/80 mb-1">Reach estimate</label><input type="number" value={reach_estimate} onChange={(e) => setReach_estimate(e.target.value)} className="glass-input w-full" /></div>
          <div><label className="block text-sm text-white/80 mb-1">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input w-full min-h-[60px]" /></div>
        </div>
        <div className="flex gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white">Cancel</button><button onClick={submit} disabled={saving} className="glass-button px-4 py-2 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
      </div>
    </div>
  )
}
