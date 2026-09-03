'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  has_pedigree: boolean | null
  registry_id: number | null
  size: { code: string; label: string } | null
  colour: { code: string; label: string } | null
  country: { code: string; name: string; continent: string | null } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

type Registry = { id: number; code: string; name: string }

type SortOption = 'newest' | 'price_asc' | 'price_desc'

const PAGE_SIZE = 20

const LOADING_MESSAGES = [
  'Fetching the good boys and girls...',
  'Sniffing out the best matches...',
  'Herding the poodles into a list...',
  'Chasing down the latest listings...',
]

const EMPTY_MESSAGES = [
  "No matches yet — even the best noses need a moment to sniff these out.",
  "Nothing here right now. Try widening your search — good dogs are worth the extra sniffing.",
]

function SearchResults() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [registries, setRegistries] = useState<Registry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [banner, setBanner] = useState<string | null>(null)
  const [loadingMessage] = useState(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])
  const [emptyMessage] = useState(EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)])

  const sizeFilter = searchParams.get('size')?.split(',').filter(Boolean) ?? []
  const sexFilter = searchParams.get('sex')?.split(',').filter(Boolean) ?? []
  const colourFilter = searchParams.get('colour')?.split(',').filter(Boolean) ?? []
  const locationFilter = searchParams.get('location')?.split(',').filter(Boolean) ?? []
  const registryFilter = searchParams.get('registry')?.split(',').filter(Boolean) ?? []
  const priceMinFilter = searchParams.get('price_min')
  const priceMaxFilter = searchParams.get('price_max')
  const pedigreeFilter = searchParams.get('pedigree')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const justPublished = sessionStorage.getItem('poodles-just-published')
      if (justPublished) {
        setBanner("🐾 Off you go — one step closer to finding their forever home!")
        sessionStorage.removeItem('poodles-just-published')
        setTimeout(() => setBanner(null), 6000)
      }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data } = await supabase
        .from('listings')
        .select(
          `id, title, description, price, currency_code, country_code, sell_scope, sex, date_of_birth, created_at,
           has_pedigree, registry_id,
           size:poodle_sizes(code, label),
           colour:poodle_colours(code, label),
           country:countries(code, name, continent),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      setListings((data as unknown as Listing[]) ?? [])

      const { data: registryData } = await supabase.from('registries').select('id, code, name')
      setRegistries(registryData ?? [])

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams, sortBy])

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

  const matchesRegistry = (listing: Listing): boolean => {
    if (registryFilter.length === 0) return true
    if (!listing.registry_id) return false
    const registry = registries.find((r) => r.id === listing.registry_id)
    if (!registry) return false
    return registryFilter.includes(registry.code)
  }

  const matchesPrice = (listing: Listing): boolean => {
    if (!priceMinFilter && !priceMaxFilter) return true
    if (listing.price === null) return false
    if (priceMinFilter && listing.price < Number(priceMinFilter)) return false
    if (priceMaxFilter && listing.price > Number(priceMaxFilter)) return false
    return true
  }

  const matchesPedigree = (listing: Listing): boolean => {
    if (!pedigreeFilter) return true
    if (pedigreeFilter === 'yes') return listing.has_pedigree === true
    if (pedigreeFilter === 'no') return listing.has_pedigree === false
    return true
  }

  const filteredListings = listings.filter((l) => {
    if (sizeFilter.length > 0 && !sizeFilter.includes(l.size?.code ?? '')) return false
    if (sexFilter.length > 0 && !sexFilter.includes(l.sex ?? '')) return false
    if (colourFilter.length > 0 && !colourFilter.includes(l.colour?.code ?? '')) return false
    if (!matchesLocation(l)) return false
    if (!matchesRegistry(l)) return false
    if (!matchesPrice(l)) return false
    if (!matchesPedigree(l)) return false
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

  const totalPages = Math.max(1, Math.ceil(sortedListings.length / PAGE_SIZE))
  const clampedPage = Math.min(currentPage, totalPages)
  const paginatedListings = sortedListings.slice(
    (clampedPage - 1) * PAGE_SIZE,
    clampedPage * PAGE_SIZE
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      {banner && (
        <div className="bg-pd-gold/10 border border-pd-gold text-pd-black rounded-md px-4 py-3 mb-4 text-sm font-medium">
          {banner}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-pd-black">
          {sortedListings.length} {sortedListings.length === 1 ? 'listing' : 'listings'} found
        </h1>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border border-pd-black/15 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <p className="text-pd-gray">{loadingMessage}</p>}

      {!loading && sortedListings.length === 0 && (
        <p className="text-pd-gray">{emptyMessage}</p>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedListings.map((listing) => {
          const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
          const isFavorited = favoriteIds.has(listing.id)
          return (
            <div key={listing.id} className="bg-white border border-pd-black/10 rounded-md overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
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
              <Link href={`/listing/${listing.id}`}>
                <div className="aspect-square bg-pd-cream">
                  {photo ? (
                    <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pd-gray text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="font-semibold text-pd-black truncate">{listing.title || 'Untitled listing'}</h2>
                  <p className="text-sm text-pd-gray">
                    {listing.breeder?.kennel_name ?? 'Unknown kennel'}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-sm text-pd-gray">
                    <span>{listing.size?.label ?? '—'}</span>
                    <span>{listing.country?.name ?? '—'}</span>
                  </div>
                  <p className="mt-2 font-bold text-pd-gold">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
            className="px-3 py-2 border border-pd-black/15 rounded-md text-sm disabled:opacity-30 bg-white"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-9 h-9 rounded-md text-sm font-semibold ${
                pageNum === clampedPage
                  ? 'bg-pd-black text-pd-gold'
                  : 'border border-pd-black/15 bg-white text-pd-black hover:bg-pd-cream'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
            className="px-3 py-2 border border-pd-black/15 rounded-md text-sm disabled:opacity-30 bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="max-w-5xl mx-auto p-6 text-pd-gray">Fetching the good boys and girls...</div>}>
        <SearchResults />
      </Suspense>
    </>
  )
}
