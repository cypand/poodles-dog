'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/lib/audit'
import Header from '@/components/Header'

const PROTECTED_ADMIN_EMAIL = 'cypand@gmail.com'

const DURATION_OPTIONS = [
  { label: '1 Day', hours: 24 },
  { label: '1 Week', hours: 24 * 7 },
  { label: '1 Month', hours: 24 * 30 },
]

const SUSPEND_REASONS = [
  'Spam or unsolicited messaging',
  'Suspicious or scam activity',
  'Inappropriate content or behavior',
  'Multiple user complaints/reports',
  'Violation of platform rules',
  'Other',
]

const BAN_REASONS = [
  'Repeated policy violations',
  'Fraudulent or scam activity',
  'Animal welfare violation',
  'Abusive behavior toward other users',
  'Other',
]

const ROLE_RANK: Record<string, number> = {
  admin: 0,
  moderator: 1,
}

type UserRow = {
  id: string
  display_name: string | null
  role: string
  banned: boolean
  suspended_until: string | null
  created_at: string
  email: string | null
  last_sign_in_at: string | null
  listing_count: number
}

type SortOption = 'last_login' | 'name' | 'newest' | 'listings'

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('last_login')
  const [search, setSearch] = useState('')
  const [suspendDurations, setSuspendDurations] = useState<Record<string, number>>({})
  const [suspendReasons, setSuspendReasons] = useState<Record<string, string>>({})
  const [banReasons, setBanReasons] = useState<Record<string, string>>({})

  const hasAccess = isAdmin || isModerator

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

      if (profile?.role === 'admin') {
        setIsAdmin(true)
      } else if (profile?.role === 'moderator') {
        setIsModerator(true)
      } else {
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/admin-users?t=${Date.now()}`, {
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

  const toggleBan = async (userId: string, displayName: string | null, currentlyBanned: boolean) => {
    let reason: string | undefined

    if (!currentlyBanned) {
      reason = banReasons[userId]
      if (!reason) {
        setError('Please select a reason before banning this user.')
        return
      }
    }

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

    await logAudit(
      currentlyBanned ? 'Unbanned' : 'Banned',
      'user',
      userId,
      displayName ?? 'Unnamed user',
      reason
    )

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, banned: !currentlyBanned } : u))
    )
    setActingId(null)
  }

  const handleSetRole = async (userId: string, displayName: string | null, newRole: string) => {
    if (!confirm(`Set ${displayName ?? 'this user'}'s role to ${newRole}?`)) return

    setActingId(userId)
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setActingId(null)
      return
    }

    await logAudit(`Set role to ${newRole}`, 'user', userId, displayName ?? 'Unnamed user')

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
    setActingId(null)
  }

  const handleSuspend = async (userId: string, displayName: string | null) => {
    const reason = suspendReasons[userId]
    if (!reason) {
      setError('Please select a reason before suspending this user.')
      return
    }

    setActingId(userId)
    setError('')

    const hours = suspendDurations[userId] ?? 24
    const durationLabel = DURATION_OPTIONS.find((d) => d.hours === hours)?.label ?? `${hours}h`

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin-users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, action: 'suspend', duration_hours: hours }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Could not suspend user.')
      setActingId(null)
      return
    }

    await logAudit(
      'Suspended',
      'user',
      userId,
      displayName ?? 'Unnamed user',
      `Duration: ${durationLabel} · Reason: ${reason}`
    )

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended_until: json.suspended_until } : u))
    )
    setActingId(null)
  }

  const handleUnsuspend = async (userId: string, displayName: string | null) => {
    setActingId(userId)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin-users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, action: 'unsuspend' }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Could not unsuspend user.')
      setActingId(null)
      return
    }

    await logAudit('Unsuspended', 'user', userId, displayName ?? 'Unnamed user')

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended_until: null } : u))
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

    await logAudit('Deleted account', 'user', userId, displayName ?? 'Unnamed user')

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

  if (!hasAccess) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-red-600">You do not have access to this page.</p>
        </div>
      </>
    )
  }

  const secondarySort = (a: UserRow, b: UserRow) => {
    if (sortBy === 'name') {
      return (a.display_name ?? '').localeCompare(b.display_name ?? '')
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'listings') {
      return b.listing_count - a.listing_count
    }
    if (!a.last_sign_in_at) return 1
    if (!b.last_sign_in_at) return -1
    return new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()
  }

  const searchLower = search.trim().toLowerCase()
  const filteredUsers = users.filter((u) => {
    if (!searchLower) return true
    return (
      (u.display_name ?? '').toLowerCase().includes(searchLower) ||
      (u.email ?? '').toLowerCase().includes(searchLower)
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const rankA = ROLE_RANK[a.role] ?? 2
    const rankB = ROLE_RANK[b.role] ?? 2
    if (rankA !== rankB) return rankA - rankB
    return secondarySort(a, b)
  })

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">
            Users ({sortedUsers.length}) {isModerator && <span className="text-sm font-normal text-gray-500">— Moderator view</span>}
          </h1>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="last_login">Sort: Last login</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="newest">Sort: Newest users</option>
            <option value="listings">Sort: Most listings</option>
          </select>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full border rounded-md px-3 py-2 mb-2"
        />

        <p className="text-xs text-gray-400 mb-4">Admins shown first, then moderators, then other users.</p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {sortedUsers.length === 0 && (
          <p className="text-gray-500">No users match your search.</p>
        )}

        <div className="space-y-3">
          {sortedUsers.map((u) => {
            const isProtected = u.email === PROTECTED_ADMIN_EMAIL
            const isCurrentlySuspended = u.suspended_until && new Date(u.suspended_until) > new Date()
            const canModerate = !isProtected && u.role !== 'admin'
            const canChangeRole = isAdmin && !isProtected

            return (
              <div key={u.id} className="border rounded-md p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {u.role === 'admin' && <Crown size={16} className="text-pd-gold" />}
                      {u.role === 'moderator' && <ShieldCheck size={16} className="text-blue-600" />}
                      <span className="font-semibold">{u.display_name ?? 'Unnamed'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                        {u.role}
                      </span>
                      {u.banned && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                          BANNED
                        </span>
                      )}
                      {isCurrentlySuspended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                          SUSPENDED until {new Date(u.suspended_until!).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{u.email ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last login:{' '}
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                      {' · '}
                      {u.listing_count} {u.listing_count === 1 ? 'listing' : 'listings'}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {canChangeRole && u.role !== 'admin' && (
                      <button
                        onClick={() => handleSetRole(u.id, u.display_name, 'admin')}
                        disabled={actingId === u.id}
                        className="text-xs font-bold px-3 py-1.5 rounded border border-pd-gold text-pd-gold hover:bg-pd-gold hover:text-pd-black disabled:opacity-50"
                      >
                        Admin
                      </button>
                    )}
                    {canChangeRole && u.role !== 'moderator' && (
                      <button
                        onClick={() => handleSetRole(u.id, u.display_name, 'moderator')}
                        disabled={actingId === u.id}
                        className="text-xs font-bold px-3 py-1.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        Moderator
                      </button>
                    )}
                    {canChangeRole && (u.role === 'admin' || u.role === 'moderator') && (
                      <button
                        onClick={() => handleSetRole(u.id, u.display_name, 'buyer')}
                        disabled={actingId === u.id}
                        className="text-xs font-bold px-3 py-1.5 rounded border border-gray-500 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Remove role
                      </button>
                    )}
                    {isAdmin && u.role !== 'admin' && !isProtected && (
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

                {canModerate && (
                  <div className="mt-4 pt-3 border-t space-y-3">
                    {isAdmin && !u.banned && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-16">Ban:</span>
                        <select
                          value={banReasons[u.id] ?? ''}
                          onChange={(e) => setBanReasons((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          className="text-xs border rounded px-2 py-1.5 flex-1 min-w-[160px]"
                        >
                          <option value="">Select reason...</option>
                          {BAN_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => toggleBan(u.id, u.display_name, false)}
                          disabled={actingId === u.id}
                          className="text-xs font-bold px-3 py-1.5 rounded border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {actingId === u.id ? 'Updating...' : 'Ban'}
                        </button>
                      </div>
                    )}

                    {isAdmin && u.banned && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-16">Ban:</span>
                        <button
                          onClick={() => toggleBan(u.id, u.display_name, true)}
                          disabled={actingId === u.id}
                          className="text-xs font-bold px-3 py-1.5 rounded border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          {actingId === u.id ? 'Updating...' : 'Unban'}
                        </button>
                      </div>
                    )}

                    {isCurrentlySuspended ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-16">Suspend:</span>
                        <button
                          onClick={() => handleUnsuspend(u.id, u.display_name)}
                          disabled={actingId === u.id}
                          className="text-xs font-bold px-3 py-1.5 rounded border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          {actingId === u.id ? 'Updating...' : 'Unsuspend'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-16">Suspend:</span>
                        <select
                          value={suspendReasons[u.id] ?? ''}
                          onChange={(e) => setSuspendReasons((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          className="text-xs border rounded px-2 py-1.5 flex-1 min-w-[160px]"
                        >
                          <option value="">Select reason...</option>
                          {SUSPEND_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <select
                          value={suspendDurations[u.id] ?? 24}
                          onChange={(e) =>
                            setSuspendDurations((prev) => ({ ...prev, [u.id]: Number(e.target.value) }))
                          }
                          className="text-xs border rounded px-2 py-1.5"
                        >
                          {DURATION_OPTIONS.map((opt) => (
                            <option key={opt.hours} value={opt.hours}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSuspend(u.id, u.display_name)}
                          disabled={actingId === u.id}
                          className="text-xs font-bold px-3 py-1.5 rounded border border-orange-600 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                        >
                          {actingId === u.id ? 'Updating...' : 'Suspend'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
