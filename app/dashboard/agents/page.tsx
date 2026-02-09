'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { CalendarViewModal } from './components/CalendarViewModal'

const ACTIVITY_STORAGE_KEY = 'chromara-mission-activity'
const SCHEDULE_STORAGE_KEY = 'chromara-mission-schedule'

type ActivityType = 'sent' | 'opened' | 'response' | 'scheduled' | 'meeting'
type ActivityItem = { id: string; icon: string; text: string; time: string; type: ActivityType; source: 'real' | 'custom' }
type ScheduleItemData = { id: string; date: string; title: string; contacts: number }

export default function OutreachAgentPage() {
  const [agentActive, setAgentActive] = useState(false)
  const [dailyLimit, setDailyLimit] = useState(50)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  
  // Real stats from Supabase
  const [stats, setStats] = useState({
    brandsContacted: 0,
    emailsSent: 0,
    followUpsSent: 0,
    responses: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [runningAgentsCount, setRunningAgentsCount] = useState(0)
  const [stoppingAgents, setStoppingAgents] = useState(false)
  const supabase = createClient()

  // Mission Control: real + editable custom items
  const [realActivity, setRealActivity] = useState<ActivityItem[]>([])
  const [customActivity, setCustomActivity] = useState<ActivityItem[]>([])
  const [scheduleItems, setScheduleItems] = useState<ScheduleItemData[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])

  const loadRunningAgents = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('agent_activity')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'running')
      if (!error) setRunningAgentsCount(count ?? 0)
    } catch (_) {}
  }, [supabase])

  useEffect(() => {
    loadRunningAgents()
  }, [loadRunningAgents])

  const stopAllAgents = async () => {
    setStoppingAgents(true)
    try {
      const res = await fetch('/api/agents/stop', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to stop')
      setRunningAgentsCount(0)
      if (data.stopped > 0) alert(`Stopped ${data.stopped} agent(s).`)
    } catch (e) {
      alert(String(e))
    } finally {
      setStoppingAgents(false)
    }
  }

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(ACTIVITY_STORAGE_KEY) : null
    if (saved) {
      try {
        setCustomActivity(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(SCHEDULE_STORAGE_KEY) : null
    if (saved) {
      try {
        setScheduleItems(JSON.parse(saved))
      } catch (_) {}
    }
  }, [])

  const loadMissionControl = useCallback(async () => {
    setLoadingActivity(true)
    try {
      const items: ActivityItem[] = []
      const now = Date.now()

      const { data: sentRows } = await supabase
        .from('sent_emails')
        .select('id, recipient_email, subject, sent_at, opened, contact_id')
        .order('sent_at', { ascending: false })
        .limit(15)

      if (sentRows?.length) {
        const contactIds = [...new Set((sentRows.map(r => r.contact_id).filter(Boolean) as string[]))]
        let contactMap: Record<string, { contact_name?: string; company?: string }> = {}
        if (contactIds.length > 0) {
          const { data: contacts } = await supabase
            .from('outreach_contacts')
            .select('id, contact_name, company')
            .in('id', contactIds)
          contacts?.forEach(c => { contactMap[c.id] = { contact_name: c.contact_name, company: c.company } })
        }
        for (const row of sentRows) {
          const name = row.contact_id && contactMap[row.contact_id]?.contact_name
          const company = row.contact_id && contactMap[row.contact_id]?.company
          const label = name ? `${name}${company ? ` (${company})` : ''}` : row.recipient_email
          const timeAgo = row.sent_at ? formatTimeAgo(new Date(row.sent_at).getTime(), now) : 'recently'
          items.push({
            id: `sent-${row.id}`,
            icon: '📧',
            text: `Email sent to ${label}`,
            time: timeAgo,
            type: 'sent',
            source: 'real',
          })
          if (row.opened) {
            items.push({
              id: `opened-${row.id}`,
              icon: '👁️',
              text: `${label} opened your email`,
              time: timeAgo,
              type: 'opened',
              source: 'real',
            })
          }
        }
      }

      const { data: responded } = await supabase
        .from('outreach_contacts')
        .select('id, contact_name, company, updated_at')
        .eq('response_received', true)
        .order('updated_at', { ascending: false })
        .limit(10)

      responded?.forEach(row => {
        const label = row.contact_name ? `${row.contact_name}${row.company ? ` (${row.company})` : ''}` : 'Contact'
        const timeAgo = row.updated_at ? formatTimeAgo(new Date(row.updated_at).getTime(), now) : 'recently'
        items.push({
          id: `response-${row.id}`,
          icon: '💬',
          text: `Response received from ${label}`,
          time: timeAgo,
          type: 'response',
          source: 'real',
        })
      })

      setRealActivity(items)
    } catch (e) {
      console.error('Error loading mission control activity:', e)
    } finally {
      setLoadingActivity(false)
    }
  }, [supabase])

  useEffect(() => {
    loadMissionControl()
  }, [loadMissionControl])

  const mergedActivity = [...realActivity, ...customActivity].slice(0, 25)

  const addCustomActivity = () => {
    const text = prompt('Activity text (e.g. "Email sent to Jane at Glossier")')
    if (!text?.trim()) return
    const time = prompt('When? (e.g. "2 minutes ago", "1 hour ago")', 'Just now')
    const item: ActivityItem = {
      id: `custom-${Date.now()}`,
      icon: '📌',
      text: text.trim(),
      time: (time || 'Just now').trim(),
      type: 'sent',
      source: 'custom',
    }
    const next = [item, ...customActivity]
    setCustomActivity(next)
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next))
  }

  const removeCustomActivity = (id: string) => {
    const next = customActivity.filter(a => a.id !== id)
    setCustomActivity(next)
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next))
  }

  const saveScheduleItems = (next: ScheduleItemData[]) => {
    setScheduleItems(next)
    if (typeof window !== 'undefined') localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(next))
  }

  const addScheduleItem = () => {
    const title = prompt('Title (e.g. Follow-up to L\'Oréal team)')
    if (!title?.trim()) return
    const date = prompt('Date/time (e.g. Today, 3:00 PM)', 'Today')
    const contactsStr = prompt('Number of contacts', '1')
    const contacts = Math.max(0, parseInt(contactsStr || '1', 10) || 1)
    const item: ScheduleItemData = {
      id: `sched-${Date.now()}`,
      date: (date || 'Today').trim(),
      title: title.trim(),
      contacts,
    }
    saveScheduleItems([...scheduleItems, item])
  }

  const editScheduleItem = (id: string) => {
    const item = scheduleItems.find(s => s.id === id)
    if (!item) return
    const title = prompt('Title', item.title)
    if (title === null) return
    const date = prompt('Date/time', item.date)
    if (date === null) return
    const contactsStr = prompt('Number of contacts', String(item.contacts))
    const contacts = contactsStr !== null ? (Math.max(0, parseInt(contactsStr, 10) || 0)) : item.contacts
    const next = scheduleItems.map(s =>
      s.id === id ? { ...s, title: title ?? s.title, date: date ?? s.date, contacts } : s
    )
    saveScheduleItems(next)
  }

  const removeScheduleItem = (id: string) => {
    saveScheduleItems(scheduleItems.filter(s => s.id !== id))
  }

  function formatTimeAgo(ts: number, now: number): string {
    const d = Math.floor((now - ts) / 1000)
    if (d < 60) return 'Just now'
    if (d < 3600) return `${Math.floor(d / 60)} minutes ago`
    if (d < 86400) return `${Math.floor(d / 3600)} hours ago`
    if (d < 604800) return `${Math.floor(d / 86400)} days ago`
    return 'Earlier'
  }
  
  const loadStats = async () => {
    try {
      // Count beauty brands contacted
      const { count: brandsCount } = await supabase
        .from('outreach_contacts')
        .select('*', { count: 'exact', head: true })
        .ilike('segment', '%beauty%')
      
      // Count all emails sent
      const { count: emailsCount } = await supabase
        .from('sent_emails')
        .select('*', { count: 'exact', head: true })
      
      // Count follow-ups (emails with variant names)
      const { count: followUpsCount } = await supabase
        .from('sent_emails')
        .select('*', { count: 'exact', head: true })
        .not('variant_name', 'is', null)
      
      // Count responses (contacts who responded)
      const { count: responsesCount } = await supabase
        .from('outreach_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('response_received', true)
      
      setStats({
        brandsContacted: brandsCount || 0,
        emailsSent: emailsCount || 0,
        followUpsSent: followUpsCount || 0,
        responses: responsesCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Outreach Agent 🤖</h1>
        <p className="text-white/60 text-lg">AI-powered contact finding, email writing, and auto follow-ups</p>
      </div>

      {/* Agent Status */}
      <div className="glass-card p-8 text-center">
        <div className="mb-6">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
            agentActive 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <span className="text-2xl">{agentActive ? '🟢' : '⚪'}</span>
            <span className="text-white font-semibold text-lg">
              {agentActive ? 'AGENT ACTIVE' : 'AGENT INACTIVE'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setAgentActive(!agentActive)}
          className={`glass-button text-lg px-8 py-4 ${
            agentActive ? 'bg-red-500/20 hover:bg-red-500/30' : ''
          }`}
        >
          {agentActive ? '⏸️ Pause Agent' : '▶️ Activate Agent'}
        </button>

        {agentActive && (
          <div className="mt-4 text-sm text-white/60">
            Agent is running. Daily limit: {dailyLimit} contacts
          </div>
        )}
      </div>

      {/* Mission Control Board */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">🎛️ Mission Control</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={loadMissionControl}
              disabled={loadingActivity}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all disabled:opacity-50"
            >
              {loadingActivity ? '⏳ Loading…' : '🔄 Refresh'}
            </button>
            <button 
              onClick={() => setShowGlobalSearch(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              🔍 Global Search
            </button>
            <button 
              onClick={() => setShowCalendar(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              📅 Calendar View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Activity Feed - real data + editable custom items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">📊 Live Activity Feed</h3>
              <button
                type="button"
                onClick={addCustomActivity}
                className="text-xs px-3 py-1.5 bg-chromara-purple/30 hover:bg-chromara-purple/50 text-white rounded-lg transition-all"
              >
                + Add activity
              </button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {loadingActivity && mergedActivity.length === 0 ? (
                <p className="text-sm text-white/50 py-4">Loading activity…</p>
              ) : mergedActivity.length === 0 ? (
                <p className="text-sm text-white/50 py-4">No activity yet. Send emails or add one manually.</p>
              ) : (
                mergedActivity.map((item) => (
                  <div key={item.id} className="relative group">
                    <ActivityItem icon={item.icon} text={item.text} time={item.time} type={item.type} />
                    {item.source === 'custom' && (
                      <button
                        type="button"
                        onClick={() => removeCustomActivity(item.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-opacity"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Schedule - fully editable */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">📅 Upcoming This Week</h3>
              <button
                type="button"
                onClick={addScheduleItem}
                className="text-xs px-3 py-1.5 bg-chromara-purple/30 hover:bg-chromara-purple/50 text-white rounded-lg transition-all"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {scheduleItems.length === 0 ? (
                <p className="text-sm text-white/50 py-4">No upcoming items. Add one to get started.</p>
              ) : (
                scheduleItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                    <ScheduleItem date={item.date} title={item.title} contacts={item.contacts} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => editScheduleItem(item.id)}
                        className="text-xs px-2 py-1 text-white/80 hover:text-white rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeScheduleItem(item.id)}
                        className="text-xs px-2 py-1 text-red-400 hover:text-red-300 rounded"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

     {/* Quick Stats */}
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Beauty Brands Contacted" 
          value={loadingStats ? "..." : stats.brandsContacted.toString()} 
          icon="💄" 
        />
        <StatCard 
          label="Emails Sent" 
          value={loadingStats ? "..." : stats.emailsSent.toString()} 
          icon="📧" 
        />
        <StatCard 
          label="Follow-ups Sent" 
          value={loadingStats ? "..." : stats.followUpsSent.toString()} 
          icon="🔄" 
        />
        <StatCard 
          label="Responses" 
          value={loadingStats ? "..." : stats.responses.toString()} 
          icon="💬" 
        />
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon="📱"
          title="Social Media Manager"
          description="Generate and schedule posts with Claude"
          badge="Claude"
          badgeColor="from-purple-500 to-pink-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/social-media'}
        />
        <FeatureCard
          icon="🔍"
          title="Market Intelligence"
          description="Scrape SEO, competitors, trends, consumer insights"
          badge="Firecrawl"
          badgeColor="from-orange-500 to-amber-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/market-intel'}
        />
        <FeatureCard
          icon="📄"
          title="Patent Tracker"
          description="Monitor USPTO filings for competitors"
          badge="USPTO"
          badgeColor="from-slate-500 to-slate-600"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/patent-tracker'}
        />
        <FeatureCard
          icon="👥"
          title="Contact Intelligence"
          description="Find contacts by company domain"
          badge="Firecrawl"
          badgeColor="from-cyan-500 to-blue-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/contact-intel'}
        />
        {/* Contact Finder */}
        <FeatureCard
          icon="🔍"
          title="Contact Finder"
          description="Search Apollo.io and auto-add to partnership tracker"
          badge="Apollo.io"
          badgeColor="from-blue-500 to-cyan-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/contact-finder'}
        />

        {/* Email Writer */}
        <FeatureCard
          icon="✍️"
          title="AI Email Writer"
          description="Generate personalized emails with Claude"
          badge="Claude AI"
          badgeColor="from-purple-500 to-pink-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/email-writer'}
        />

        {/* Campaign Manager */}
        <FeatureCard
          icon="📊"
          title="Campaign Manager"
          description="Create and manage outreach campaigns"
          badge="Campaigns"
          badgeColor="from-green-500 to-emerald-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/campaigns'}
        />

        {/* Email Queue */}
        <FeatureCard
          icon="📬"
          title="Email Queue"
          description="Review and approve emails before sending"
          badge="Review"
          badgeColor="from-yellow-500 to-orange-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/queue'}
        />

        {/* Follow-up Sequences */}
        <FeatureCard
          icon="🔄"
          title="Auto Follow-ups"
          description="Set up automatic follow-up sequences"
          badge="Automation"
          badgeColor="from-pink-500 to-rose-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/follow-ups'}
        />

        {/* Analytics */}
        <FeatureCard
          icon="📈"
          title="Analytics"
          description="Track campaign performance and responses"
          badge="Insights"
          badgeColor="from-indigo-500 to-purple-500"
          comingSoon={false}
          onClick={() => window.location.href = '/dashboard/agents/analytics'}
        />
      </div>

      {/* Settings */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Agent Settings</h3>
        
        <div className="space-y-4">
          {/* Daily Limit */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Daily Contact Limit
            </label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="glass-input w-full md:w-64"
              min="1"
              max="200"
            />
            <p className="text-xs text-white/40 mt-1">
              Maximum contacts to process per day (recommended: 50)
            </p>
          </div>

          {/* API Keys Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">Apollo.io API</span>
                <span className="text-green-400 text-xs">✓ Connected</span>
              </div>
              <p className="text-xs text-white/40">Contact finding enabled</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">Resend API</span>
                <span className="text-green-400 text-xs">✓ Connected</span>
              </div>
              <p className="text-xs text-white/40">Email sending enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StepCard number="1" title="Find Contacts" description="Search Apollo.io by company, title, industry" />
          <StepCard number="2" title="Generate Emails" description="Claude writes personalized emails" />
          <StepCard number="3" title="Review Queue" description="Approve emails before sending" />
          <StepCard number="4" title="Send Campaign" description="Resend delivers emails" />
          <StepCard number="5" title="Auto Follow-up" description="Agent sends follow-ups automatically" />
        </div>
      </div>

      {/* Emergency Stop */}
      <div className="glass-card p-6 border-2 border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Stop Agent Activity</h3>
            <p className="text-sm text-white/60">
              {runningAgentsCount > 0
                ? `${runningAgentsCount} agent(s) running. Click to stop all.`
                : 'Immediately stop all agents that are running.'}
            </p>
          </div>
          <button
            onClick={stopAllAgents}
            disabled={stoppingAgents || runningAgentsCount === 0}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-semibold transition-all"
          >
            {stoppingAgents ? 'Stopping…' : `🛑 Stop All Agents${runningAgentsCount > 0 ? ` (${runningAgentsCount})` : ''}`}
          </button>
        </div>
      </div>

      {/* Modals */}
      <GlobalSearchModal isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      <CalendarViewModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  badge, 
  badgeColor,
  comingSoon,
  onClick 
}: { 
  icon: string
  title: string
  description: string
  badge: string
  badgeColor: string
  comingSoon?: boolean
  onClick?: () => void
}) {
  return (
    <div 
      onClick={comingSoon ? undefined : onClick}
      className={`glass-card p-6 ${comingSoon ? 'opacity-50' : 'hover:scale-[1.02] cursor-pointer'} transition-all group relative`}
    >
      {comingSoon && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold">
          Coming Soon
        </div>
      )}

      <div className="text-4xl mb-4">{icon}</div>
      
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-chromara-pink transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-white/60 mb-4">
        {description}
      </p>

      <div className={`inline-block px-3 py-1 bg-gradient-to-r ${badgeColor} rounded-full text-white text-xs font-semibold`}>
        {badge}
      </div>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink text-white font-bold text-lg mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  )
}

function ActivityItem({ icon, text, time, type }: {
  icon: string
  text: string
  time: string
  type: 'sent' | 'opened' | 'response' | 'scheduled' | 'meeting'
}) {
  const colors = {
    sent: 'border-blue-500/30',
    opened: 'border-purple-500/30',
    response: 'border-green-500/30',
    scheduled: 'border-yellow-500/30',
    meeting: 'border-pink-500/30',
  }

  return (
    <div className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg border-l-2 ${colors[type]}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{text}</p>
        <p className="text-xs text-white/40">{time}</p>
      </div>
    </div>
  )
}

function ScheduleItem({ date, title, contacts }: {
  date: string
  title: string
  contacts: number
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/60">{date}</p>
      </div>
      <span className="px-3 py-1 bg-chromara-purple/20 text-chromara-pink rounded-full text-xs font-semibold">
        {contacts} contact{contacts !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
