'use client'

import { useEffect, useState } from 'react'

const WRAPPED_2026_KEY = 'chromara-wrapped-2026'

type WrappedEntry = {
  id: string
  title: string
  addedAt: string
  archivedAt: string
}

export default function ChromaraWrappedPage() {
  const [entries, setEntries] = useState<WrappedEntry[]>([])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(WRAPPED_2026_KEY) : null
    if (!raw) {
      setEntries([])
      return
    }
    try {
      const list = JSON.parse(raw) as WrappedEntry[]
      setEntries(list)
    } catch {
      setEntries([])
    }
  }, [])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' })
    } catch {
      return iso
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">2026 Chromara Wrapped</h1>
      <p className="text-white/70 text-sm mb-8">
        Wins you archived from Quick Wins on the home dashboard. A place to look back and reflect on what you&apos;ve done.
      </p>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white/60 mb-2">No archived wins yet.</p>
            <p className="text-white/50 text-sm">
              Add wins in Quick Wins on the home dashboard, then click Archive. They&apos;ll show up here.
            </p>
          </div>
        ) : (
          entries.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-violet-500/20 bg-white/5 p-5 hover:bg-white/10 transition-all"
            >
              <p className="text-white font-medium text-lg">{e.title}</p>
              <p className="text-white/50 text-sm mt-1">Archived {formatDate(e.archivedAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
