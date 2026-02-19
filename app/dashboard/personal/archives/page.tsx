'use client'

import { useEffect, useState } from 'react'

type StoredTodo = {
  id: string
  text: string
  status?: string
  completedAt?: string
}

export default function TodoArchivesPage() {
  const [completed, setCompleted] = useState<StoredTodo[]>([])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('chromara-todos') : null
    if (!raw) {
      setCompleted([])
      return
    }
    try {
      const all = JSON.parse(raw) as StoredTodo[]
      const completedItems = all.filter(
        (t) => t.status === 'completed' || (t as { done?: boolean }).done === true
      )
      const withDate = completedItems.map((t) => ({
        ...t,
        completedAt: t.completedAt ?? new Date(0).toISOString(),
      }))
      withDate.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
      setCompleted(withDate)
    } catch {
      setCompleted([])
    }
  }, [])

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
    } catch {
      return iso
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Todo Archives</h1>
      <p className="text-white/70 text-sm mb-6">
        Completed to-dos from your home dashboard, with the date you marked them complete.
      </p>
      <div className="space-y-2">
        {completed.length === 0 ? (
          <p className="text-white/50 py-8 text-center rounded-xl border border-white/10 bg-white/5">
            No completed items yet. Mark to-dos as &quot;Completed&quot; on the home dashboard to see them here.
          </p>
        ) : (
          completed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="text-white">{item.text}</span>
              <span className="text-white/60 text-sm shrink-0">
                Completed {formatDate(item.completedAt ?? '')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
