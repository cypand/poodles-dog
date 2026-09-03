'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Report = {
  id: string
  listing_id: string
  reporter_email: string | null
  reason: string
  details: string | null
  status: string
  created_at: string
  listing: { title: string } | null
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

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
      .from('reports')
      .select('id, listing_id, reporter_email, reason, details, status, created_at, listing:listings(title)')
      .order('created_at', { ascending: false })

    setReports((data as unknown as Report[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (hasAccess) load()
  }, [hasAccess])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  if (checkingAccess) {
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

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && reports.length === 0 && (
          <p className="text-gray-500">No reports yet.</p>
        )}

        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold">{report.reason}</p>
                  <p className="text-sm text-gray-500">
                    Re:{' '}
                    <Link href={`/listing/${report.listing_id}`} className="underline">
                      {report.listing?.title || 'Listing'}
                    </Link>
                  </p>
                  {report.reporter_email && (
                    <p className="text-sm text-gray-500">From: {report.reporter_email}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    report.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-700'
                      : report.status === 'DISMISSED'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-pd-gold/20 text-pd-black'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {report.details && (
                <p className="text-sm mt-2 whitespace-pre-wrap">{report.details}</p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {new Date(report.created_at).toLocaleString()}
              </p>

              {report.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateStatus(report.id, 'RESOLVED')}
                    className="text-xs font-bold border px-3 py-1.5 hover:bg-green-50"
                  >
                    Mark resolved
                  </button>
                  <button
                    onClick={() => updateStatus(report.id, 'DISMISSED')}
                    className="text-xs font-bold border px-3 py-1.5 hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
