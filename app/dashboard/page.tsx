'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export type TodoStatus = 'not_started' | 'in_progress' | 'completed'
export type TodoItem = {
  id: string
  text: string
  done?: boolean // legacy
  status?: TodoStatus
  completedAt?: string // ISO date when status set to completed
}

type ActivityItem = {
  id: string
  type: 'contact' | 'post' | 'insight'
  title: string
  subtitle?: string
  createdAt: string
  href?: string
}

export type UserQuickWin = { id: string; title: string; addedAt: string }
const QUICK_WINS_KEY = 'chromara-quick-wins'
export const WRAPPED_2026_KEY = 'chromara-wrapped-2026'

export default function HomeDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    partnerships: 0,
    emailsSent: 0,
    contentQueued: 0,
    insightsGathered: 0,
  })
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [growthPercent, setGrowthPercent] = useState<number | null>(null)
  const [userQuickWins, setUserQuickWins] = useState<UserQuickWin[]>([])
  const [newQuickWinTitle, setNewQuickWinTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backingup' | 'restoring' | 'ok' | 'error'>('idle')
  const [backupMessage, setBackupMessage] = useState('')
  const supabase = createClient()

  const BACKUP_KIND = 'localStorage'

  async function backupToCloud() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setBackupMessage('Not signed in.')
      setBackupStatus('error')
      return
    }
    setBackupStatus('backingup')
    setBackupMessage('')
    try {
      const payload: Record<string, string> = {}
      if (typeof window !== 'undefined') {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i)
          if (key?.startsWith('chromara-')) payload[key] = window.localStorage.getItem(key) ?? ''
        }
      }
      const { error } = await supabase.from('user_cloud_backup').upsert(
        { user_id: user.id, kind: BACKUP_KIND, payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,kind' }
      )
      if (error) throw error
      setBackupStatus('ok')
      setBackupMessage(`Backed up ${Object.keys(payload).length} items to the cloud.`)
    } catch (e: any) {
      setBackupStatus('error')
      setBackupMessage(e?.message || 'Backup failed. Run supabase/backup_schema.sql in Supabase SQL Editor once.')
    }
  }

  async function restoreFromCloud() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setBackupMessage('Not signed in.')
      setBackupStatus('error')
      return
    }
    setBackupStatus('restoring')
    setBackupMessage('')
    try {
      const { data, error } = await supabase
        .from('user_cloud_backup')
        .select('payload')
        .eq('user_id', user.id)
        .eq('kind', BACKUP_KIND)
        .single()
      if (error || !data?.payload) {
        setBackupMessage('No backup found. Backup first from this device.')
        setBackupStatus('error')
        return
      }
      const payload = data.payload as Record<string, string>
      if (typeof window !== 'undefined') {
        for (const [key, value] of Object.entries(payload)) {
          if (key.startsWith('chromara-')) window.localStorage.setItem(key, value)
        }
      }
      setBackupStatus('ok')
      setBackupMessage('Restored. Reload the page to see your data.')
    } catch (e: any) {
      setBackupStatus('error')
      setBackupMessage(e?.message || 'Restore failed.')
    }
  }

  useEffect(() => {
    const t = new Date()
    setTime(t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    setDate(t.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
  }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('chromara-todos') : null
    if (saved) {
      try {
        const raw = JSON.parse(saved) as TodoItem[]
        const normalized = raw.map((t) => {
          const status: TodoStatus = t.status ?? (t.done ? 'completed' : 'not_started')
          return {
            id: t.id,
            text: t.text,
            status,
            completedAt: t.completedAt ?? (t.done ? new Date().toISOString().slice(0, 10) : undefined),
          }
        })
        setTodos(normalized)
      } catch (_) {}
    }
  }, [])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(QUICK_WINS_KEY) : null
    if (raw) {
      try {
        setUserQuickWins(JSON.parse(raw) as UserQuickWin[])
      } catch (_) {}
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id
        if (!uid) {
          setLoading(false)
          return
        }
        setUserName(user?.user_metadata?.name || user?.email?.split('@')[0] || 'there')

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const [partnershipsRes, emailsRes, queuedRes, insightsRes] = await Promise.all([
          supabase.from('outreach_contacts').select('*', { count: 'exact', head: true }).eq('user_id', uid).in('status', ['responded', 'interested', 'moving_forward']),
          supabase.from('sent_emails').select('*', { count: 'exact', head: true }),
          supabase.from('social_posts').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
          supabase.from('market_intelligence').select('*', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', sevenDaysAgo.toISOString()),
        ])
        setStats({
          partnerships: partnershipsRes.count ?? 0,
          emailsSent: emailsRes.count ?? 0,
          contentQueued: queuedRes.count ?? 0,
          insightsGathered: insightsRes.count ?? 0,
        })

        const [contactsData, postsData, intelData] = await Promise.all([
          supabase.from('outreach_contacts').select('id, contact_name, company, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(3),
          supabase.from('social_posts').select('id, content, platform, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(3),
          supabase.from('market_intelligence').select('id, title, category, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(4),
        ])
        const activities: ActivityItem[] = [
          ...(contactsData.data || []).map((c: { id: string; contact_name?: string; company?: string; created_at: string }) => ({
            id: `c-${c.id}`,
            type: 'contact' as const,
            title: c.contact_name || 'Contact',
            subtitle: c.company,
            createdAt: c.created_at,
            href: '/dashboard/partnerships',
          })),
          ...(postsData.data || []).map((p: { id: string; content?: string; platform?: string; created_at: string }) => ({
            id: `p-${p.id}`,
            type: 'post' as const,
            title: (p.content?.slice(0, 40) || 'Post') + (p.content && p.content.length > 40 ? '…' : ''),
            subtitle: p.platform,
            createdAt: p.created_at,
            href: '/dashboard/content/calendar',
          })),
          ...(intelData.data || []).map((i: { id: string; title?: string; category?: string; created_at: string }) => ({
            id: `i-${i.id}`,
            type: 'insight' as const,
            title: i.title || 'Insight',
            subtitle: i.category,
            createdAt: i.created_at,
            href: '/dashboard/competitive-intel',
          })),
        ]
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setActivity(activities.slice(0, 10))

        // Growth % from analytics: kpis + snapshots, compare first vs last in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const startDate = thirtyDaysAgo.toISOString().slice(0, 10)
        const { data: kpisData } = await supabase.from('kpis').select('id, metric_name, category').eq('user_id', uid)
        const { data: snapData } = await supabase
          .from('kpi_snapshots')
          .select('metric_name, value, snapshot_date')
          .eq('user_id', uid)
          .gte('snapshot_date', startDate)
          .order('snapshot_date', { ascending: true })
        const kpisList = (kpisData || []) as { id: string; metric_name: string; category: string | null }[]
        const snaps = (snapData || []) as { metric_name: string; value: number; snapshot_date: string }[]
        let growth: number | null = null
        if (kpisList.length > 0 && snaps.length >= 2) {
          const byMetric = new Map<string, { value: number; date: string }[]>()
          for (const s of snaps) {
            if (!byMetric.has(s.metric_name)) byMetric.set(s.metric_name, [])
            byMetric.get(s.metric_name)!.push({ value: s.value, date: s.snapshot_date })
          }
          for (const k of kpisList) {
            const arr = byMetric.get(k.metric_name)
            if (arr && arr.length >= 2) {
              const first = arr[0].value
              const last = arr[arr.length - 1].value
              if (first !== 0 && typeof first === 'number' && typeof last === 'number') {
                growth = Math.round(((last - first) / first) * 100)
                break
              }
            }
          }
        }
        setGrowthPercent(growth)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos)
    if (typeof window !== 'undefined') localStorage.setItem('chromara-todos', JSON.stringify(newTodos))
  }

  const activeTodos = todos.filter((t) => (t.status ?? (t.done ? 'completed' : 'not_started')) !== 'completed')
  const setTodoStatus = (id: string, status: TodoStatus) => {
    const completedAt = status === 'completed' ? new Date().toISOString() : undefined
    saveTodos(todos.map((t) => (t.id === id ? { ...t, status, completedAt } : t)))
  }

  const saveUserQuickWins = (wins: UserQuickWin[]) => {
    setUserQuickWins(wins)
    if (typeof window !== 'undefined') localStorage.setItem(QUICK_WINS_KEY, JSON.stringify(wins))
  }
  const addUserQuickWin = () => {
    const title = newQuickWinTitle.trim()
    if (!title) return
    const win: UserQuickWin = { id: Date.now().toString(), title, addedAt: new Date().toISOString() }
    saveUserQuickWins([...userQuickWins, win])
    setNewQuickWinTitle('')
  }
  const archiveQuickWin = (win: UserQuickWin) => {
    const archived = { ...win, archivedAt: new Date().toISOString() }
    const raw = typeof window !== 'undefined' ? localStorage.getItem(WRAPPED_2026_KEY) : null
    const wrapped: { id: string; title: string; addedAt: string; archivedAt: string }[] = raw ? JSON.parse(raw) : []
    wrapped.unshift(archived)
    if (typeof window !== 'undefined') localStorage.setItem(WRAPPED_2026_KEY, JSON.stringify(wrapped))
    saveUserQuickWins(userQuickWins.filter((w) => w.id !== win.id))
  }

  const statCards = [
    { label: 'Partnerships', value: stats.partnerships, icon: '🤝', href: '/dashboard/partnerships', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
    { label: 'Emails Sent', value: stats.emailsSent, icon: '📧', href: '/dashboard/agents', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
    { label: 'Posts Queued', value: stats.contentQueued, icon: '📱', href: '/dashboard/content/calendar', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
    { label: 'Insights (7d)', value: stats.insightsGathered, icon: '🔍', href: '/dashboard/competitive-intel', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
  ]

  const activityIcon = (t: ActivityItem['type']) => (t === 'contact' ? '👤' : t === 'post' ? '📝' : '💡')

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/30 via-purple-900/20 to-indigo-900/20 p-8 md:p-12 border-2 border-violet-500/30 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-lilac-300 to-purple-300 bg-clip-text text-transparent">
            Welcome back, {userName}
          </h1>
          <p className="text-2xl md:text-3xl text-violet-200 mt-2">{time}</p>
          <p className="text-white/60 text-lg mt-1">{date}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/dashboard/agents/contact-finder">
              <button className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300">
                ➕ Add Contact
              </button>
            </Link>
            <Link href="/dashboard/agents/email-writer">
              <button className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300">
                ✍️ Write Email
              </button>
            </Link>
            <Link href="/dashboard/content/calendar">
              <button className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300">
                📅 Schedule Post
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className={`rounded-2xl border-2 bg-gradient-to-br ${card.color} p-6 backdrop-blur-sm cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300`}>
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className="text-3xl font-bold text-white tabular-nums">{loading ? '—' : card.value}</div>
              <div className="text-sm text-white/70">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column: Activity + Quick Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-violet-500/30 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link href="/dashboard/partnerships" className="text-sm text-violet-400 hover:text-violet-300">View all</Link>
          </div>
          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="text-white/50">No recent activity. Add contacts, schedule posts, or run agents.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id}>
                  <Link href={a.href || '#'} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all group">
                    <span className="text-2xl">{activityIcon(a.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{a.title}</p>
                      {a.subtitle && <p className="text-white/50 text-sm">{a.subtitle}</p>}
                    </div>
                    <span className="text-xs text-white/40 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-violet-500/30 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Wins</h2>
          {loading ? (
            <p className="text-white/50">Loading…</p>
          ) : (
            <>
              {growthPercent !== null && (
                <Link href="/dashboard/analytics" className="block p-3 rounded-lg bg-violet-500/20 border border-violet-500/40 mb-3">
                  <p className="text-white font-medium text-sm">📈 {growthPercent >= 0 ? '+' : ''}{growthPercent}% growth</p>
                  <p className="text-white/50 text-xs">From Analytics (last 30 days)</p>
                </Link>
              )}
              {userQuickWins.length === 0 && growthPercent === null && (
                <p className="text-white/50 text-sm mb-3">Add a win below or track metrics in Analytics for growth %.</p>
              )}
              <ul className="space-y-2 mb-4">
                {userQuickWins.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 group">
                    <span className="text-white font-medium text-sm flex-1">{q.title}</span>
                    <button
                      onClick={() => archiveQuickWin(q)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded-lg bg-violet-500/30 text-violet-200 hover:bg-violet-500/50 transition-all"
                    >
                      Archive
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuickWinTitle}
                  onChange={(e) => setNewQuickWinTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addUserQuickWin()}
                  placeholder="Add a win..."
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm"
                />
                <button
                  onClick={addUserQuickWin}
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-semibold text-white text-sm hover:scale-105 transition-all"
                >
                  Add
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backup to cloud */}
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-white mb-2">☁️ Back up my data</h2>
        <p className="text-white/70 text-sm mb-4">
          Saves todos, Engineering boards, Reference links, Agents schedule, and Personal files to the cloud so you don&apos;t lose them. Restore on this or another device anytime.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={backupToCloud}
            disabled={backupStatus === 'backingup' || backupStatus === 'restoring'}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all"
          >
            {backupStatus === 'backingup' ? 'Backing up…' : 'Backup to cloud'}
          </button>
          <button
            onClick={restoreFromCloud}
            disabled={backupStatus === 'backingup' || backupStatus === 'restoring'}
            className="px-4 py-2 glass-button"
          >
            {backupStatus === 'restoring' ? 'Restoring…' : 'Restore from cloud'}
          </button>
        </div>
        {backupMessage && (
          <p className={`mt-3 text-sm ${backupStatus === 'error' ? 'text-red-300' : 'text-green-200'}`}>
            {backupMessage}
          </p>
        )}
      </div>

      {/* To-Do */}
      <div className="rounded-2xl border border-violet-500/20 bg-white/5 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-white mb-4">📝 To-Do</h2>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {activeTodos.map((todo) => {
            const status = (todo.status ?? (todo.done ? 'completed' : 'not_started')) as TodoStatus
            return (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
                <span className="flex-1 text-white">{todo.text}</span>
                <select
                  value={status}
                  onChange={(e) => setTodoStatus(todo.id, e.target.value as TodoStatus)}
                  className="px-2 py-1 rounded-lg bg-black/30 border border-white/20 text-white text-sm cursor-pointer"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => saveTodos(todos.filter((t) => t.id !== todo.id))} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm">
                  ✕
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTodo.trim()) {
                saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), status: 'not_started' }])
                setNewTodo('')
              }
            }}
            placeholder="Add a to-do..."
            className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button
            onClick={() => {
              if (newTodo.trim()) {
                saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), status: 'not_started' }])
                setNewTodo('')
              }
            }}
            className="px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all"
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  )
}
