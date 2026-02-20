'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { 
  Home, 
  Users, 
  Target, 
  Instagram, 
  Wrench, 
  Palette, 
  Brain, 
  DollarSign,
  BookOpen, 
  Bot,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: any
  subPages?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: 'Home Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Engineering', 
    href: '/dashboard/engineering', 
    icon: Wrench,
    subPages: [
      { name: 'Software Engineering', href: '/dashboard/engineering/software' },
      { name: 'Mechanical Engineering', href: '/dashboard/engineering/mechanical' },
      { name: 'Planning', href: '/dashboard/engineering/planning' },
    ]
  },
  { 
    name: 'Marketing', 
    href: '/dashboard/marketing', 
    icon: Target,
    subPages: [
      { name: 'Content Calendar', href: '/dashboard/content/calendar' },
      { name: 'Campaign Tracker', href: '/dashboard/campaigns' },
      { name: 'KPIs & Analytics', href: '/dashboard/analytics' },
      { name: 'PR Tracker', href: '/dashboard/press' },
      { name: 'Ambassadors', href: '/dashboard/ambassadors' },
    ]
  },
  { 
    name: 'Competitive Intel', 
    href: '/dashboard/competitive', 
    icon: Target,
    subPages: [
      { name: 'Agent Intel (Live)', href: '/dashboard/competitive-intel' },
      { name: 'Competitor Matrix', href: '/dashboard/competitive/matrix' },
      { name: 'Market Research', href: '/dashboard/competitive/research' },
      { name: 'Pricing Analysis', href: '/dashboard/competitive/pricing' },
      { name: 'Consumer Intel', href: '/dashboard/competitive/consumer' },
      { name: 'SWOT Analysis', href: '/dashboard/competitive/swot' },
    ]
  },
  { 
    name: 'Content & Social', 
    href: '/dashboard/content', 
    icon: Instagram,
    subPages: [
      { name: 'Social Media Manager', href: '/dashboard/content/social' },
      { name: 'Content Ideas', href: '/dashboard/content/ideas' },
      { name: 'Hashtag Library', href: '/dashboard/content/hashtags' },
      { name: 'Keyword Library', href: '/dashboard/content/keywords' },
      { name: 'Platform Strategies', href: '/dashboard/content/strategies' },
    ]
  },
  { 
    name: 'Fundraising', 
    href: '/dashboard/fundraising', 
    icon: DollarSign,
    subPages: [
      { name: 'Investor Pipeline', href: '/dashboard/fundraising/pipeline' },
      { name: 'Assets & Docs', href: '/dashboard/fundraising/assets' },
    ]
  },
  { name: 'Partnerships', href: '/dashboard/partnerships', icon: Users },
  { 
    name: 'Ops', 
    href: '/dashboard/ops', 
    icon: ClipboardCheck,
    subPages: [
      { name: 'Content Review', href: '/dashboard/ops/content-review' },
    ]
  },
  { name: 'Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Reference', href: '/dashboard/reference', icon: BookOpen },
  {
    name: 'Personal',
    href: '/dashboard/personal',
    icon: Brain,
    subPages: [
      { name: 'Archives', href: '/dashboard/personal/archives' },
      { name: '2026 Chromara Wrapped', href: '/dashboard/personal/wrapped' },
    ]
  },
  { name: 'Brand', href: '/dashboard/brand', icon: Palette },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    // Auto-expand section if on that section's page (including parent or any sub-page)
    navigation.forEach(item => {
      if (item.subPages) {
        const isSubPageActive = item.subPages.some(sub => pathname === sub.href)
        const isOnParentOrChild = pathname === item.href || pathname.startsWith(item.href + '/')
        if (isSubPageActive || isOnParentOrChild) {
          setExpandedSections(prev => new Set(prev).add(item.name))
        }
      }
    })
  }, [pathname])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 glass-card border-r border-white/20
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo & Close button */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-chromara-purple to-chromara-pink bg-clip-text text-transparent">
              CHROMARA HQ
            </h1>
            <p className="text-xs text-white/60 mt-1">Powered by AI</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            {typeof X === 'function' ? <X className="w-5 h-5" /> : <span className="w-5 h-5 block" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const hasSubPages = item.subPages && item.subPages.length > 0
            const isExpanded = expandedSections.has(item.name)
            const isSubPageActive = hasSubPages && item.subPages?.some(sub => pathname === sub.href)

            return (
              <div key={item.name}>
                {/* Main nav item */}
                <div className="flex items-center gap-1">
                  <a
                    href={item.href}
                    onClick={() => hasSubPages && setExpandedSections(prev => new Set(prev).add(item.name))}
                    className={`sidebar-item flex-1 ${isActive || isSubPageActive ? 'active' : ''}`}
                  >
                    {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : <span className="w-5 h-5 block" />}
                    <span>{item.name}</span>
                  </a>
                  
                  {/* Toggle button for sections with sub-pages */}
                  {hasSubPages && (
                    <button
                      onClick={() => toggleSection(item.name)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {isExpanded ? (
                        typeof ChevronDown === 'function' ? <ChevronDown className="w-4 h-4 text-white/60" /> : null
                      ) : (
                        typeof ChevronRight === 'function' ? <ChevronRight className="w-4 h-4 text-white/60" /> : null
                      )}
                    </button>
                  )}
                </div>

                {/* Sub-pages (collapsible) */}
                {hasSubPages && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.subPages?.map((subPage) => {
                      const isSubActive = pathname === subPage.href
                      return (
                        <a
                          key={subPage.href}
                          href={subPage.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                            isSubActive
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {subPage.name}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-chromara-purple to-chromara-pink flex items-center justify-center text-white font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
              <p className="text-xs text-white/60">Founder & CEO</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            {typeof LogOut === 'function' ? <LogOut className="w-4 h-4" /> : null}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden glass-card border-b border-white/20 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            {typeof Menu === 'function' ? <Menu className="w-6 h-6" /> : <span className="w-6 h-6 block" />}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-chromara-purple to-chromara-pink bg-clip-text text-transparent">
            CHROMARA HQ
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
