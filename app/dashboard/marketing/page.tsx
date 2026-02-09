'use client'

export default function MarketingDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">📈 Marketing Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Content Pieces" value="127" icon="📝" />
        <StatCard label="Total Reach" value="45.2K" icon="👥" />
        <StatCard label="Active Campaigns" value="3" icon="🎯" />
        <StatCard label="Ambassadors" value="12" icon="⭐" />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">🚀 Active Campaigns</h2>
        <div className="space-y-3">
          <CampaignCard name="Launch Hype - Beta Signup" status="Active" progress={75} reach="12.3K" />
          <CampaignCard name="Founder Story Series" status="Active" progress={60} reach="8.1K" />
          <CampaignCard name="Behind The Scenes - Engineering" status="Planning" progress={30} reach="0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📅 This Week's Content</h2>
          <div className="space-y-2">
            <ContentItem platform="TikTok" title="Foundation Shade Struggle" date="Today" />
            <ContentItem platform="Instagram" title="NovaMirror Render" date="Tomorrow" />
            <ContentItem platform="LinkedIn" title="Industry Problem Post" date="Thursday" />
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📊 Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Engagement Rate</span>
              <span className="text-white font-bold">4.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Newsletter Subscribers</span>
              <span className="text-white font-bold">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Beta Applications</span>
              <span className="text-white font-bold">89</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function CampaignCard({ name, status, progress, reach }: { name: string; status: string; progress: number; reach: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold">{name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{status}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/60 mb-2">
        <span>Reach: {reach}</span>
        <span>Progress: {progress}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-chromara-purple to-chromara-pink" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function ContentItem({ platform, title, date }: { platform: string; title: string; date: string }) {
  const icons: Record<string, string> = {
    'TikTok': '📱',
    'Instagram': '📸',
    'LinkedIn': '💼'
  }
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <span className="text-xl">{icons[platform]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{title}</p>
        <p className="text-xs text-white/60">{platform} • {date}</p>
      </div>
    </div>
  )
}
