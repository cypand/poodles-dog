'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  photos: { url: string; sort_order: number }[]
}

export default function MyListingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('listings')
        .select(`id, title, price, currency_code, status, created_at, expires_at, photos:listing_photos(url, sort_order)`)
        .eq('breeder_id', user.id)
        .order('created_at', { ascending: false })

      setListings((data as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
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

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      SOLD: 'bg-gray-100 text-gray-600',
      EXPIRED: 'bg-orange-100 text-orange-700',
    }
    return styles[status] ?? 'bg-gray-100 text-gray-600'
  }

  const expiryText = (listing: Listing) => {
    if (!listing.expires_at) return null
    const expiresDate = new Date(listing.expires_at)
    const now = new Date()

    if (listing.status === 'EXPIRED' || expiresDate < now) {
      return (
        <span className="text-orange-600">
          This listing has expired and is no longer visible in search. Delete it if the puppy has been sold, or contact us to reactivate.
        </span>
      )
    }

    const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <span className="text-gray-400">
        Active until {expiresDate.toLocaleDateString()} ({daysLeft} days left)
      </span>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">My Listings</h1>
        <p className="text-sm text-gray-500 mb-6">
          Listings stay active for 3 months from the date posted. If your puppy has been sold, please delete the listing right away.
        </p>

        {loading && <p className="text-gray-500">Loading...</p>}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!loading && listings.length === 0 && (
          <p className="text-gray-500">
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
              <div key={listing.id} className="border rounded-md p-4 flex gap-4">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                  {photo ? (
                    <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold">
                      <Link href={`/listing/${listing.id}`} className="hover:underline">
                        {listing.title || 'Untitled listing'}
                      </Link>
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadge(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold mt-1">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                  <p className="text-xs mt-1">{expiryText(listing)}</p>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                    className="mt-3 text-xs font-bold text-red-600 border border-red-600 px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === listing.id ? 'Deleting...' : 'Delete listing'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
