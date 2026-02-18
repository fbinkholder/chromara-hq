'use client'

import { useEffect, useState } from 'react'

type Prompt = {
  id: string
  title: string
  prompt: string
  category: string
  llm: string[]
  outputType: string
  description: string
  created_at: string
}

const CATEGORIES = ['Marketing', 'Coding', 'Research', 'Copywriting', 'Design', 'Strategy', 'Analysis', 'Other']
const LLMS = ['Claude', 'GPT-4', 'Gemini', 'Perplexity', 'Midjourney', 'DALL-E', 'Any']
const OUTPUT_TYPES = ['Blog Post', 'Code', 'Analysis', 'Email', 'Social Post', 'Strategy Doc', 'Image', 'Research Report', 'Ad Copy', 'Other']

export default function PromptLibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLLM, setFilterLLM] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [prompts, searchQuery, filterCategory, filterLLM])

  const loadPrompts = () => {
    const stored = localStorage.getItem('chromara-prompts')
    if (stored) {
      setPrompts(JSON.parse(stored))
    }
  }

  const applyFilters = () => {
    let filtered = [...prompts]

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory)
    }

    if (filterLLM !== 'all') {
      filtered = filtered.filter(p => p.llm.includes(filterLLM))
    }

    setFilteredPrompts(filtered)
  }

  const savePrompts = (newPrompts: Prompt[]) => {
    setPrompts(newPrompts)
    localStorage.setItem('chromara-prompts', JSON.stringify(newPrompts))
  }

  const deletePrompt = (id: string) => {
    if (!confirm('Delete this prompt?')) return
    const updated = prompts.filter(p => p.id !== id)
    savePrompts(updated)
  }

  const copyPrompt = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.prompt)
    setCopiedId(prompt.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Prompt Library ⚡</h1>
          <p className="text-white/60 mt-1">Your favorite prompts organized by LLM, category, and output</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="glass-button"
        >
          ➕ Add Prompt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Prompts" value={prompts.length} icon="⚡" />
        <StatCard label="Categories" value={new Set(prompts.map(p => p.category)).size} icon="📁" />
        <StatCard label="LLMs" value={new Set(prompts.flatMap(p => p.llm)).size} icon="🤖" />
        <StatCard label="Output Types" value={new Set(prompts.map(p => p.outputType)).size} icon="📝" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterLLM}
            onChange={(e) => setFilterLLM(e.target.value)}
            className="glass-input"
          >
            <option value="all">All LLMs</option>
            {LLMS.map(llm => (
              <option key={llm} value={llm}>{llm}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-white/60 text-sm">
        Showing {filteredPrompts.length} of {prompts.length} prompts
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-white mb-2">No prompts yet</h3>
          <p className="text-white/60 mb-4">Start building your prompt library</p>
          <button onClick={() => setShowAddModal(true)} className="glass-button">
            ➕ Add First Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onCopy={() => copyPrompt(prompt)}
              onEdit={() => setEditingPrompt(prompt)}
              onDelete={() => deletePrompt(prompt.id)}
              copied={copiedId === prompt.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingPrompt) && (
        <PromptModal
          prompt={editingPrompt}
          onClose={() => {
            setShowAddModal(false)
            setEditingPrompt(null)
          }}
          onSave={(prompt) => {
            if (editingPrompt) {
              const updated = prompts.map(p => p.id === prompt.id ? prompt : p)
              savePrompts(updated)
            } else {
              savePrompts([...prompts, { ...prompt, id: Date.now().toString(), created_at: new Date().toISOString() }])
            }
            setShowAddModal(false)
            setEditingPrompt(null)
          }}
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

const SNIPPET_MAX = 150

function PromptCard({ prompt, onCopy, onEdit, onDelete, copied }: {
  prompt: Prompt
  onCopy: () => void
  onEdit: () => void
  onDelete: () => void
  copied: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const snippet = expanded ? prompt.prompt : prompt.prompt.slice(0, SNIPPET_MAX) + (prompt.prompt.length > SNIPPET_MAX ? '…' : '')
  const hasMore = prompt.prompt.length > SNIPPET_MAX

  return (
    <div className="glass-card p-4 group hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <h3 className="text-base font-semibold text-white truncate">{prompt.title}</h3>
          {prompt.description && <p className="text-sm text-white/60 truncate mt-0.5">{prompt.description}</p>}
          <div className="mt-2 bg-black/20 rounded-lg p-3">
            <pre className={`text-xs text-white/80 whitespace-pre-wrap font-mono ${expanded ? '' : 'line-clamp-3'}`}>
              {snippet}
            </pre>
            {hasMore && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                className="text-xs text-chromara-purple mt-1 hover:underline"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => onCopy()} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs">
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit() }} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs">✏️</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }} className="px-2 py-1 bg-white/10 hover:bg-red-500/20 rounded text-white text-xs">🗑️</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{prompt.category}</span>
        {prompt.llm.slice(0, 2).map(llm => (
          <span key={llm} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">{llm}</span>
        ))}
        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded text-xs">{prompt.outputType}</span>
      </div>
    </div>
  )
}

function PromptModal({ prompt, onClose, onSave }: {
  prompt: Prompt | null
  onClose: () => void
  onSave: (prompt: Prompt) => void
}) {
  const [title, setTitle] = useState(prompt?.title || '')
  const [promptText, setPromptText] = useState(prompt?.prompt || '')
  const [description, setDescription] = useState(prompt?.description || '')
  const [category, setCategory] = useState(prompt?.category || 'Marketing')
  const [llm, setLlm] = useState<string[]>(prompt?.llm || ['Claude'])
  const [outputType, setOutputType] = useState(prompt?.outputType || 'Blog Post')

  const toggleLLM = (selectedLLM: string) => {
    if (llm.includes(selectedLLM)) {
      setLlm(llm.filter(l => l !== selectedLLM))
    } else {
      setLlm([...llm, selectedLLM])
    }
  }

  const handleSave = () => {
    if (!title.trim() || !promptText.trim()) {
      alert('Title and prompt are required!')
      return
    }

    onSave({
      id: prompt?.id || '',
      title,
      prompt: promptText,
      description,
      category,
      llm: llm.length > 0 ? llm : ['Any'],
      outputType,
      created_at: prompt?.created_at || ''
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">
            {prompt ? 'Edit Prompt' : 'Add Prompt'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., LinkedIn Post Generator"
              className="glass-input w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this prompt does"
              className="glass-input w-full"
            />
          </div>

          {/* Prompt Text */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Prompt *</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Write your prompt here..."
              className="glass-input w-full min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input w-full">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* LLMs (Multi-select) */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Best LLMs (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {LLMS.map(llmOption => (
                <button
                  key={llmOption}
                  onClick={() => toggleLLM(llmOption)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    llm.includes(llmOption)
                      ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {llmOption}
                </button>
              ))}
            </div>
          </div>

          {/* Output Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Output Type</label>
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)} className="glass-input w-full">
              {OUTPUT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
          <button onClick={onClose} className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-button">
            💾 Save Prompt
          </button>
        </div>
      </div>
    </div>
  )
}
