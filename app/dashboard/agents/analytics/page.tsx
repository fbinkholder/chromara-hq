'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type CampaignStats = {
  name: string
  sent: number
  opened: number
  clicked: number
  responded: number
  meetings: number
}

type TopContact = {
  id: string
  name: string
  company: string
  status: string
  response_time: string
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const [overallStats, setOverallStats] = useState({
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
    total_responded: 0,
    total_meetings: 0,
  })
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([])
  const [topPerformers, setTopPerformers] = useState<TopContact[]>([])
  const [insightMessage, setInsightMessage] = useState<string | null>(null)

  const supabase = createClient()

  const getSince = (): string | null => {
    if (timeRange === 'all') return null
    const d = new Date()
    if (timeRange === '7d') d.setDate(d.getDate() - 7)
    else if (timeRange === '30d') d.setDate(d.getDate() - 30)
    else if (timeRange === '90d') d.setDate(d.getDate() - 90)
    return d.toISOString()
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const since = getSince()

      // Sent emails in range (with opened/clicked from Resend webhooks)
      let sentQuery = supabase
        .from('sent_emails')
        .select('id, contact_id, opened, clicked, sent_at')
        .eq('user_id', user.id)
      if (since) sentQuery = sentQuery.gte('sent_at', since)

      const { data: sentRows } = await sentQuery

      const emails = sentRows || []
      const total_sent = emails.length
      const total_opened = emails.filter((e: { opened?: boolean }) => e.opened === true).length
      const total_clicked = emails.filter((e: { clicked?: boolean }) => e.clicked === true).length

      // Responses: outreach_contacts marked response_received (in range by updated_at)
      let respondedQuery = supabase
        .from('outreach_contacts')
        .select('id, contact_name, company, segment, status, response_received, updated_at')
        .eq('user_id', user.id)
        .eq('response_received', true)
      if (since) respondedQuery = respondedQuery.gte('updated_at', since)

      const { data: respondedContacts } = await respondedQuery
      const respondedList = respondedContacts || []
      const total_responded = respondedList.length
      const total_meetings = respondedList.filter((c: { status?: string }) => c.status === 'moving_forward').length

      setOverallStats({
        total_sent,
        total_opened,
        total_clicked,
        total_responded,
        total_meetings,
      })

      // Campaign performance by segment
      const contactIds = [...new Set(emails.map((e: { contact_id?: string }) => e.contact_id).filter(Boolean) as string[])]
      let segmentByContactId: Record<string, string> = {}
      if (contactIds.length > 0) {
        const { data: contactRows } = await supabase
          .from('outreach_contacts')
          .select('id, segment')
          .in('id', contactIds)
        contactRows?.forEach((c: { id: string; segment: string }) => {
          segmentByContactId[c.id] = c.segment || 'Other'
        })
      }

      const segmentSent: Record<string, { sent: number; opened: number; clicked: number }> = {}
      emails.forEach((e: { contact_id?: string; opened?: boolean; clicked?: boolean }) => {
        const seg = (e.contact_id && segmentByContactId[e.contact_id]) || 'Other'
        if (!segmentSent[seg]) segmentSent[seg] = { sent: 0, opened: 0, clicked: 0 }
        segmentSent[seg].sent++
        if (e.opened) segmentSent[seg].opened++
        if (e.clicked) segmentSent[seg].clicked++
      })

      const segmentResponded: Record<string, number> = {}
      const segmentMeetings: Record<string, number> = {}
      respondedList.forEach((c: { segment?: string; status?: string }) => {
        const seg = c.segment || 'Other'
        segmentResponded[seg] = (segmentResponded[seg] || 0) + 1
        if (c.status === 'moving_forward') segmentMeetings[seg] = (segmentMeetings[seg] || 0) + 1
      })

      const segments = [...new Set([...Object.keys(segmentSent), ...Object.keys(segmentResponded)])]
      const campaignStats: CampaignStats[] = segments.map((seg) => ({
        name: seg,
        sent: segmentSent[seg]?.sent ?? 0,
        opened: segmentSent[seg]?.opened ?? 0,
        clicked: segmentSent[seg]?.clicked ?? 0,
        responded: segmentResponded[seg] ?? 0,
        meetings: segmentMeetings[seg] ?? 0,
      })).filter((c) => c.sent > 0 || c.responded > 0).sort((a, b) => b.sent - a.sent)

      setCampaigns(campaignStats)

      // Top performers: responded contacts, most recent first
      const top = respondedList
        .slice(0, 10)
        .map((c: { id: string; contact_name?: string; company?: string; status?: string; updated_at?: string }) => ({
          id: c.id,
          name: c.contact_name || 'Contact',
          company: c.company || '—',
          status: c.status === 'moving_forward' ? 'Meeting Booked' : c.status === 'interested' ? 'Interested' : 'Responded',
          response_time: c.updated_at ? formatTimeAgo(new Date(c.updated_at).getTime(), Date.now()) : '—',
        }))
      setTopPerformers(top)

      // Simple insight from real data
      if (total_sent > 0 && campaignStats.length > 0) {
        const best = campaignStats.reduce((a, b) => (a.responded / Math.max(1, a.sent)) > (b.responded / Math.max(1, b.sent)) ? a : b)
        const rate = Math.round((best.responded / best.sent) * 100)
        setInsightMessage(`"${best.name}" segment has a ${rate}% response rate (${best.responded}/${best.sent} sent).`)
      } else {
        setInsightMessage(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (then: number, now: number): string => {
    const diffMs = now - then
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 7)}w ago`
  }

  const total_sent = overallStats.total_sent
  const openRate = total_sent > 0 ? Math.round((overallStats.total_opened / total_sent) * 100) : 0
  const clickRate = total_sent > 0 ? Math.round((overallStats.total_clicked / total_sent) * 100) : 0
  const responseRate = total_sent > 0 ? Math.round((overallStats.total_responded / total_sent) * 100) : 0
  const meetingRate = total_sent > 0 ? Math.round((overallStats.total_meetings / total_sent) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/60 mt-1">Track campaign performance and responses (Resend opens/clicks + marked responses)</p>
        </div>
        <Link
          href="/dashboard/agents"
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          ← Back to Agent
        </Link>
      </div>

      <div className="glass-card p-4">
        <div className="flex gap-2">
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

      {loading ? (
        <p className="text-white/50">Loading analytics…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Emails Sent" value={overallStats.total_sent} icon="📧" />
            <StatCard label="Open Rate" value={total_sent > 0 ? `${openRate}%` : '0%'} icon="👁️" subLabel={total_sent > 0 ? `${overallStats.total_opened} opened` : undefined} />
            <StatCard label="Click Rate" value={total_sent > 0 ? `${clickRate}%` : '0%'} icon="🖱️" subLabel={total_sent > 0 ? `${overallStats.total_clicked} clicked` : undefined} />
            <StatCard label="Response Rate" value={total_sent > 0 ? `${responseRate}%` : '0%'} icon="💬" subLabel={total_sent > 0 ? `${overallStats.total_responded} responded` : undefined} />
            <StatCard label="Meetings Booked" value={overallStats.total_meetings} icon="📅" />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
            {total_sent === 0 ? (
              <p className="text-white/50">No emails sent in this period. Send emails via the Email Writer and track opens via Resend webhooks.</p>
            ) : (
              <div className="space-y-3">
                <FunnelStep label="Sent" value={overallStats.total_sent} percentage={100} color="from-blue-500 to-cyan-500" />
                <FunnelStep label="Opened" value={overallStats.total_opened} percentage={openRate} color="from-purple-500 to-pink-500" />
                <FunnelStep label="Clicked" value={overallStats.total_clicked} percentage={clickRate} color="from-pink-500 to-rose-500" />
                <FunnelStep label="Responded" value={overallStats.total_responded} percentage={responseRate} color="from-green-500 to-emerald-500" />
                <FunnelStep label="Meeting Booked" value={overallStats.total_meetings} percentage={meetingRate} color="from-yellow-500 to-orange-500" />
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Performance by Segment</h3>
            {campaigns.length === 0 ? (
              <p className="text-white/50">No segment data yet. Emails linked to contacts (with segment) will appear here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3 px-2">Segment</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Sent</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Opened</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Clicked</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Responded</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Meetings</th>
                      <th className="text-center text-white font-semibold py-3 px-2">Response Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c, i) => {
                      const campResponseRate = c.sent > 0 ? Math.round((c.responded / c.sent) * 100) : 0
                      return (
                        <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-2 text-white">{c.name}</td>
                          <td className="py-3 px-2 text-center text-white/60">{c.sent}</td>
                          <td className="py-3 px-2 text-center text-white/60">{c.opened}</td>
                          <td className="py-3 px-2 text-center text-white/60">{c.clicked}</td>
                          <td className="py-3 px-2 text-center text-white/60">{c.responded}</td>
                          <td className="py-3 px-2 text-center text-white/60">{c.meetings}</td>
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
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Performing Contacts</h3>
            {topPerformers.length === 0 ? (
              <p className="text-white/50">No responses yet. Mark contacts as &quot;Responded&quot; or &quot;Meeting Booked&quot; in Partnerships to see them here.</p>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10">
                    <div>
                      <h4 className="font-semibold text-white">{c.name}</h4>
                      <p className="text-sm text-white/60">{c.company}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-white/60">Response</p>
                        <p className="text-white font-semibold">{c.response_time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'Meeting Booked' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 bg-chromara-purple/10 border border-chromara-purple/20">
              <h4 className="font-semibold text-white mb-2">How tracking works</h4>
              <p className="text-sm text-white/80 mb-2">
                <strong>Opens & clicks</strong> come from Resend webhooks when recipients open or click links. Ensure your Resend project has webhooks pointing to <code className="text-xs bg-black/30 px-1 rounded">/api/webhooks/resend</code>.
              </p>
              <p className="text-xs text-white/60">
                <strong>Responses & meetings</strong> are from your Partnerships/outreach contacts: mark contacts as Responded or Moving Forward to see them here.
              </p>
            </div>
            <div className="glass-card p-6 bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-semibold text-white mb-2">Gmail sync (optional)</h4>
              <p className="text-sm text-white/80 mb-2">
                To auto-detect replies from your Gmail inbox, you can add a Gmail API integration later (e.g. watch for new messages and match to sent_emails by thread/recipient).
              </p>
              <p className="text-xs text-white/60">
                For now, manually marking contacts as &quot;Responded&quot; in Partnerships keeps your response rate accurate.
              </p>
            </div>
          </div>

          {insightMessage && (
            <div className="glass-card p-6 bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-white mb-2">Best performing</h4>
              <p className="text-sm text-white/80">{insightMessage}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, subLabel }: {
  label: string
  value: number | string
  icon: string
  subLabel?: string
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60">{label}</p>
      {subLabel && <p className="text-xs text-white/40 mt-1">{subLabel}</p>}
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
          style={{ width: `${Math.min(100, percentage)}%` }}
        >
          {percentage > 15 && <span className="text-white text-xs font-semibold">{percentage}%</span>}
        </div>
      </div>
    </div>
  )
}
