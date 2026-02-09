'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Tab = 'create' | 'calendar' | 'queue' | 'analytics'
type Platform = 'twitter' | 'linkedin' | 'tiktok' | 'pinterest'
type Post = {
  id: string
  platform: string
  content: string
  media_url: string | null
  scheduled_for: string | null
  status: string
  posted_at: string | null
  engagement: Record<string, number> | null
  created_at: string
}

export default function SocialMediaAgentPage() {
  const [tab, setTab] = useState<Tab>('create')
  const [platform, setPlatform] = useState<Platform>('twitter')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [variants, setVariants] = useState<string[]>([])
  const [selectedVariant, setSelectedVariant] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const supabase = createClient()

  const loadPosts = async () => {
    setLoadingPosts(true)
    try {
      const res = await fetch('/api/social-posts')
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [tab])

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setGenerating(true)
    setVariants([])
    setSelectedVariant('')
    try {
      const res = await fetch('/api/generate-social-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic: topic.trim(), tone }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      const data = await res.json()
      setVariants(data.variants || [])
      setSelectedVariant((data.variants || [])[0] || '')
    } catch (e) {
      alert('Failed to generate: ' + String(e))
    } finally {
      setGenerating(false)
    }
  }

  const addToQueue = async () => {
    const content = selectedVariant || variants[0]
    if (!content) return
    const scheduled = scheduleDate && scheduleTime
      ? `${scheduleDate}T${scheduleTime}:00`
      : null
    try {
      const res = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content,
          scheduled_for: scheduled,
          status: scheduled ? 'queued' : 'draft',
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      setSelectedVariant('')
      setVariants([])
      setTopic('')
      loadPosts()
      setTab('queue')
    } catch (e) {
      alert('Failed to add: ' + String(e))
    }
  }

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const res = await fetch('/api/social-posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      loadPosts()
    } catch (e) {
      alert('Failed to update: ' + String(e))
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/social-posts?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      loadPosts()
    } catch (e) {
      alert('Failed to delete: ' + String(e))
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'create', label: 'Create Content' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'queue', label: 'Queue' },
    { id: 'analytics', label: 'Analytics' },
  ]

  const queuedCount = posts.filter((p) => p.status === 'queued').length
  const byPlatform = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">📱 Social Media Manager</h1>
      <p className="text-white/60">Generate, schedule, and manage posts with Claude.</p>

      <div className="flex gap-2 border-b border-white/20 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-chromara-purple text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Generate Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="glass-input w-full"
              >
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="glass-input w-full"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="inspiring">Inspiring</option>
                <option value="playful">Playful</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Topic / theme</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI-powered shade matching launch"
              className="glass-input w-full"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="glass-button px-6 py-2 disabled:opacity-50"
          >
            {generating ? 'Generating…' : '✨ Generate Content'}
          </button>

          {variants.length > 0 && (
            <div className="pt-4 border-t border-white/20 space-y-3">
              <h3 className="text-sm font-semibold text-white">Pick a variant</h3>
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedVariant === v
                      ? 'border-chromara-purple bg-chromara-purple/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-white whitespace-pre-wrap text-sm">{v}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 items-center pt-2">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="glass-input"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="glass-input"
                />
                <button
                  onClick={addToQueue}
                  className="glass-button px-4 py-2"
                >
                  Add to Queue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Content Calendar</h2>
          {loadingPosts ? (
            <p className="text-white/50">Loading…</p>
          ) : (
            <div className="space-y-2">
              {posts
                .filter((p) => p.scheduled_for)
                .sort(
                  (a, b) =>
                    new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime()
                )
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <span className="text-white font-medium">{p.platform}</span>
                      <span className="text-white/50 ml-2">
                        {p.scheduled_for
                          ? new Date(p.scheduled_for).toLocaleString()
                          : 'No date'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm truncate max-w-md">{p.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deletePost(p.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              {posts.filter((p) => p.scheduled_for).length === 0 && (
                <p className="text-white/50">No scheduled posts. Create and schedule from Create Content.</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'queue' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Queue ({posts.length})</h2>
          {loadingPosts ? (
            <p className="text-white/50">Loading…</p>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-chromara-purple/30 text-white text-xs">
                      {p.platform}
                    </span>
                    <span className="text-white/50 text-xs">{p.status}</span>
                  </div>
                  <p className="text-white text-sm whitespace-pre-wrap">{p.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const d = prompt('New schedule date (YYYY-MM-DD)', p.scheduled_for?.slice(0, 10))
                        const t = prompt('Time (HH:MM)', p.scheduled_for?.slice(11, 16))
                        if (d != null && t != null)
                          updatePost(p.id, {
                            scheduled_for: `${d}T${t}:00`,
                            status: 'queued',
                          })
                      }}
                      className="text-xs glass-button px-2 py-1"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => deletePost(p.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-white/50">Queue is empty. Generate content and add to queue.</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4">
              <p className="text-2xl font-bold text-white">{queuedCount}</p>
              <p className="text-xs text-white/60">Queued</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-2xl font-bold text-white">{posts.length}</p>
              <p className="text-xs text-white/60">Total posts</p>
            </div>
            {Object.entries(byPlatform).map(([plat, count]) => (
              <div key={plat} className="glass-card p-4">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-white/60">{plat}</p>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm">
            Engagement metrics can be connected when you link social accounts or add manual data.
          </p>
        </div>
      )}
    </div>
  )
}
