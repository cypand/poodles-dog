'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type AuditEntry = {
  id: string
  actor_name: string | null
  action: string
  target_type: string
  target_label: string | null
  details: string | null
  created_at: string
}

export default function AuditLogPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      if (profile?.role !== 'admin') {
        setIsAdmin(false)
        setCheckingAccess(false)
        return
      }

      setIsAdmin(true)
      setCheckingAccess(false)

      const { data } = await supabase
        .from('admin_audit_log')
        .select('id, actor_name, action, target_type, target_label, details, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      setEntries(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (checkingAccess) {
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
        <h1 className="text-2xl font-bold mb-2">Audit Log</h1>
        <p className="text-sm text-gray-500 mb-6">Last 200 admin/moderator actions.</p>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && entries.length === 0 && <p className="text-gray-500">No actions logged yet.</p>}

        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="border rounded-md p-3 text-sm">
              <p>
                <span className="font-semibold">{entry.actor_name ?? 'Unknown'}</span>{' '}
                <span className="text-gray-600">{entry.action}</span>{' '}
                <span className="font-medium">{entry.target_label ?? entry.target_type}</span>
              </p>
              {entry.details && <p className="text-gray-500 text-xs mt-1">{entry.details}</p>}
              <p className="text-xs text-gray-400 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
