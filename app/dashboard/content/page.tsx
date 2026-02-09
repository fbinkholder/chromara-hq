'use client'

export default function ContentSocial() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">📱 Content & Social</h1>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 This Week's Schedule</h2>
        <div className="space-y-3">
          <ScheduleItem platform="TikTok" title="Foundation Struggle Story" campaign="Beta Hype" date="Today 2PM" />
          <ScheduleItem platform="Instagram" title="NovaMirror Render Carousel" campaign="Product Teaser" date="Tomorrow 10AM" />
          <ScheduleItem platform="LinkedIn" title="Industry Problem Analysis" campaign="Thought Leadership" date="Thursday 9AM" />
          <ScheduleItem platform="TikTok" title="Behind The Scenes" campaign="Founder Story" date="Friday 3PM" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📊 Performance Snapshot</h2>
        <p className="text-sm text-white/60 mb-4">Data synced from <a href="/dashboard/marketing/kpis" className="text-chromara-purple hover:text-chromara-pink underline">Marketing KPIs</a></p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Views" value="45.2K" change="+12%" />
          <MetricCard label="Engagement" value="4.2%" change="+0.8%" />
          <MetricCard label="Followers" value="1.8K" change="+156" />
          <MetricCard label="Shares" value="892" change="+45" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">🔥 Top Performers</h2>
          <div className="space-y-2">
            <PostCard title="Shade Matching Problem" views="12.3K" engagement="6.8%" />
            <PostCard title="Founder Story Pt.1" views="8.9K" engagement="5.2%" />
            <PostCard title="Tech Render" views="7.1K" engagement="4.9%" />
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">📝 Quick Links</h2>
          <div className="space-y-2">
            <QuickLink href="/dashboard/content/ideas" icon="💡" label="Content Ideas" />
            <QuickLink href="/dashboard/content/hashtags" icon="#️⃣" label="Hashtag Library" />
            <QuickLink href="/dashboard/content/keywords" icon="🔑" label="Keyword Library" />
            <QuickLink href="/dashboard/content/strategies" icon="📱" label="Platform Strategies" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleItem({ platform, title, campaign, date }: { platform: string; title: string; campaign: string; date: string }) {
  const icons: Record<string, string> = {
    'TikTok': '📱',
    'Instagram': '📸',
    'LinkedIn': '💼'
  }
  return (
    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
      <span className="text-2xl">{icons[platform]}</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-xs text-white/60 mt-1">{campaign} • {date}</p>
      </div>
      <span className="text-xs px-2 py-1 bg-chromara-purple/20 text-chromara-purple rounded-full">{platform}</span>
    </div>
  )
}

function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-xs text-green-400">{change}</p>
    </div>
  )
}

function PostCard({ title, views, engagement }: { title: string; views: string; engagement: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <p className="text-white font-medium text-sm mb-2">{title}</p>
      <div className="flex items-center gap-4 text-xs text-white/60">
        <span>👁️ {views}</span>
        <span>💬 {engagement}</span>
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
      <span className="text-xl">{icon}</span>
      <span className="text-white font-medium">{label}</span>
      <span className="ml-auto text-white/40">→</span>
    </a>
  )
}
