'use client'

import { useState } from 'react'

type CalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  type: 'email' | 'follow-up' | 'meeting'
  contacts: string[]
  status: 'scheduled' | 'completed' | 'pending'
}

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    date: '2026-02-08',
    time: '3:00 PM',
    title: 'Follow-up to L\'Oréal team',
    type: 'follow-up',
    contacts: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
    status: 'scheduled',
  },
  {
    id: '2',
    date: '2026-02-09',
    time: '9:00 AM',
    title: 'Meeting with Estée Lauder',
    type: 'meeting',
    contacts: ['Sarah Johnson'],
    status: 'scheduled',
  },
  {
    id: '3',
    date: '2026-02-09',
    time: '2:00 PM',
    title: 'Initial outreach to indie brands',
    type: 'email',
    contacts: ['5 contacts'],
    status: 'scheduled',
  },
  {
    id: '4',
    date: '2026-02-10',
    time: '10:00 AM',
    title: 'Second follow-up sequence',
    type: 'follow-up',
    contacts: ['8 contacts'],
    status: 'pending',
  },
  {
    id: '5',
    date: '2026-02-11',
    time: '4:00 PM',
    title: 'Final follow-up to non-responders',
    type: 'follow-up',
    contacts: ['3 contacts'],
    status: 'pending',
  },
]

export function CalendarViewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (!isOpen) return null

  // Group events by date
  const eventsByDate = DEMO_EVENTS.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = []
    }
    acc[event.date].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const dates = Object.keys(eventsByDate).sort()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">📅 Calendar View</h2>
            <p className="text-white/60 text-sm mt-1">Upcoming emails, follow-ups, and meetings</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline View */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">⏰ Timeline</h3>
              <div className="space-y-4">
                {dates.map(date => {
                  const dateObj = new Date(date)
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const isToday = date === '2026-02-08'
                  const events = eventsByDate[date]

                  return (
                    <div key={date} className="space-y-2">
                      <div className={`flex items-center gap-3 ${isToday ? 'text-chromara-pink' : 'text-white/60'}`}>
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                          isToday ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink' : 'bg-white/10'
                        }`}>
                          <span className={`text-xs ${isToday ? 'text-white' : 'text-white/60'}`}>
                            {dayName.slice(0, 3)}
                          </span>
                          <span className={`text-lg font-bold ${isToday ? 'text-white' : 'text-white'}`}>
                            {dateObj.getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{dayName}</p>
                          <p className="text-xs text-white/60">{dateStr}</p>
                        </div>
                        <div className="ml-auto px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                          {events.length} event{events.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="ml-16 space-y-2">
                        {events.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Event Summary */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📊 Summary</h3>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📧</span>
                    <p className="text-2xl font-bold text-white">
                      {DEMO_EVENTS.filter(e => e.type === 'email').length}
                    </p>
                  </div>
                  <p className="text-xs text-white/60">Emails Scheduled</p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔄</span>
                    <p className="text-2xl font-bold text-white">
                      {DEMO_EVENTS.filter(e => e.type === 'follow-up').length}
                    </p>
                  </div>
                  <p className="text-xs text-white/60">Follow-ups</p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <p className="text-2xl font-bold text-white">
                      {DEMO_EVENTS.filter(e => e.type === 'meeting').length}
                    </p>
                  </div>
                  <p className="text-xs text-white/60">Meetings</p>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">👥</span>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                  <p className="text-xs text-white/60">Total Contacts</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">⚡ Quick Actions</h4>
                
                <button className="w-full glass-card p-3 hover:bg-white/10 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📧</span>
                      <span className="text-white text-sm">Send test email</span>
                    </div>
                    <span className="text-white/40">→</span>
                  </div>
                </button>

                <button className="w-full glass-card p-3 hover:bg-white/10 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔄</span>
                      <span className="text-white text-sm">Review follow-up sequences</span>
                    </div>
                    <span className="text-white/40">→</span>
                  </div>
                </button>

                <button className="w-full glass-card p-3 hover:bg-white/10 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📊</span>
                      <span className="text-white text-sm">View analytics</span>
                    </div>
                    <span className="text-white/40">→</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  const typeIcons = {
    email: '📧',
    'follow-up': '🔄',
    meeting: '📅',
  }

  const typeColors = {
    email: 'bg-blue-500/20 text-blue-300',
    'follow-up': 'bg-purple-500/20 text-purple-300',
    meeting: 'bg-green-500/20 text-green-300',
  }

  const statusColors = {
    scheduled: 'bg-green-500/20 text-green-300',
    completed: 'bg-gray-500/20 text-gray-300',
    pending: 'bg-yellow-500/20 text-yellow-300',
  }

  return (
    <div className="glass-card p-3 hover:bg-white/10 transition-all">
      <div className="flex items-start gap-3">
        <span className="text-xl">{typeIcons[event.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-semibold text-sm">{event.title}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[event.type]}`}>
              {event.type}
            </span>
          </div>
          <p className="text-xs text-white/60 mb-1">{event.time} • {event.contacts.join(', ')}</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[event.status]}`}>
            {event.status}
          </span>
        </div>
      </div>
    </div>
  )
}
