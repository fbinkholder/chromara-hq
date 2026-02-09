'use client'

import { useState } from 'react'

const brandColors = [
  { name: 'LED Violet (Primary)', hex: '#8C52FF', rgb: '140, 82, 255', usage: 'Primary brand color, CTAs, main accents' },
  { name: 'LED Violet (Secondary)', hex: '#AF86FF', rgb: '175, 134, 255', usage: 'Secondary accents, hover states' },
  { name: 'Deep Violet', hex: '#4A1A73', rgb: '74, 26, 115', usage: 'Dark accents, backgrounds' },
  { name: 'Lavender (Primary)', hex: '#C8B6E2', rgb: '200, 182, 226', usage: 'Soft accents, highlights' },
  { name: 'Silver (Primary)', hex: '#C0C0C0', rgb: '192, 192, 192', usage: 'Metallic accents, borders' },
  { name: 'Off-White', hex: '#F5F5F5', rgb: '245, 245, 245', usage: 'Light backgrounds, text on dark' },
  { name: 'Carbon Black', hex: '#121212', rgb: '18, 18, 18', usage: 'Dark backgrounds, text' },
]

const typography = [
  { name: 'Display Font', family: 'Reckless Neue Wide', weights: ['Regular', 'Medium', 'Bold'], usage: 'Headlines, hero text, titles' },
  { name: 'Body Font', family: 'Montserrat', weights: ['400', '500', '600', '700'], usage: 'Body text, UI, paragraphs' },
]

const logoFiles = [
  { name: 'Primary Logo (Transparent)', filename: 'CHROMARA_transparent.png', path: '/mnt/project/CHROMARA_transparent.png', description: 'Full color logo on transparent background' },
  { name: 'Fingerprint Icon', filename: 'fingerprint_icon_transparent.PNG', path: '/mnt/project/fingerprint_icon_transparent.PNG', description: 'Biometric identity icon' },
  { name: 'NovaMirror Hero', filename: 'novamirror_hero.jpeg', path: '/mnt/project/novamirror_hero.jpeg', description: 'Product hero image' },
  { name: 'Generated Image', filename: 'Generated_Image_January_09_2026__12_08PM.png', path: '/mnt/project/Generated_Image_January_09_2026__12_08PM.png', description: 'AI-generated brand asset' },
]

const designPrinciples = [
  { emoji: '🌟', title: 'Neo-Human Tech', description: 'Blend futuristic technology with human warmth and accessibility' },
  { emoji: '💎', title: 'Glassmorphism', description: 'Translucent layers, frosted glass effects, depth and dimension' },
  { emoji: '⚡', title: 'LED Violet Energy', description: 'Electric purple as the core brand signature - tech meets beauty' },
  { emoji: '✨', title: 'Premium Luxury', description: 'Sophisticated, high-end aesthetics that feel exclusive yet inclusive' },
  { emoji: '🔮', title: 'Frutiger Aero Optimism', description: 'Clean, optimistic, forward-looking design philosophy' },
  { emoji: '🎯', title: 'Precision & Personalization', description: 'Everything tailored, nothing one-size-fits-all' },
]

export default function BrandResourcesPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [uploadedLogos, setUploadedLogos] = useState<Array<{name: string, url: string, file: File}>>([])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(label)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newLogos = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }))

    setUploadedLogos([...uploadedLogos, ...newLogos])
  }

  const downloadLogo = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Brand Resources 🎨</h1>
        <p className="text-white/60">Chromara's brand guidelines, assets, and design system</p>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Color Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandColors.map((color) => (
            <div key={color.name} className="glass-card p-4">
              <div
                className="w-full h-24 rounded-lg mb-3 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex, color.name)}
                title="Click to copy HEX"
              />
              <h3 className="font-semibold text-white mb-1">{color.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">HEX</span>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.name)}
                    className="text-white font-mono hover:text-chromara-pink transition-colors"
                  >
                    {color.hex} {copiedColor === color.name && '✓'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">RGB</span>
                  <button
                    onClick={() => copyToClipboard(color.rgb, color.name + '-rgb')}
                    className="text-white font-mono hover:text-chromara-pink transition-colors text-xs"
                  >
                    {color.rgb}
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-2">{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gradients */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Signature Gradients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div
              className="w-full h-24 rounded-lg mb-3 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8C52FF 0%, #AF86FF 100%)' }}
              onClick={() => copyToClipboard('linear-gradient(135deg, #8C52FF 0%, #AF86FF 100%)', 'led-gradient')}
            />
            <h3 className="font-semibold text-white mb-1">LED Violet Gradient</h3>
            <p className="text-xs text-white/60 font-mono">
              linear-gradient(135deg, #8C52FF 0%, #AF86FF 100%)
            </p>
            <p className="text-xs text-white/50 mt-2">Primary brand gradient - CTAs, buttons, hero sections</p>
          </div>

          <div className="glass-card p-4">
            <div
              className="w-full h-24 rounded-lg mb-3 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8B6E2 0%, #8C52FF 100%)' }}
              onClick={() => copyToClipboard('linear-gradient(135deg, #C8B6E2 0%, #8C52FF 100%)', 'lavender-gradient')}
            />
            <h3 className="font-semibold text-white mb-1">Lavender to Violet</h3>
            <p className="text-xs text-white/60 font-mono">
              linear-gradient(135deg, #C8B6E2 0%, #8C52FF 100%)
            </p>
            <p className="text-xs text-white/50 mt-2">Soft accent gradient - backgrounds, cards</p>
          </div>

          <div className="glass-card p-4">
            <div
              className="w-full h-24 rounded-lg mb-3 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #4A1A73, #121212)' }}
              onClick={() => copyToClipboard('linear-gradient(to bottom right, #4A1A73, #121212)', 'dark-gradient')}
            />
            <h3 className="font-semibold text-white mb-1">Deep Violet to Carbon</h3>
            <p className="text-xs text-white/60 font-mono">
              linear-gradient(to bottom right, #4A1A73, #121212)
            </p>
            <p className="text-xs text-white/50 mt-2">Dark mode backgrounds, premium sections</p>
          </div>

          <div className="glass-card p-4">
            <div
              className="w-full h-24 rounded-lg mb-3 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              style={{ background: 'radial-gradient(circle at top, #8C52FF, #4A1A73)' }}
              onClick={() => copyToClipboard('radial-gradient(circle at top, #8C52FF, #4A1A73)', 'radial-gradient')}
            />
            <h3 className="font-semibold text-white mb-1">LED Radial Glow</h3>
            <p className="text-xs text-white/60 font-mono">
              radial-gradient(circle at top, #8C52FF, #4A1A73)
            </p>
            <p className="text-xs text-white/50 mt-2">Spotlight effects, hero backgrounds</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typography.map((font) => (
            <div key={font.name} className="glass-card p-4">
              <h3 className="font-semibold text-white mb-2">{font.name}</h3>
              <p className="text-2xl mb-3" style={{ fontFamily: font.family.includes('Reckless') ? 'serif' : 'Montserrat, sans-serif' }}>
                {font.family.includes('Reckless') ? 'CHROMARA' : 'The future of beauty is personalized'}
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Font Family</span>
                  <span className="text-white font-mono">{font.family}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Weights</span>
                  <span className="text-white">{font.weights.join(', ')}</span>
                </div>
                <p className="text-xs text-white/50 mt-2">{font.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design Principles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designPrinciples.map((principle) => (
            <div key={principle.title} className="glass-card p-4">
              <div className="text-4xl mb-3">{principle.emoji}</div>
              <h3 className="font-semibold text-white mb-2">{principle.title}</h3>
              <p className="text-sm text-white/60">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logo Assets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Logo & Brand Assets</h2>
          <label className="glass-button cursor-pointer">
            ➕ Upload Logo
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Files */}
          {logoFiles.map((logo) => (
            <div key={logo.filename} className="glass-card p-4">
              <div className="bg-white/10 rounded-lg p-6 flex items-center justify-center h-40 mb-3 relative group">
                <span className="text-4xl">🎨</span>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button 
                    onClick={() => {
                      alert(`Logo files are stored at:\n${logo.path}\n\nAccess them via File Bank!`)
                    }}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
                  >
                    📁 View Path
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{logo.name}</h3>
                <p className="text-xs text-white/60 mb-2">{logo.description}</p>
                <p className="text-xs text-white/40 font-mono">{logo.filename}</p>
              </div>
            </div>
          ))}

          {/* Uploaded Logos */}
          {uploadedLogos.map((logo, idx) => (
            <div key={idx} className="glass-card p-4">
              <div className="bg-white/10 rounded-lg overflow-hidden h-40 mb-3 relative group">
                <img 
                  src={logo.url} 
                  alt={logo.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => downloadLogo(logo.url, logo.name)}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
                  >
                    ⬇️ Download
                  </button>
                  <button 
                    onClick={() => window.open(logo.url, '_blank')}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm"
                  >
                    👁️ View
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{logo.name}</h3>
                <p className="text-xs text-white/40">Uploaded asset</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <p className="text-sm text-white/60">
            📁 <strong>Logo files from your project</strong> are referenced at <code className="text-chromara-lavender">/mnt/project/</code>
          </p>
          <p className="text-xs text-white/40 mt-2">
            Files: {logoFiles.map(f => f.filename).join(', ')}
          </p>
          <p className="text-xs text-white/40 mt-2">
            💡 Use the File Bank to upload, organize, and download brand assets!
          </p>
        </div>
      </section>

      {/* Glassmorphism Guide */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Glassmorphism Design System</h2>
        <div className="glass-card p-6">
          <p className="text-white/80 mb-4">
            Chromara's signature glassmorphic aesthetic creates depth, premium feel, and futuristic elegance:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">CSS Properties:</h4>
              <pre className="bg-black/30 p-3 rounded-lg text-xs text-chromara-lavender overflow-x-auto">
{`.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(140, 82, 255, 0.2);
}`}</pre>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">Usage Guidelines:</h4>
              <ul className="text-sm text-white/60 space-y-1">
                <li>✅ Cards, modals, overlays, navigation</li>
                <li>✅ Hover states (increase opacity to 0.15)</li>
                <li>✅ Layer multiple glass elements for depth</li>
                <li>✅ Pair with LED violet accents</li>
                <li>❌ Don't overuse - balance with solid sections</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Quick Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">📐 Spacing Scale</h3>
            <ul className="text-sm text-white/60 space-y-1">
              <li>XS: 4px (0.25rem)</li>
              <li>SM: 8px (0.5rem)</li>
              <li>MD: 16px (1rem)</li>
              <li>LG: 24px (1.5rem)</li>
              <li>XL: 32px (2rem)</li>
              <li>2XL: 48px (3rem)</li>
            </ul>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">📏 Border Radius</h3>
            <ul className="text-sm text-white/60 space-y-1">
              <li>Cards: 20px</li>
              <li>Buttons: 9999px (full rounded)</li>
              <li>Images: 12px</li>
              <li>Inputs: 8px</li>
              <li>Modals: 24px</li>
            </ul>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">✨ Motion & Effects</h3>
            <ul className="text-sm text-white/60 space-y-1">
              <li>Backdrop blur: 20px</li>
              <li>Hover scale: 1.02-1.05</li>
              <li>Transition: 300ms ease</li>
              <li>Shadow opacity: 0.2</li>
              <li>Glow: LED violet 20%</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Voice & Tone */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Voice & Tone</h2>
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">✅ We Are:</h3>
              <ul className="text-sm text-white/60 space-y-2">
                <li>🎯 <strong>Precise & Technical</strong> - Data-driven, specific numbers</li>
                <li>⚡ <strong>Bold & Confident</strong> - Revolutionary technology</li>
                <li>✨ <strong>Inclusive & Empowering</strong> - Beauty for everyone</li>
                <li>🔮 <strong>Future-Forward</strong> - Next-gen innovation</li>
                <li>💜 <strong>Warm & Human</strong> - Tech with heart</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">❌ We're Not:</h3>
              <ul className="text-sm text-white/60 space-y-2">
                <li>🚫 Cheesy or overly cute</li>
                <li>🚫 Vague or abstract</li>
                <li>🚫 Exclusive or elitist</li>
                <li>🚫 Cold or robotic</li>
                <li>🚫 Overselling or hype-y</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="glass-card p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need All Brand Assets?</h3>
        <p className="text-white/60 mb-4">
          Access complete brand kit, guidelines, logos, and templates
        </p>
        <a href="/dashboard/personal/files" className="glass-button inline-block">
          📦 Go to File Bank
        </a>
      </section>
    </div>
  )
}
