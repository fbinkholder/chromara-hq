'use client'

export default function CompetitiveIntel() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🔍 Competitive Intelligence</h1>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">🤖 Agent Finds of the Week</h2>
        <div className="p-4 bg-white/5 rounded-lg mb-4">
          <p className="text-white/80 mb-3">This week's competitive intelligence highlights emerging trends in personalized beauty tech and new patent filings from major cosmetics companies.</p>
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">AI Beauty</span>
            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Patents</span>
            <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">Personalization</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📈 Rising Trends</h2>
        <div className="space-y-3">
          <TrendCard trend="Custom Beauty Devices" change="+45%" momentum="up" />
          <TrendCard trend="At-Home Color Matching" change="+32%" momentum="up" />
          <TrendCard trend="Sustainable Packaging" change="+28%" momentum="up" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">📰 News Updates</h2>
        <div className="space-y-3">
          <NewsItem 
            title="L'Oréal Invests $50M in Beauty Tech Startups"
            source="TechCrunch"
            date="2 days ago"
            tag="Investment"
          />
          <NewsItem 
            title="Perfect Corp Launches AI Skin Analysis Tool"
            source="Beauty Independent"
            date="4 days ago"
            tag="Product Launch"
          />
          <NewsItem 
            title="Sephora Expands Virtual Try-On Features"
            source="Vogue Business"
            date="1 week ago"
            tag="Retail"
          />
        </div>
      </div>
    </div>
  )
}

function TrendCard({ trend, change, momentum }: { trend: string; change: string; momentum: 'up' | 'down' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <span className="text-white font-medium">{trend}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${momentum === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
        <span className="text-xl">{momentum === 'up' ? '📈' : '📉'}</span>
      </div>
    </div>
  )
}

function NewsItem({ title, source, date, tag }: { title: string; source: string; date: string; tag: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-lg border-l-4 border-blue-500/30">
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <div className="flex items-center gap-3 text-xs text-white/60">
        <span>{source}</span>
        <span>•</span>
        <span>{date}</span>
        <span className="ml-auto px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{tag}</span>
      </div>
    </div>
  )
}
