'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency_code: string | null
  country_code: string | null
  sell_scope: string[] | null
  sex: string | null
  date_of_birth: string | null
  created_at: string
  size: { code: string; label: string } | null
  colour: { code: string; label: string } | null
  country: { code: string; name: string; continent: string | null } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

type SortOption = 'newest' | 'price_asc' | 'price_desc'

function SearchResults() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [userId, setUserId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const sizeFilter = searchParams.get('size')?.split(',').filter(Boolean) ?? []
  const sexFilter = searchParams.get('sex')?.split(',').filter(Boolean) ?? []
  const colourFilter = searchParams.get('colour')?.split(',').filter(Boolean) ?? []
  const locationFilter = searchParams.get('location')?.split(',').filter(Boolean) ?? []

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data } = await supabase
        .from('listings')
        .select(
          `id, title, description, price, currency_code, country_code, sell_scope, sex, date_of_birth, created_at,
           size:poodle_sizes(code, label),
           colour:poodle_colours(code, label),
           country:countries(code, name, continent),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      setListings((data as unknown as Listing[]) ?? [])

      if (user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id)
        setFavoriteIds(new Set((favData ?? []).map((f) => f.listing_id)))
      }

      setLoading(false)
    }
    load()
  }, [])

  const toggleFavorite = async (listingId: string) => {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    const isFavorited = favoriteIds.has(listingId)

    if (isFavorited) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId)
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId })
      setFavoriteIds((prev) => new Set(prev).add(listingId))
    }
  }

  const matchesLocation = (listing: Listing): boolean => {
    if (locationFilter.length === 0) return true
    if (!listing.country) return false

    const scope = listing.sell_scope ?? []

    return locationFilter.some((loc) => {
      if (loc === listing.country?.code) return true
      if (loc === 'WORLDWIDE') return scope.includes('WORLDWIDE')
      if (loc === listing.country?.continent) {
        return scope.includes(loc) || scope.includes('WORLDWIDE')
      }
      return false
    })
  }

  const filteredListings = listings.filter((l) => {
    if (sizeFilter.length > 0 && !sizeFilter.includes(l.size?.code ?? '')) return false
    if (sexFilter.length > 0 && !sexFilter.includes(l.sex ?? '')) return false
    if (colourFilter.length > 0 && !colourFilter.includes(l.colour?.code ?? '')) return false
    if (!matchesLocation(l)) return false
    return true
  })

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return (a.price ?? Infinity) - (b.price ?? Infinity)
    }
    if (sortBy === 'price_desc') {
      return (b.price ?? -Infinity) - (a.price ?? -Infinity)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          {sortedListings.length} {sortedListings.length === 1 ? 'listing' : 'listings'} found
        </h1>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && sortedListings.length === 0 && (
        <p className="text-gray-500">No listings match your search yet.</p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sortedListings.map((listing) => {
          const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
          const isFavorited = favoriteIds.has(listing.id)
          return (
            <div key={listing.id} className="border rounded-md overflow-hidden relative">
              <button
                onClick={() => toggleFavorite(listing.id)}
                aria-label="Toggle favorite"
                className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-2 shadow"
              >
                <Heart
                  size={18}
                  fill={isFavorited ? '#c9a227' : 'none'}
                  color={isFavorited ? '#c9a227' : '#000'}
                />
              </button>
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
                  {listing.breeder?.kennel_name ?? 'Unknown kennel'}
                </p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>{listing.size?.label ?? '—'}</span>
                  <span>{listing.country?.name ?? '—'}</span>
                </div>
                <p className="mt-2 font-bold">
                  {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="max-w-5xl mx-auto p-6 text-gray-500">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </>
  )
}
