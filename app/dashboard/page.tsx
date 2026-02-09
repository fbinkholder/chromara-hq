'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type TodoItem = { id: string; text: string; done: boolean }

export default function HomeDashboard() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  
  // Editable stats
  const [stats, setStats] = useState({
    partnerships: '0',
    emails: '0',
    content: '0',
    investors: '0'
  })
  const [editingStats, setEditingStats] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const savedTodos = localStorage.getItem('chromara-todos')
    const savedStats = localStorage.getItem('chromara-stats')
    
    if (savedTodos) setTodos(JSON.parse(savedTodos))
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    } else {
      // Load real counts on first load
      loadRealStats()
    }
  }, [])

  const loadRealStats = async () => {
    try {
      const { count: partnershipsCount } = await supabase
        .from('outreach_contacts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['responded', 'interested', 'moving_forward'])
      
      const { count: emailsCount } = await supabase
        .from('sent_emails')
        .select('*', { count: 'exact', head: true })
      
      const { count: contentCount } = await supabase
        .from('content_ideas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled')
      
      const { count: investorsCount } = await supabase
        .from('outreach_contacts')
        .select('*', { count: 'exact', head: true })
        .ilike('segment', '%investor%')
        .in('status', ['responded', 'interested', 'moving_forward'])
      
      const newStats = {
        partnerships: (partnershipsCount || 0).toString(),
        emails: (emailsCount || 0).toString(),
        content: (contentCount || 0).toString(),
        investors: (investorsCount || 0).toString()
      }
      
      setStats(newStats)
      localStorage.setItem('chromara-stats', JSON.stringify(newStats))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const saveStats = (newStats: typeof stats) => {
    setStats(newStats)
    localStorage.setItem('chromara-stats', JSON.stringify(newStats))
  }

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos)
    localStorage.setItem('chromara-todos', JSON.stringify(newTodos))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🏠 Command Center</h1>

      {/* Stats - Now Editable */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">📊 Quick Stats</h2>
          <button
            onClick={() => {
              if (editingStats) {
                setEditingStats(false)
              } else {
                setEditingStats(true)
              }
            }}
            className="glass-button px-4 py-2 text-sm"
          >
            {editingStats ? '✅ Done' : '✏️ Edit'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Partnerships */}
          <div className="glass-card p-4">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-sm text-white/60 mb-2">Active Partnerships</div>
            {editingStats ? (
              <input
                type="number"
                value={stats.partnerships}
                onChange={(e) => saveStats({...stats, partnerships: e.target.value})}
                className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-2xl font-bold"
              />
            ) : (
              <div className="text-2xl font-bold text-white">{stats.partnerships}</div>
            )}
          </div>

          {/* Emails */}
          <div className="glass-card p-4">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-sm text-white/60 mb-2">Emails Sent</div>
            {editingStats ? (
              <input
                type="number"
                value={stats.emails}
                onChange={(e) => saveStats({...stats, emails: e.target.value})}
                className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-2xl font-bold"
              />
            ) : (
              <div className="text-2xl font-bold text-white">{stats.emails}</div>
            )}
          </div>

          {/* Content */}
          <div className="glass-card p-4">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-sm text-white/60 mb-2">Content Scheduled</div>
            {editingStats ? (
              <input
                type="number"
                value={stats.content}
                onChange={(e) => saveStats({...stats, content: e.target.value})}
                className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-2xl font-bold"
              />
            ) : (
              <div className="text-2xl font-bold text-white">{stats.content}</div>
            )}
          </div>

          {/* Investors */}
          <div className="glass-card p-4">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-white/60 mb-2">Investor Conversations</div>
            {editingStats ? (
              <input
                type="number"
                value={stats.investors}
                onChange={(e) => saveStats({...stats, investors: e.target.value})}
                className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-2xl font-bold"
              />
            ) : (
              <div className="text-2xl font-bold text-white">{stats.investors}</div>
            )}
          </div>
        </div>

        <button
          onClick={loadRealStats}
          className="mt-4 glass-button px-6 py-2 text-sm"
        >
          🔄 Sync with Database
        </button>
      </div>

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
            className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
          />
          <button 
            onClick={() => {
              if (newTodo.trim()) {
                saveTodos([...todos, { id: Date.now().toString(), text: newTodo, done: false }])
                setNewTodo('')
              }
            }}
            className="glass-button px-6"
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  )
}