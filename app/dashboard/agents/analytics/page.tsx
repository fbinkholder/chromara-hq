'use client'

import { useState } from 'react'

type CampaignStats = {
  name: string
  sent: number
  opened: number
  clicked: number
  responded: number
  meetings: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Demo data
  const overallStats = {
    total_sent: 45,
    total_opened: 28,
    total_clicked: 12,
    total_responded: 11,
    total_meetings: 3,
  }

  const openRate = Math.round((overallStats.total_opened / overallStats.total_sent) * 100)
  const responseRate = Math.round((overallStats.total_responded / overallStats.total_sent) * 100)
  const meetingRate = Math.round((overallStats.total_meetings / overallStats.total_sent) * 100)

  const campaigns: CampaignStats[] = [
    {
      name: 'Fortune 500 Beauty Brands',
      sent: 25,
      opened: 18,
      clicked: 8,
      responded: 7,
      meetings: 2,
    },
    {
      name: 'Indie Beauty Brands',
      sent: 15,
      opened: 8,
      clicked: 3,
      responded: 3,
      meetings: 1,
    },
    {
      name: 'Specialty Beauty Retailers',
      sent: 5,
      opened: 2,
      clicked: 1,
      responded: 1,
      meetings: 0,
    },
  ]

  const topPerformers = [
    { name: 'Sarah Johnson', company: "L'Oréal", response_time: '2 hours', status: 'Meeting Booked' },
    { name: 'Michael Chen', company: 'Estée Lauder', response_time: '1 day', status: 'Interested' },
    { name: 'Emily Rodriguez', company: 'Shiseido', response_time: '3 days', status: 'Interested' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics 📈</h1>
          <p className="text-white/60 mt-1">Track campaign performance and responses</p>
        </div>
        <a
          href="/dashboard/agents"
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          ← Back to Agent
        </a>
      </div>

      {/* Time Range Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm mr-2">Time Range:</span>
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Emails Sent" value={overallStats.total_sent} icon="📧" />
        <StatCard label="Open Rate" value={`${openRate}%`} icon="👁️" trend="+5%" />
        <StatCard label="Click Rate" value={`${Math.round((overallStats.total_clicked / overallStats.total_sent) * 100)}%`} icon="🖱️" />
        <StatCard label="Response Rate" value={`${responseRate}%`} icon="💬" trend="+12%" />
        <StatCard label="Meetings Booked" value={overallStats.total_meetings} icon="📅" trend="+1" />
      </div>

      {/* Funnel Visualization */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
        
        <div className="space-y-3">
          <FunnelStep
            label="Sent"
            value={overallStats.total_sent}
            percentage={100}
            color="from-blue-500 to-cyan-500"
          />
          <FunnelStep
            label="Opened"
            value={overallStats.total_opened}
            percentage={openRate}
            color="from-purple-500 to-pink-500"
          />
          <FunnelStep
            label="Clicked"
            value={overallStats.total_clicked}
            percentage={Math.round((overallStats.total_clicked / overallStats.total_sent) * 100)}
            color="from-pink-500 to-rose-500"
          />
          <FunnelStep
            label="Responded"
            value={overallStats.total_responded}
            percentage={responseRate}
            color="from-green-500 to-emerald-500"
          />
          <FunnelStep
            label="Meeting Booked"
            value={overallStats.total_meetings}
            percentage={meetingRate}
            color="from-yellow-500 to-orange-500"
          />
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Campaign Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white font-semibold py-3 px-2">Campaign</th>
                <th className="text-center text-white font-semibold py-3 px-2">Sent</th>
                <th className="text-center text-white font-semibold py-3 px-2">Opened</th>
                <th className="text-center text-white font-semibold py-3 px-2">Clicked</th>
                <th className="text-center text-white font-semibold py-3 px-2">Responded</th>
                <th className="text-center text-white font-semibold py-3 px-2">Meetings</th>
                <th className="text-center text-white font-semibold py-3 px-2">Response Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => {
                const campResponseRate = Math.round((campaign.responded / campaign.sent) * 100)
                return (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-white">{campaign.name}</td>
                    <td className="py-3 px-2 text-center text-white/60">{campaign.sent}</td>
                    <td className="py-3 px-2 text-center text-white/60">{campaign.opened}</td>
                    <td className="py-3 px-2 text-center text-white/60">{campaign.clicked}</td>
                    <td className="py-3 px-2 text-center text-white/60">{campaign.responded}</td>
                    <td className="py-3 px-2 text-center text-white/60">{campaign.meetings}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campResponseRate >= 25 ? 'bg-green-500/20 text-green-300' :
                        campResponseRate >= 15 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {campResponseRate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Contacts</h3>
        
        <div className="space-y-3">
          {topPerformers.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div>
                <h4 className="font-semibold text-white">{contact.name}</h4>
                <p className="text-sm text-white/60">{contact.company}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white/60">Response Time</p>
                  <p className="text-white font-semibold">{contact.response_time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  contact.status === 'Meeting Booked' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {contact.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 bg-green-500/10 border border-green-500/20">
          <h4 className="font-semibold text-white mb-2">✨ Best Performing</h4>
          <p className="text-sm text-white/80 mb-2">
            Strategic Partnership emails have a <strong>28% response rate</strong>
          </p>
          <p className="text-xs text-white/60">
            Fortune 500 brands respond best to data-driven approaches
          </p>
        </div>

        <div className="glass-card p-6 bg-blue-500/10 border border-blue-500/20">
          <h4 className="font-semibold text-white mb-2">💡 Recommendation</h4>
          <p className="text-sm text-white/80 mb-2">
            Follow up within <strong>48 hours</strong> for best results
          </p>
          <p className="text-xs text-white/60">
            Your fastest responses came from 2nd follow-up
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, trend }: { 
  label: string
  value: number | string
  icon: string
  trend?: string
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      {trend && (
        <p className="text-xs text-green-400">↗ {trend}</p>
      )}
    </div>
  )
}

function FunnelStep({ label, value, percentage, color }: {
  label: string
  value: number
  percentage: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="text-sm text-white/60">{value} ({percentage}%)</span>
      </div>
      <div className="h-8 bg-white/10 rounded-lg overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 flex items-center justify-end px-3`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-white text-xs font-semibold">{percentage}%</span>
        </div>
      </div>
    </div>
  )
}
