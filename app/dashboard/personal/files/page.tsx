'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type FileItem = {
  id: string
  name: string
  path: string
  size: number
  type: string
  tags: string[]
  created_at: string
  url: string
}

export default function FilesBankPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [allTags, setAllTags] = useState<string[]>([])
  const supabase = createClient()

  // Mock files for demo (since we need Supabase Storage setup)
  useEffect(() => {
    // In production, this would load from Supabase Storage
    // For now, we'll use localStorage to simulate file storage
    loadFiles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [files, searchQuery, filterType, filterTag])

  const loadFiles = () => {
    const stored = localStorage.getItem('chromara-files')
    if (stored) {
      const parsed = JSON.parse(stored)
      setFiles(parsed)
      extractTags(parsed)
    }
    setLoading(false)
  }

  const extractTags = (fileList: FileItem[]) => {
    const tags = new Set<string>()
    fileList.forEach(file => {
      file.tags.forEach(tag => tags.add(tag))
    })
    setAllTags(Array.from(tags).sort())
  }

  const applyFilters = () => {
    let filtered = [...files]

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(f => {
        if (filterType === 'images') return f.type.startsWith('image/')
        if (filterType === 'pdfs') return f.type === 'application/pdf'
        if (filterType === 'docs') return f.type.includes('document') || f.type.includes('word') || f.type.includes('text')
        return true
      })
    }

    if (filterTag !== 'all') {
      filtered = filtered.filter(f => f.tags.includes(filterTag))
    }

    setFilteredFiles(filtered)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles) return

    setUploading(true)

    try {
      const newFiles: FileItem[] = []
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        
        // Create a mock file object
        // In production, this would upload to Supabase Storage
        const fileItem: FileItem = {
          id: Date.now().toString() + i,
          name: file.name,
          path: `files/${file.name}`,
          size: file.size,
          type: file.type,
          tags: [],
          created_at: new Date().toISOString(),
          url: URL.createObjectURL(file) // Temporary URL for demo
        }
        
        newFiles.push(fileItem)
      }

      const updated = [...files, ...newFiles]
      setFiles(updated)
      localStorage.setItem('chromara-files', JSON.stringify(updated))
      extractTags(updated)
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const addTag = (fileId: string, tag: string) => {
    const updated = files.map(f => 
      f.id === fileId ? { ...f, tags: [...f.tags, tag] } : f
    )
    setFiles(updated)
    localStorage.setItem('chromara-files', JSON.stringify(updated))
    extractTags(updated)
  }

  const removeTag = (fileId: string, tag: string) => {
    const updated = files.map(f => 
      f.id === fileId ? { ...f, tags: f.tags.filter(t => t !== tag) } : f
    )
    setFiles(updated)
    localStorage.setItem('chromara-files', JSON.stringify(updated))
    extractTags(updated)
  }

  const deleteFile = (fileId: string) => {
    if (!confirm('Delete this file?')) return
    const updated = files.filter(f => f.id !== fileId)
    setFiles(updated)
    localStorage.setItem('chromara-files', JSON.stringify(updated))
    extractTags(updated)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('document') || type.includes('word')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
    if (type.includes('video')) return '🎥'
    if (type.includes('audio')) return '🎵'
    if (type.includes('zip') || type.includes('archive')) return '📦'
    return '📎'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white/60">Loading files...</div>
      </div>
    )
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">File Bank 📁</h1>
          <p className="text-white/60 mt-1">Upload, organize, and manage your files</p>
        </div>
        <label className="glass-button cursor-pointer">
          ➕ Upload Files
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Files" value={files.length} icon="📁" />
        <StatCard label="Total Size" value={formatFileSize(totalSize)} icon="💾" />
        <StatCard label="Images" value={files.filter(f => f.type.startsWith('image/')).length} icon="🖼️" />
        <StatCard label="Documents" value={files.filter(f => f.type.includes('pdf') || f.type.includes('document')).length} icon="📄" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-input"
          >
            <option value="all">All File Types</option>
            <option value="images">🖼️ Images</option>
            <option value="pdfs">📄 PDFs</option>
            <option value="docs">📝 Documents</option>
          </select>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>🏷️ {tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-white/60 text-sm">
        Showing {filteredFiles.length} of {files.length} files
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">No files yet</h3>
          <p className="text-white/60 mb-4">Upload your first file to get started</p>
          <label className="glass-button cursor-pointer inline-block">
            ➕ Upload First File
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onDelete={deleteFile}
            />
          ))}
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4">⬆️</div>
            <p className="text-white text-lg">Uploading files...</p>
          </div>
        </div>
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

function FileCard({ file, onAddTag, onRemoveTag, onDelete }: {
  file: FileItem
  onAddTag: (id: string, tag: string) => void
  onRemoveTag: (id: string, tag: string) => void
  onDelete: (id: string) => void
}) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(file.id, newTag.trim())
      setNewTag('')
      setShowTagInput(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('document') || type.includes('word')) return '📝'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
    if (type.includes('video')) return '🎥'
    if (type.includes('audio')) return '🎵'
    return '📎'
  }

  return (
    <div className="glass-card p-4 group hover:scale-[1.02] transition-all">
      {/* File Preview/Icon */}
      <div className="relative mb-3">
        {file.type.startsWith('image/') ? (
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-white/5 rounded-lg">
            <span className="text-6xl">{getFileIcon(file.type)}</span>
          </div>
        )}
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(file.id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 text-white rounded-lg px-3 py-1 text-sm"
        >
          🗑️ Delete
        </button>
      </div>

      {/* File Info */}
      <h3 className="font-semibold text-white mb-1 truncate" title={file.name}>
        {file.name}
      </h3>
      
      <div className="flex items-center justify-between text-xs text-white/60 mb-3">
        <span>{formatFileSize(file.size)}</span>
        <span>{new Date(file.created_at).toLocaleDateString()}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {file.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-chromara-purple/20 text-chromara-purple text-xs rounded-full flex items-center gap-1"
          >
            🏷️ {tag}
            <button
              onClick={() => onRemoveTag(file.id, tag)}
              className="hover:text-red-400 ml-1"
            >
              ✕
            </button>
          </span>
        ))}
        
        {showTagInput ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Tag name..."
              className="glass-input text-xs px-2 py-1 w-24"
              autoFocus
            />
            <button onClick={handleAddTag} className="text-green-400 text-xs">✓</button>
            <button onClick={() => setShowTagInput(false)} className="text-red-400 text-xs">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 text-xs rounded-full transition-all"
          >
            + Tag
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={file.url}
          download={file.name}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white text-xs text-center hover:shadow-glass-hover transition-all"
        >
          ⬇️ Download
        </a>
        {file.type.startsWith('image/') && (
          <button
            onClick={() => window.open(file.url, '_blank')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-all"
          >
            👁️ View
          </button>
        )}
      </div>
    </div>
  )
}
