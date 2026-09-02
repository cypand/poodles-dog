'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency_code: string | null
  status: string
  created_at: string
  country: { name: string } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [actionError, setActionError] = useState('')

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

      const { data } = await supabase
        .from('listings')
        .select(
          `id, title, description, price, currency_code, status, created_at,
           country:countries(name),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })

      setListings((data as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleDecision = async (listingId: string, newStatus: 'ACTIVE' | 'REJECTED') => {
    setActionError('')
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)

    if (error) {
      setActionError(error.message)
      return
    }

    setListings((prev) => prev.filter((l) => l.id !== listingId))

    if (newStatus === 'ACTIVE') {
      fetch('/api/notify-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      }).catch(() => {
        // Non-critical: alert emails failing shouldn't block the approval flow
      })
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-red-600">You do not have access to this page.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Pending Listings ({listings.length})</h1>

        {actionError && <p className="text-red-600 text-sm mb-4">{actionError}</p>}

        {listings.length === 0 && (
          <p className="text-gray-500">No listings waiting for approval.</p>
        )}

        <div className="space-y-4">
          {listings.map((listing) => {
            const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
            return (
              <div key={listing.id} className="border rounded-md p-4 flex gap-4">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  {photo ? (
                    <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{listing.title || 'Untitled listing'}</h2>
                  <p className="text-sm text-gray-500">
                    {listing.breeder?.kennel_name ?? 'Unknown kennel'} · {listing.country?.name ?? '—'}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDecision(listing.id, 'ACTIVE')}
                      className="px-3 py-1 bg-black text-white text-sm rounded-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(listing.id, 'REJECTED')}
                      className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded-md"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
