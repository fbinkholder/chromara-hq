'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace('/dashboard')
      }
    }
    checkUser()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
        setLoading(false)
        return
      }
      setMessage({ type: 'success', text: 'Signed in! Redirecting...' })
      router.replace('/dashboard')
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0f]">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chromara-purple to-chromara-pink bg-clip-text text-transparent mb-2 text-center">
          CHROMARA HQ
        </h1>
        <p className="text-white/60 mb-8 text-center">Powered by AI</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-chromara-purple"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-chromara-purple"
              placeholder="••••••••"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.type === 'error' ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          Don&apos;t have an account? Set up Supabase Auth in your project to enable sign up.
        </p>
        <p className="mt-2 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-chromara-purple hover:text-chromara-pink underline"
          >
            Continue to Dashboard →
          </Link>
        </p>
      </div>
    </div>
  )
}
