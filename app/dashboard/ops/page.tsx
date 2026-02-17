'use client'

import Link from 'next/link'
import { FileCheck } from 'lucide-react'

export default function OpsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-chromara-lilac bg-clip-text text-transparent">
          Ops
        </h1>
        <p className="text-white/60 mt-2">Operations and process dashboards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/ops/content-review"
          className="glass-card p-6 flex items-center gap-4 hover:bg-white/15 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-chromara-purple/20 flex items-center justify-center group-hover:bg-chromara-purple/30 transition-colors">
            <FileCheck className="w-6 h-6 text-chromara-purple" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Content Review</h2>
            <p className="text-sm text-white/60">Three-lens asset review: Legal, Brand, UX</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
