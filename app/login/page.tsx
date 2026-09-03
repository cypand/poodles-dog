'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const REMEMBERED_EMAIL_KEY = 'poodles-remembered-email'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (signInData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('banned, suspended_until')
        .eq('id', signInData.user.id)
        .single()

      if (profile?.banned) {
        await supabase.auth.signOut()
        setError('Your account has been suspended. Please contact support if you believe this is a mistake.')
        setLoading(false)
        return
      }

      if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) {
        await supabase.auth.signOut()
        const until = new Date(profile.suspended_until).toLocaleString()
        setError(`Your account is temporarily suspended until ${until}. Please contact support if you believe this is a mistake.`)
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-pd-cream min-h-screen">
      <div className="max-w-md mx-auto pt-16 p-6">
        <div className="bg-white border border-pd-black/10 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-pd-black">Log in</h1>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-pd-black/15 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-pd-black/15 rounded-md px-3 py-2"
              />
              <a href="/forgot-password" className="text-xs text-pd-gray underline mt-1 inline-block">
                Forgot password?
              </a>
            </div>

            <label className="flex items-center gap-2 text-sm text-pd-black">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember my email
            </label>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pd-black text-pd-gold rounded-md py-2 font-medium disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-pd-gray mt-4 text-center">
            Don't have an account?{' '}
            <a href="/register" className="underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
