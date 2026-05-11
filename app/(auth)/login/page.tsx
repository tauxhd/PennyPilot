'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="flex justify-center mb-8">
        <Image
            src="/images/logo-1-whi.png"
            alt="PennyPilot"
            width={220}
            height={60}
            className="object-contain"
        />
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}