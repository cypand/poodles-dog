'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { logAudit } from '@/lib/audit'
import Header from '@/components/Header'

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency_code: string | null
  status: string
  created_at: string
  date_of_birth: string | null
  country: { name: string } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

type SortOption = 'newest' | 'oldest' | 'age'

const ageInMonths = (dob: string | null): number => {
  if (!dob) return 9999
  const birth = new Date(dob)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [actionError, setActionError] = useState('')
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
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

      if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
        setHasAccess(false)
        setLoading(false)
        return
      }

      setHasAccess(true)

      let query = supabase
        .from('listings')
        .select(
          `id, title, description, price, currency_code, status, created_at, date_of_birth,
           country:countries(name),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )

      if (filter === 'PENDING') {
        query = query.eq('status', 'PENDING')
      }

      const { data } = await query

      setListings((data as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router, filter])

  const handleDecision = async (listingId: string, listingTitle: string, newStatus: 'ACTIVE' | 'REJECTED') => {
    setActionError('')

    let rejectionReason: string | null = null
    if (newStatus === 'REJECTED') {
      rejectionReason = window.prompt('Reason for rejecting this listing (shown to the breeder):')
      if (rejectionReason === null) return
    }

    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus, rejection_reason: rejectionReason })
      .eq('id', listingId)

    if (error) {
      setActionError(error.message)
      return
    }

    await logAudit(
      newStatus === 'ACTIVE' ? 'Approved listing' : 'Rejected listing',
      'listing',
      listingId,
      listingTitle || 'Untitled listing',
      rejectionReason ?? undefined
    )

    setListings((prev) => prev.filter((l) => l.id !== listingId))

    if (newStatus === 'ACTIVE') {
      fetch('/api/notify-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      }).catch(() => {})
    }
  }

  const handleDelete = async (listingId: string, listingTitle: string) => {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return

    setDeletingId(listingId)
    setActionError('')

    const { error } = await supabase.from('listings').delete().eq('id', listingId)

    if (error) {
      setActionError(error.message)
      setDeletingId(null)
      return
    }

    await logAudit('Deleted listing', 'listing', listingId, listingTitle || 'Untitled listing')

    setListings((prev) => prev.filter((l) => l.id !== listingId))
    setDeletingId(null)
  }

  if (loading) {
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

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    if (sortBy === 'age') {
      return ageInMonths(a.date_of_birth) - ageInMonths(b.date_of_birth)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">
            {filter === 'PENDING' ? `Pending Listings (${sortedListings.length})` : `All Listings (${sortedListings.length})`}
          </h1>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="age">Sort: Age (puppy first)</option>
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('PENDING')}
            className={`text-xs font-bold px-3 py-1.5 rounded ${
              filter === 'PENDING' ? 'bg-black text-white' : 'border'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`text-xs font-bold px-3 py-1.5 rounded ${
              filter === 'ALL' ? 'bg-black text-white' : 'border'
            }`}
          >
            All listings
          </button>
        </div>

        {actionError && <p className="text-red-600 text-sm mb-4">{actionError}</p>}

        {sortedListings.length === 0 && (
          <p className="text-gray-500">No listings to show.</p>
        )}

        <div className="space-y-4">
          {sortedListings.map((listing) => {
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold">{listing.title || 'Untitled listing'}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {listing.breeder?.kennel_name ?? 'Unknown kennel'} · {listing.country?.name ?? '—'}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {listing.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleDecision(listing.id, listing.title, 'ACTIVE')}
                          className="px-3 py-1 bg-black text-white text-sm rounded-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(listing.id, listing.title, 'REJECTED')}
                          className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded-md"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded-md"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={deletingId === listing.id}
                      className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded-md disabled:opacity-50"
                    >
                      {deletingId === listing.id ? 'Deleting...' : 'Delete'}
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
