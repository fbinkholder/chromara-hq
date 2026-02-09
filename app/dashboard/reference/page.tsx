'use client'

const sections = [
  {
    title: 'Marketing Resources',
    emoji: '📢',
    description: 'SEO tools, social media platforms, email marketing, analytics',
    href: '/dashboard/reference/marketing',
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Image Generation',
    emoji: '🎨',
    description: 'AI image tools, Midjourney, DALL-E, Stable Diffusion resources',
    href: '/dashboard/reference/image-gen',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Video Generation',
    emoji: '🎥',
    description: 'Runway, Pika, video AI tools, editing resources',
    href: '/dashboard/reference/video-gen',
    color: 'from-blue-500 to-purple-500',
  },
  {
    title: 'Graphic Design',
    emoji: '🖌️',
    description: 'Figma, Canva, design tools, templates, inspiration',
    href: '/dashboard/reference/design',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Coding Resources',
    emoji: '💻',
    description: 'Documentation, dev tools, code snippets, tutorials',
    href: '/dashboard/reference/coding',
    color: 'from-green-500 to-cyan-500',
  },
  {
    title: 'Prompt Library',
    emoji: '⚡',
    description: 'Your favorite prompts organized by LLM, category, and output type',
    href: '/dashboard/reference/prompts',
    color: 'from-yellow-500 to-orange-500',
  },
]

export default function ReferenceHubPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Reference Library 📚</h1>
        <p className="text-white/60 text-lg">Your curated collection of tools, resources, and prompts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Resources" value="6" icon="📚" />
        <StatCard label="Quick Access" value="∞" icon="⚡" />
        <StatCard label="Categories" value="All" icon="🎯" />
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="glass-card p-6 hover:scale-[1.02] transition-all group cursor-pointer"
          >
            {/* Icon with Gradient Background */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
              {section.emoji}
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-chromara-pink transition-colors">
              {section.title}
            </h2>
            <p className="text-sm text-white/60">
              {section.description}
            </p>

            {/* Arrow */}
            <div className="mt-4 flex items-center text-white/40 group-hover:text-white transition-colors">
              <span className="text-sm">Explore</span>
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </a>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/60">
          <div>
            <span className="text-white font-semibold">Add Resources:</span> Click into any section and use the "+ Add" button
          </div>
          <div>
            <span className="text-white font-semibold">Copy Links:</span> Click on any resource to copy its URL
          </div>
          <div>
            <span className="text-white font-semibold">Search:</span> Use search boxes to find resources quickly
          </div>
          <div>
            <span className="text-white font-semibold">Prompt Library:</span> Save your best prompts with tags for easy reuse
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
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
