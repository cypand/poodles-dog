'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Listing = {
  id: string
  title: string
  price: number | null
  currency_code: string | null
  country: { name: string } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

export default function FavoritesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: favData } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id)

      const listingIds = (favData ?? []).map((f) => f.listing_id)

      if (listingIds.length === 0) {
        setListings([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('listings')
        .select(
          `id, title, price, currency_code,
           country:countries(name),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .in('id', listingIds)

      setListings((data as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const removeFavorite = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listingId)
    setListings((prev) => prev.filter((l) => l.id !== listingId))
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

        {listings.length === 0 && (
          <p className="text-gray-500">You haven't saved any listings yet.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
            return (
              <div key={listing.id} className="border rounded-md overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  {photo ? (
                    <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="font-semibold truncate">{listing.title || 'Untitled listing'}</h2>
                  <p className="text-sm text-gray-500">
                    {listing.breeder?.kennel_name ?? 'Unknown kennel'} · {listing.country?.name ?? '—'}
                  </p>
                  <p className="mt-2 font-bold">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                  <button
                    onClick={() => removeFavorite(listing.id)}
                    className="mt-2 text-xs text-red-600 underline"
                  >
                    Remove from favorites
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
