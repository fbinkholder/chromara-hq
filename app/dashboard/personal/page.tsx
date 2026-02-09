'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Note = {
  id: string
  title: string
  content: string | null
  parent_id: string | null
  workspace_type: string
  created_at: string
  updated_at: string
}

export default function PersonalWorkspacePage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const supabase = createClient()

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [notes, searchQuery])

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('workspace_type', 'personal')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...notes]

    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredNotes(filtered)
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadNotes()
      if (selectedNote?.id === id) setSelectedNote(null)
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/60">Loading your workspace...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Personal Workspace 🧠</h1>
          <p className="text-white/60 mt-1">Your brain dump, notes, and drafts</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/personal/files"
            className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all font-medium"
          >
            📁 File Bank
          </a>
          <button
            onClick={() => setShowNewNoteModal(true)}
            className="glass-button"
          >
            ➕ New Note
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Notes" value={notes.length} icon="📝" />
        <StatCard label="This Week" value={notes.filter(n => new Date(n.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length} icon="📅" />
        <StatCard label="Updated Today" value={notes.filter(n => new Date(n.updated_at).toDateString() === new Date().toDateString()).length} icon="✨" />
        <StatCard label="Word Count" value={notes.reduce((acc, n) => acc + (n.content?.split(' ').length || 0), 0)} icon="📊" />
      </div>

      {/* Search & View Toggle */}
      <div className="glass-card p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input flex-1"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'grid' 
                  ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                view === 'list' 
                  ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              ☰ List
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-white/60 text-sm">
        Showing {filteredNotes.length} of {notes.length} notes
      </div>

      {/* Notes Display */}
      {filteredNotes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
          <p className="text-white/60 mb-4">Start capturing your thoughts and ideas</p>
          <button onClick={() => setShowNewNoteModal(true)} className="glass-button">
            ➕ Create First Note
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onClick={() => setSelectedNote(note)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              onClick={() => setSelectedNote(note)}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      )}

      {/* New Note Modal */}
      {showNewNoteModal && (
        <NoteEditorModal
          onClose={() => setShowNewNoteModal(false)}
          onSave={loadNotes}
        />
      )}

      {/* Edit Note Modal */}
      {selectedNote && (
        <NoteEditorModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSave={loadNotes}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
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

function NoteCard({ note, onClick, onDelete }: { note: Note; onClick: () => void; onDelete: () => void }) {
  const preview = note.content?.slice(0, 150) || 'No content yet...'
  const wordCount = note.content?.split(' ').length || 0

  return (
    <div className="glass-card p-4 hover:scale-[1.02] transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h3 
          onClick={onClick}
          className="text-lg font-semibold text-white flex-1 line-clamp-2 hover:text-chromara-pink transition-colors"
        >
          {note.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 ml-2"
        >
          🗑️
        </button>
      </div>

      <p 
        onClick={onClick}
        className="text-sm text-white/60 line-clamp-3 mb-3"
      >
        {preview}
      </p>

      <div className="flex items-center justify-between text-xs text-white/40">
        <span>📝 {wordCount} words</span>
        <span>{new Date(note.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function NoteListItem({ note, onClick, onDelete }: { note: Note; onClick: () => void; onDelete: () => void }) {
  const wordCount = note.content?.split(' ').length || 0

  return (
    <div className="glass-card p-4 hover:bg-white/15 transition-all cursor-pointer group">
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={onClick}>
          <h3 className="text-lg font-semibold text-white mb-1 hover:text-chromara-pink transition-colors">
            {note.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>📝 {wordCount} words</span>
            <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
            <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

function NoteEditorModal({ note, onClose, onSave }: { note?: Note; onClose: () => void; onSave: () => void }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('pages')
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id)

        if (error) throw error
      } else {
        // Create new note
        const { error } = await supabase
          .from('pages')
          .insert([{
            user_id: user?.id,
            title,
            content,
            workspace_type: 'personal',
            parent_id: null,
          }])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const insertTemplate = (template: string) => {
    if (template === 'meeting') {
      setContent(`# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Topic:** 

## Agenda
- 

## Discussion
- 

## Action Items
- [ ] 

## Next Steps
- `)
    } else if (template === 'brainstorm') {
      setContent(`# Brainstorm Session

**Topic:** 
**Date:** ${new Date().toLocaleDateString()}

## Ideas
- 💡 
- 💡 
- 💡 

## Best Ideas to Pursue
1. 

## Next Actions
- [ ] `)
    }
  }

  const wordCount = content.split(' ').filter(w => w.length > 0).length
  const charCount = content.length

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-2xl font-bold bg-transparent border-none text-white placeholder-white/40 focus:outline-none w-full"
              autoFocus
            />
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl ml-4">✕</button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/20 bg-white/5">
          <button
            onClick={() => insertTemplate('meeting')}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all"
          >
            📋 Meeting Template
          </button>
          <button
            onClick={() => insertTemplate('brainstorm')}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all"
          >
            💡 Brainstorm Template
          </button>
          <div className="flex-1"></div>
          <span className="text-xs text-white/40">
            {wordCount} words • {charCount} characters
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... You can use Markdown formatting!"
            className="w-full h-full bg-transparent border-none text-white placeholder-white/40 focus:outline-none resize-none font-mono text-sm leading-relaxed"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/20 bg-white/5">
          <div className="text-xs text-white/60">
            {note ? `Last edited ${new Date(note.updated_at).toLocaleString()}` : 'New note'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '💾 Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
