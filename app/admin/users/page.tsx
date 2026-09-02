'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type UserRow = {
  id: string
  display_name: string | null
  role: string
  banned: boolean
  created_at: string
  email: string | null
  last_sign_in_at: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin-users', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        setError('Could not load users.')
        setLoading(false)
        return
      }

      const json = await res.json()
      setUsers(json.users ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    setActingId(userId)
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banned: !currentlyBanned })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setActingId(null)
      return
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, banned: !currentlyBanned } : u))
    )
    setActingId(null)
  }

  const handleDeleteUser = async (userId: string, displayName: string | null) => {
    if (!confirm(`Permanently delete ${displayName ?? 'this user'}'s account? This cannot be undone.`)) return

    setDeletingId(userId)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin-users', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Could not delete user.')
      setDeletingId(null)
      return
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-red-600">You do not have access to this page.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="border rounded-md p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{u.display_name ?? 'Unnamed'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                    {u.role}
                  </span>
                  {u.banned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      BANNED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{u.email ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Last login:{' '}
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleBan(u.id, u.banned)}
                  disabled={actingId === u.id}
                  className={`text-xs font-bold px-3 py-1.5 rounded disabled:opacity-50 ${
                    u.banned
                      ? 'border border-green-600 text-green-700 hover:bg-green-50'
                      : 'border border-red-600 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {actingId === u.id ? 'Updating...' : u.banned ? 'Unban' : 'Ban'}
                </button>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(u.id, u.display_name)}
                    disabled={deletingId === u.id}
                    className="text-xs font-bold px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === u.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
