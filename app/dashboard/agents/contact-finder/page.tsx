'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ContactFinderPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    linkedin_url: '',
    segment: 'beauty brands',
    priority: 'medium'
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.company) {
      alert('Name and Company are required!')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('outreach_contacts')
        .insert({
          user_id: user.id,
          contact_name: formData.name,
          title: formData.title,
          company: formData.company,
          email: formData.email || null,
          linkedin_url: formData.linkedin_url || null,
          segment: formData.segment,
          priority: formData.priority,
          status: 'not_contacted'
        })

      if (error) throw error

      alert('✅ Contact added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        title: '',
        company: '',
        email: '',
        linkedin_url: '',
        segment: 'beauty brands',
        priority: 'medium'
      })
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to add contact: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-3">➕ Add Contact Manually</h1>
        <p className="text-white/60 text-lg">Find contacts on LinkedIn/Apollo, then add them here</p>
      </div>

      <div className="glass-card p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Contact Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="VP of Innovation"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Company <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              placeholder="L'Oréal"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-white font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="jane.smith@loreal.com"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-white font-semibold mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
              placeholder="https://linkedin.com/in/janesmith"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/40"
            />
          </div>

          {/* Segment */}
          <div>
            <label className="block text-white font-semibold mb-2">Segment</label>
            <select
              value={formData.segment}
              onChange={(e) => setFormData({...formData, segment: e.target.value})}
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
            >
              <option value="beauty brands">Beauty Brands</option>
              <option value="retail partners">Retail Partners</option>
              <option value="investors">Investors</option>
              <option value="manufacturers">Manufacturers</option>
              <option value="press">Press/Media</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-white font-semibold mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full glass-button py-4 text-lg font-semibold disabled:opacity-50"
          >
            {saving ? '⏳ Adding...' : '✅ Add Contact'}
          </button>
        </form>
      </div>

      {/* Quick Tip */}
      <div className="glass-card p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-white mb-3">💡 Quick Tip</h3>
        <p className="text-white/80 mb-3">Find contacts on:</p>
        <ul className="list-disc list-inside space-y-2 text-white/70">
          <li><strong>LinkedIn:</strong> Search "VP Innovation beauty brands"</li>
          <li><strong>Apollo.io:</strong> Use their web interface (no API needed)</li>
          <li><strong>Company websites:</strong> Look for leadership pages</li>
        </ul>
        <p className="text-white/60 text-sm mt-4">
          Then copy/paste their info here → Auto-added to Partnership Tracker!
        </p>
      </div>
    </div>
  )
}