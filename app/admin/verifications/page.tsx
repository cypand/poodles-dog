'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/lib/audit'
import Header from '@/components/Header'

type PendingBreeder = {
  id: string
  kennel_name: string
  registry_number: string | null
  certificate_path: string | null
  verification_submitted_at: string | null
  country_code: string | null
}

export default function VerificationsPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [breeders, setBreeders] = useState<PendingBreeder[]>([])
  const [loading, setLoading] = useState(true)
  const [certUrls, setCertUrls] = useState<Record<string, string>>({})
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

  useEffect(() => {
    if (!hasAccess) return

    const load = async () => {
      setLoading(true)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, country_code')

      const countryMap: Record<string, string | null> = {}
      for (const p of profiles ?? []) {
        countryMap[p.id] = p.country_code
      }

      const { data } = await supabase
        .from('breeder_profiles')
        .select('id, kennel_name, registry_number, certificate_path, verification_submitted_at')
        .eq('verification_status', 'pending')
        .order('verification_submitted_at', { ascending: true })

      const withCountry = (data ?? []).map((b) => ({ ...b, country_code: countryMap[b.id] ?? null }))
      setBreeders(withCountry)

      const urlMap: Record<string, string> = {}
      for (const b of withCountry) {
        if (b.certificate_path) {
          const { data: signedUrl } = await supabase.storage
            .from('breeder-certificates')
            .createSignedUrl(b.certificate_path, 300)
          if (signedUrl) urlMap[b.id] = signedUrl.signedUrl
        }
      }
      setCertUrls(urlMap)
      setLoading(false)
    }
    load()
  }, [hasAccess])

  const handleDecision = async (breederId: string, kennelName: string, approve: boolean) => {
    setProcessingId(breederId)

    await supabase
      .from('breeder_profiles')
      .update({ verification_status: approve ? 'verified' : 'rejected' })
      .eq('id', breederId)

    await logAudit(
      approve ? 'Approved breeder verification' : 'Rejected breeder verification',
      'breeder_verification',
      breederId,
      kennelName || 'Unnamed kennel'
    )

    setBreeders((prev) => prev.filter((b) => b.id !== breederId))
    setProcessingId(null)
  }

  if (checkingAccess) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-3xl mx-auto p-6 text-pd-gray">Loading...</div>
        </div>
      </>
    )
  }

  if (!hasAccess) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-3xl mx-auto p-6">
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
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-4 mb-2">
            <h1 className="text-xl font-bold">Breeder Verifications</h1>
          </div>
          <p className="text-sm text-pd-gray mb-6">Certificates are private — visible only here, to staff.</p>

          {loading && <p className="text-pd-gray">Loading...</p>}
          {!loading && breeders.length === 0 && <p className="text-pd-gray">No pending verifications.</p>}

          <div className="space-y-4">
            {breeders.map((b) => (
              <div key={b.id} className="bg-white border border-pd-black/10 rounded-md p-4">
                <p className="font-semibold text-pd-black">{b.kennel_name || 'Unnamed kennel'}</p>
                {b.registry_number && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-pd-gray">Registry #: {b.registry_number}</p>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        b.registry_number + (b.country_code ? ' ' + b.country_code : '') + ' kennel club registration'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      Search on Google →
                    </a>
                  </div>
                )}
                {certUrls[b.id] ? (
                  <a
                    href={certUrls[b.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-sm text-blue-600 underline"
                  >
                    View submitted certificate →
                  </a>
                ) : (
                  <p className="text-sm text-pd-gray mt-2">No certificate uploaded.</p>
                )}
                <p className="text-xs text-pd-gray mt-2">
                  Submitted:{' '}
                  {b.verification_submitted_at ? new Date(b.verification_submitted_at).toLocaleString() : '—'}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDecision(b.id, b.kennel_name, true)}
                    disabled={processingId === b.id}
                    className="px-3 py-1.5 bg-pd-black text-pd-gold text-sm rounded-md disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(b.id, b.kennel_name, false)}
                    disabled={processingId === b.id}
                    className="px-3 py-1.5 border border-red-600 text-red-600 text-sm rounded-md disabled:opacity-50 bg-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
