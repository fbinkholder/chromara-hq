'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Post = {
  id: string
  platform: string
  content: string
  media_url: string | null
  scheduled_for: string | null
  status: string
  created_at: string
}

const CHARACTER_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  tiktok: 2200,
  pinterest: 500,
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok (Script)',
  pinterest: 'Pinterest',
}

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'twitter',
    content: '',
    media_url: '',
    scheduled_for: '',
    status: 'draft',
  })
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('social_posts')
      .select('id, platform, content, media_url, scheduled_for, status, created_at')
      .order('created_at', { ascending: false })
    setPosts((data as Post[]) || [])
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      if (data.url) {
        setFormData((prev) => ({ ...prev, media_url: data.url }))
        setImagePreview(data.url)
      }
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploading(false)
    }
  }

  const createPost = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in.')
      return
    }
    const { error } = await supabase.from('social_posts').insert({
      user_id: user.id,
      platform: formData.platform,
      content: formData.content,
      media_url: formData.media_url || null,
      scheduled_for: formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : null,
      status: formData.status,
    })
    if (error) {
      alert('Failed to create post: ' + error.message)
      return
    }
    setShowCreateModal(false)
    setFormData({ platform: 'twitter', content: '', media_url: '', scheduled_for: '', status: 'draft' })
    setImagePreview('')
    loadPosts()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('social_posts').delete().eq('id', id)
    loadPosts()
  }

  const limit = CHARACTER_LIMITS[formData.platform] ?? 280
  const remaining = limit - formData.content.length

  const cardStyle =
    'rounded-2xl border border-violet-500/30 bg-white/5 backdrop-blur-sm p-6 hover:border-violet-500/50 transition-all'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-lilac-400 bg-clip-text text-transparent">
            Social Media Manager
          </h1>
          <p className="text-white/60 mt-2">Create and schedule content across platforms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all"
        >
          ➕ Create Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cardStyle + ' p-4'}>
          <div className="text-2xl font-bold text-white">{posts.filter((p) => p.status === 'draft').length}</div>
          <div className="text-white/60 text-sm">Drafts</div>
        </div>
        <div className={cardStyle + ' p-4'}>
          <div className="text-2xl font-bold text-white">{posts.filter((p) => p.status === 'queued').length}</div>
          <div className="text-white/60 text-sm">Queued</div>
        </div>
        <div className={cardStyle + ' p-4'}>
          <div className="text-2xl font-bold text-white">{posts.filter((p) => p.status === 'published').length}</div>
          <div className="text-white/60 text-sm">Published</div>
        </div>
        <div className={cardStyle + ' p-4'}>
          <div className="text-2xl font-bold text-white">{posts.length}</div>
          <div className="text-white/60 text-sm">Total Posts</div>
        </div>
      </div>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : posts.length === 0 ? (
        <div className={cardStyle + ' p-12 text-center'}>
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-2xl font-bold text-white mb-2">No posts yet</h3>
          <p className="text-white/60 mb-6">Create your first social media post</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className={cardStyle + ' group'}>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.platform === 'twitter'
                      ? 'bg-blue-500/20 text-blue-300'
                      : post.platform === 'linkedin'
                        ? 'bg-blue-700/20 text-blue-400'
                        : post.platform === 'tiktok'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {(post.platform || '').toUpperCase()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.status === 'published'
                      ? 'bg-green-500/20 text-green-300'
                      : post.status === 'queued'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {(post.status || 'draft').toUpperCase()}
                </span>
              </div>
              {post.media_url && (
                <div className="mb-4 rounded-lg overflow-hidden relative w-full aspect-video">
                  <Image
                    src={post.media_url}
                    alt="Post media"
                    fill
                    className="object-cover"
                    unoptimized={post.media_url.includes('supabase.co')}
                  />
                </div>
              )}
              <p className="text-white/90 mb-4 whitespace-pre-wrap line-clamp-4">{post.content}</p>
              {post.scheduled_for && (
                <p className="text-xs text-white/60 mb-4">
                  📅 Scheduled: {new Date(post.scheduled_for).toLocaleString()}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 border border-white/20"
                  onClick={() => {}}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-red-400 text-sm hover:bg-red-500/20 border border-white/20"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={cardStyle + ' p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'}>
            <h2 className="text-2xl font-bold text-white mb-6">Create Social Post</h2>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
              >
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white font-semibold">Content</label>
                <span className={`text-sm ${remaining < 0 ? 'text-red-400' : 'text-white/60'}`}>
                  {remaining} characters remaining
                </span>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your post content..."
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40 h-32"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-500 file:text-white file:cursor-pointer"
              />
              {uploading && <p className="text-white/60 text-sm mt-2">Uploading…</p>}
              {imagePreview && (
                <div className="mt-4 rounded-lg overflow-hidden relative w-full aspect-video">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.includes('supabase.co')}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">Schedule (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
              >
                <option value="draft">Draft</option>
                <option value="queued">Queue for Publishing</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={createPost}
                disabled={remaining < 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Create Post
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ platform: 'twitter', content: '', media_url: '', scheduled_for: '', status: 'draft' })
                  setImagePreview('')
                }}
                className="px-6 py-3 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
