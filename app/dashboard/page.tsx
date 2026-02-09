'use client'

import { useEffect, useState } from 'react'

type TodoItem = { id: string; text: string; done: boolean }
type Priority = { id: string; text: string }
type Deadline = { id: string; text: string; date: string }

export default function HomeDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [newDeadline, setNewDeadline] = useState({ text: '', date: '' })

  useEffect(() => {
    const savedTodos = localStorage.getItem('chromara-todos')
    const savedPriorities = localStorage.getItem('chromara-priorities')
    const savedDeadlines = localStorage.getItem('chromara-deadlines')
    
    if (savedTodos) setTodos(JSON.parse(savedTodos))
    if (savedPriorities) setPriorities(JSON.parse(savedPriorities))
    if (savedDeadlines) setDeadlines(JSON.parse(savedDeadlines))
  }, [])

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos)
    localStorage.setItem('chromara-todos', JSON.stringify(newTodos))
  }

  const savePriorities = (newPriorities: Priority[]) => {
    setPriorities(newPriorities)
    localStorage.setItem('chromara-priorities', JSON.stringify(newPriorities))
  }

  const saveDeadlines = (newDeadlines: Deadline[]) => {
    setDeadlines(newDeadlines)
    localStorage.setItem('chromara-deadlines', JSON.stringify(newDeadlines))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🏠 Command Center</h1>

      {/* Weekly Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Partnerships" value="12" icon="🤝" href="/dashboard/partnerships" />
        <StatCard label="Emails Sent" value="45" icon="📧" href="/dashboard/agents" />
        <StatCard label="Content Scheduled" value="8" icon="📱" href="/dashboard/content" />
        <StatCard label="Investor Conversations" value="5" icon="💰" href="/dashboard/fundraising" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* To-Do List */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📝 To-Do List</h2>
          
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => saveTodos(todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t))}
                  className="w-5 h-5 rounded border-2 border-white/40 checked:bg-chromara-purple checked:border-chromara-purple cursor-pointer"
                />
                <span className={`flex-1 ${todo.done ? 'line-through text-white/40' : 'text-white'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => saveTodos(todos.filter(t => t.id !== todo.id))}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-all"
                >
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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTodo.trim()) {
                  saveTodos([...todos, { id: Date.now().toString(), text: newTodo, done: false }])
                  setNewTodo('')
                }
              }}
              placeholder="Add a to-do..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
            />
            <button 
              onClick={() => {
                if (newTodo.trim()) {
                  saveTodos([...todos, { id: Date.now().toString(), text: newTodo, done: false }])
                  setNewTodo('')
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Today's Priorities */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">⭐ Today's Priorities</h2>
          
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {priorities.map((priority, index) => (
              <div key={priority.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="flex-1 text-white">{priority.text}</span>
                <button
                  onClick={() => savePriorities(priorities.filter(p => p.id !== priority.id))}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-all"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newPriority.trim()) {
                  savePriorities([...priorities, { id: Date.now().toString(), text: newPriority }])
                  setNewPriority('')
                }
              }}
              placeholder="Add a priority..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
            />
            <button 
              onClick={() => {
                if (newPriority.trim()) {
                  savePriorities([...priorities, { id: Date.now().toString(), text: newPriority }])
                  setNewPriority('')
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 Upcoming Deadlines</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((deadline) => (
            <div key={deadline.id} className="glass-card p-4 group relative">
              <button
                onClick={() => saveDeadlines(deadlines.filter(d => d.id !== deadline.id))}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-all"
              >
                ✕
              </button>
              <p className="text-white font-semibold mb-1">{deadline.text}</p>
              <p className="text-sm text-white/60">{new Date(deadline.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDeadline.text}
            onChange={(e) => setNewDeadline({ ...newDeadline, text: e.target.value })}
            placeholder="Deadline name..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <input
            type="date"
            value={newDeadline.date}
            onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <button 
            onClick={() => {
              if (newDeadline.text.trim() && newDeadline.date) {
                saveDeadlines([...deadlines, { id: Date.now().toString(), ...newDeadline }])
                setNewDeadline({ text: '', date: '' })
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* Agent Activity Feed */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">🤖 Agent Activity This Week</h2>
        
        <div className="space-y-3">
          <ActivityItem icon="📧" text="Email sent to Sarah Johnson (L'Oréal)" time="2 hours ago" type="sent" />
          <ActivityItem icon="👁️" text="Michael Chen opened your email" time="4 hours ago" type="opened" />
          <ActivityItem icon="💬" text="Response received from Emily Rodriguez" time="Yesterday" type="response" />
          <ActivityItem icon="🔄" text="Follow-up scheduled for 3 beauty brand contacts" time="Tomorrow" type="scheduled" />
          <ActivityItem icon="📅" text="Meeting booked with Estée Lauder team" time="Friday" type="meeting" />
        </div>

        <a href="/dashboard/agents" className="mt-4 block text-center px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:scale-105 transition-all">
          View Full Agent Dashboard →
        </a>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, href }: { label: string; value: string; icon: string; href: string }) {
  return (
    <a href={href} className="glass-card p-4 hover:scale-[1.02] transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </a>
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
        <p className="text-sm text-white">{text}</p>
        <p className="text-xs text-white/40">{time}</p>
      </div>
    </div>
  )
}
