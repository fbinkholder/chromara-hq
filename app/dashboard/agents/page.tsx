'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { CalendarViewModal } from './components/CalendarViewModal'

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
  const supabase = createClient()
  
  useEffect(() => {
    loadStats()
  }, [])
  
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
          <div className="flex gap-3">
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
          {/* Live Activity Feed */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">📊 Live Activity Feed</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              <ActivityItem 
                icon="📧" 
                text="Email sent to Sarah Johnson (L'Oréal)" 
                time="2 minutes ago"
                type="sent"
              />
              <ActivityItem 
                icon="👁️" 
                text="Michael Chen opened your email" 
                time="15 minutes ago"
                type="opened"
              />
              <ActivityItem 
                icon="💬" 
                text="Response received from Emily Rodriguez" 
                time="1 hour ago"
                type="response"
              />
              <ActivityItem 
                icon="🔄" 
                text="Follow-up scheduled for 3 contacts" 
                time="2 hours ago"
                type="scheduled"
              />
              <ActivityItem 
                icon="📅" 
                text="Meeting booked with Sarah Johnson" 
                time="3 hours ago"
                type="meeting"
              />
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">📅 Upcoming This Week</h3>
            <div className="space-y-2">
              <ScheduleItem 
                date="Today, 3:00 PM"
                title="Follow-up to L'Oréal team"
                contacts={3}
              />
              <ScheduleItem 
                date="Tomorrow, 9:00 AM"
                title="Meeting with Estée Lauder"
                contacts={1}
              />
              <ScheduleItem 
                date="Friday, 2:00 PM"
                title="Second follow-up sequence"
                contacts={5}
              />
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
            <h3 className="text-lg font-bold text-white mb-1">Emergency Stop</h3>
            <p className="text-sm text-white/60">Immediately pause all agent activity</p>
          </div>
          <button className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full text-white font-semibold transition-all">
            🛑 Stop All Activity
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
