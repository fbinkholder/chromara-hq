'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type TodoItem = { id: string; text: string; done: boolean }

type ActivityItem = {
  id: string
  type: 'contact' | 'post' | 'insight'
  title: string
  subtitle?: string
  createdAt: string
  href?: string
}

type QuickWinItem = {
  id: string
  title: string
  date: string
  isToday: boolean
  href: string
}

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
  const [quickWins, setQuickWins] = useState<QuickWinItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const t = new Date()
    setTime(t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    setDate(t.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
  }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('chromara-todos') : null
    if (saved) try { setTodos(JSON.parse(saved)); } catch (_) {}
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

        const today = new Date().toISOString().slice(0, 10)
        const weekEnd = new Date()
        weekEnd.setDate(weekEnd.getDate() + 7)
        const weekEndStr = weekEnd.toISOString().slice(0, 10)
        const { data: calendarData } = await supabase
          .from('content_calendar')
          .select('id, title, scheduled_date')
          .eq('user_id', uid)
          .eq('status', 'scheduled')
          .not('scheduled_date', 'is', null)
          .lte('scheduled_date', weekEndStr)
          .gte('scheduled_date', today)
          .order('scheduled_date', { ascending: true })
          .limit(10)
        setQuickWins((calendarData || []).map((c: { id: string; title: string; scheduled_date: string }) => ({
          id: c.id,
          title: c.title,
          date: c.scheduled_date,
          isToday: c.scheduled_date === today,
          href: '/dashboard/content/calendar',
        })))
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
          ) : quickWins.length === 0 ? (
            <p className="text-white/50">Nothing due this week. Schedule content in the calendar.</p>
          ) : (
            <ul className="space-y-2">
              {quickWins.map((q) => (
                <li key={q.id}>
                  <Link href={q.href} className={`block p-3 rounded-lg transition-all ${q.isToday ? 'bg-violet-500/20 border border-violet-500/40' : 'hover:bg-white/10'}`}>
                    <p className="text-white font-medium text-sm">{q.title}</p>
                    <p className="text-white/50 text-xs">{q.isToday ? 'Today' : new Date(q.date).toLocaleDateString()}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* To-Do */}
      <div className="rounded-2xl border border-violet-500/20 bg-white/5 backdrop-blur-sm p-6">
        <h2 className="text-xl font-bold text-white mb-4">📝 To-Do</h2>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => saveTodos(todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)))}
                className="w-5 h-5 rounded border-2 border-white/40 checked:bg-violet-500 checked:border-violet-500 cursor-pointer"
              />
              <span className={`flex-1 ${todo.done ? 'line-through text-white/40' : 'text-white'}`}>{todo.text}</span>
              <button onClick={() => saveTodos(todos.filter((t) => t.id !== todo.id))} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm">
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTodo.trim()) {
                saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }])
                setNewTodo('')
              }
            }}
            placeholder="Add a to-do..."
            className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button
            onClick={() => {
              if (newTodo.trim()) {
                saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }])
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
