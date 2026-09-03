'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/lib/audit'
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

  const updateStatus = async (id: string, listingTitle: string, status: string) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    await logAudit(
      status === 'RESOLVED' ? 'Marked report resolved' : 'Dismissed report',
      'report',
      id,
      listingTitle || 'Report'
    )
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  if (checkingAccess) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-4xl mx-auto p-6 text-pd-gray">Loading...</div>
        </div>
      </>
    )
  }

  if (!hasAccess) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-4xl mx-auto p-6">
            <p className="text-red-600">You do not have access to this page.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-4 mb-6">
            <h1 className="text-xl font-bold">Reports</h1>
          </div>

          {loading && <p className="text-pd-gray">Loading...</p>}

          {!loading && reports.length === 0 && (
            <p className="text-pd-gray">No reports yet.</p>
          )}

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border border-pd-black/10 rounded-md p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-pd-black">{report.reason}</p>
                    <p className="text-sm text-pd-gray">
                      Re:{' '}
                      <Link href={`/listing/${report.listing_id}`} className="underline">
                        {report.listing?.title || 'Listing'}
                      </Link>
                    </p>
                    {report.reporter_email && (
                      <p className="text-sm text-pd-gray">From: {report.reporter_email}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      report.status === 'RESOLVED'
                        ? 'bg-green-100 text-green-700'
                        : report.status === 'DISMISSED'
                        ? 'bg-pd-cream text-pd-gray'
                        : 'bg-pd-gold/20 text-pd-black'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                {report.details && (
                  <p className="text-sm mt-2 whitespace-pre-wrap text-pd-black/80">{report.details}</p>
                )}

                <p className="text-xs text-pd-gray mt-2">
                  {new Date(report.created_at).toLocaleString()}
                </p>

                {report.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateStatus(report.id, report.listing?.title ?? '', 'RESOLVED')}
                      className="text-xs font-bold border border-green-600 text-green-700 px-3 py-1.5 rounded hover:bg-green-50 bg-white"
                    >
                      Mark resolved
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, report.listing?.title ?? '', 'DISMISSED')}
                      className="text-xs font-bold border border-pd-black/15 px-3 py-1.5 rounded hover:bg-pd-cream bg-white text-pd-black"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
