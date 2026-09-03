'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Listing = {
  id: string
  title: string
  price: number | null
  currency_code: string | null
  status: string
  created_at: string
  expires_at: string | null
  rejection_reason: string | null
  view_count: number
  photos: { url: string; sort_order: number }[]
}

export default function MyListingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadListings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('listings')
      .select(`id, title, price, currency_code, status, created_at, expires_at, rejection_reason, view_count, photos:listing_photos(url, sort_order)`)
      .eq('breeder_id', user.id)
      .order('created_at', { ascending: false })

    setListings((data as unknown as Listing[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [router])

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return

    setDeletingId(listingId)
    setError('')

    const { error: deleteError } = await supabase.from('listings').delete().eq('id', listingId)

    if (deleteError) {
      setError(deleteError.message)
      setDeletingId(null)
      return
    }

    setListings((prev) => prev.filter((l) => l.id !== listingId))
    setDeletingId(null)
  }

  const handleRenew = async (listingId: string) => {
    setRenewingId(listingId)
    setError('')

    const newExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

    const { error: renewError } = await supabase
      .from('listings')
      .update({ status: 'PENDING', expires_at: newExpiry })
      .eq('id', listingId)

    if (renewError) {
      setError(renewError.message)
      setRenewingId(null)
      return
    }

    await loadListings()
    setRenewingId(null)
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      SOLD: 'bg-pd-cream text-pd-gray',
      EXPIRED: 'bg-orange-100 text-orange-700',
    }
    return styles[status] ?? 'bg-pd-cream text-pd-gray'
  }

  const expiryText = (listing: Listing) => {
    if (!listing.expires_at) return null
    const expiresDate = new Date(listing.expires_at)
    const now = new Date()

    if (listing.status === 'EXPIRED' || (expiresDate < now && listing.status === 'ACTIVE')) {
      return (
        <span className="text-orange-600">
          This listing has expired. Delete it if sold, or renew below to relist.
        </span>
      )
    }

    if (listing.status !== 'ACTIVE') return null

    const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <span className="text-pd-gray">
        Active until {expiresDate.toLocaleDateString()} ({daysLeft} days left)
      </span>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-4 mb-2">
            <h1 className="text-xl font-bold">My Listings</h1>
          </div>
          <p className="text-sm text-pd-gray mb-6">
            Listings stay active for 3 months from the date posted. If your puppy has been sold, please delete the listing right away.
          </p>

          {loading && <p className="text-pd-gray">Loading...</p>}

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {!loading && listings.length === 0 && (
            <p className="text-pd-gray">
              You haven't posted any listings yet.{' '}
              <Link href="/post-a-listing" className="underline">
                Post one now
              </Link>
              .
            </p>
          )}

          <div className="space-y-4">
            {listings.map((listing) => {
              const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
              return (
                <div key={listing.id} className="bg-white border border-pd-black/10 rounded-md p-4 flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-pd-cream rounded-md overflow-hidden">
                    {photo ? (
                      <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pd-gray text-xs">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-pd-black">
                        <Link href={`/listing/${listing.id}`} className="hover:underline">
                          {listing.title || 'Untitled listing'}
                        </Link>
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-pd-gray">
                        <Eye size={12} /> {listing.view_count ?? 0} views
                      </span>
                    </div>
                    <p className="text-sm font-bold text-pd-gold mt-1">
                      {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                    </p>
                    {listing.status === 'REJECTED' && listing.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {listing.rejection_reason}</p>
                    )}
                    <p className="text-xs mt-1">{expiryText(listing)}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(listing.status === 'EXPIRED' || (listing.status === 'ACTIVE' && listing.expires_at && new Date(listing.expires_at) < new Date())) && (
                        <button
                          onClick={() => handleRenew(listing.id)}
                          disabled={renewingId === listing.id}
                          className="text-xs font-bold text-green-700 border border-green-600 px-3 py-1.5 rounded hover:bg-green-50 bg-white disabled:opacity-50"
                        >
                          {renewingId === listing.id ? 'Renewing...' : 'Renew listing'}
                        </button>
                      )}
                      <Link
                        href={`/listing/${listing.id}/edit`}
                        className="text-xs font-bold text-blue-600 border border-blue-600 px-3 py-1.5 rounded hover:bg-blue-50 bg-white"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className="text-xs font-bold text-red-600 border border-red-600 px-3 py-1.5 rounded hover:bg-red-50 bg-white disabled:opacity-50"
                      >
                        {deletingId === listing.id ? 'Deleting...' : 'Delete listing'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
