'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/lib/audit'
import Header from '@/components/Header'

type RoleRequest = {
  id: string
  user_id: string
  kennel_name: string | null
  litter_parents: string | null
  litter_size: string | null
  message: string | null
  status: string
  created_at: string
  requester: { display_name: string | null } | null
}

export default function BreederRequestsPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      setHasAccess(true)
      setCheckingAccess(false)
    }
    checkAccess()
  }, [router])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('role_change_requests')
      .select('id, user_id, kennel_name, litter_parents, litter_size, message, status, created_at, requester:profiles(display_name)')
      .order('created_at', { ascending: false })

    setRequests((data as unknown as RoleRequest[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (hasAccess) load()
  }, [hasAccess])

  const handleApprove = async (request: RoleRequest) => {
    setProcessingId(request.id)
    setActionError('')

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'breeder' })
      .eq('id', request.user_id)

    if (profileError) {
      setActionError(profileError.message)
      setProcessingId(null)
      return
    }

    await supabase.from('breeder_profiles').upsert({
      id: request.user_id,
      kennel_name: request.kennel_name ?? '',
    })

    const { error: requestError } = await supabase
      .from('role_change_requests')
      .update({ status: 'APPROVED' })
      .eq('id', request.id)

    if (requestError) {
      setActionError(requestError.message)
      setProcessingId(null)
      return
    }

    await logAudit(
      'Approved breeder request',
      'role_request',
      request.id,
      request.requester?.display_name ?? 'Unknown user'
    )

    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: 'APPROVED' } : r)))
    setProcessingId(null)
  }

  const handleReject = async (request: RoleRequest) => {
    setProcessingId(request.id)
    setActionError('')

    const { error } = await supabase
      .from('role_change_requests')
      .update({ status: 'REJECTED' })
      .eq('id', request.id)

    if (error) {
      setActionError(error.message)
      setProcessingId(null)
      return
    }

    await logAudit(
      'Rejected breeder request',
      'role_request',
      request.id,
      request.requester?.display_name ?? 'Unknown user'
    )

    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: 'REJECTED' } : r)))
    setProcessingId(null)
  }

  if (checkingAccess) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (!hasAccess) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-red-600">You do not have access to this page.</p>
        </div>
      </>
    )
  }

  const pending = requests.filter((r) => r.status === 'PENDING')
  const resolved = requests.filter((r) => r.status !== 'PENDING')

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Breeder Requests</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {actionError && <p className="text-red-600 text-sm mb-4">{actionError}</p>}

        {!loading && pending.length === 0 && (
          <p className="text-gray-500 mb-8">No pending requests.</p>
        )}

        <div className="space-y-4 mb-10">
          {pending.map((req) => (
            <div key={req.id} className="border rounded-md p-4">
              <p className="font-semibold">{req.requester?.display_name ?? 'Unknown user'}</p>
              {req.kennel_name && <p className="text-sm text-gray-600 mt-1">Kennel: {req.kennel_name}</p>}
              {req.litter_parents && (
                <p className="text-sm text-gray-600 mt-1">Parents: {req.litter_parents}</p>
              )}
              {req.litter_size && (
                <p className="text-sm text-gray-600 mt-1">Litter size: {req.litter_size}</p>
              )}
              {req.message && <p className="text-sm text-gray-600 mt-1">Note: {req.message}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleString()}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApprove(req)}
                  disabled={processingId === req.id}
                  className="px-3 py-1 bg-black text-white text-sm rounded-md disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={processingId === req.id}
                  className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded-md disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {resolved.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-3">Past requests</h2>
            <div className="space-y-2">
              {resolved.map((req) => (
                <div key={req.id} className="border rounded-md p-3 flex items-center justify-between">
                  <span className="text-sm">{req.requester?.display_name ?? 'Unknown user'}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
