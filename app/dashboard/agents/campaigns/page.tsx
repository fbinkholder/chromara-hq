'use client'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaign Manager 📊</h1>
          <p className="text-white/60 mt-1">Create and manage outreach campaigns</p>
        </div>
        <a href="/dashboard/agents" className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all">
          ← Back to Agent
        </a>
      </div>

      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-semibold text-white mb-3">Coming in Phase 2!</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Campaign management will allow you to create multi-step outreach campaigns, segment your contacts, and track performance across all touchpoints.
        </p>
        <div className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold">
          ⚡ Phase 2 Feature
        </div>
      </div>
    </div>
  )
}
