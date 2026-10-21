'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  date_of_birth: string | null
  size: { label: string } | null
  country: { name: string } | null
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
}

function ageFromDob(dob: string | null): string {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 1) return 'Under 1 month'
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} old`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'year' : 'years'} old`
}

export default function RecentListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('listings')
        .select(
          `id, title, date_of_birth,
           size:poodle_sizes(label),
           country:countries(name),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(3)

      setListings((data as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (!loading && listings.length === 0) return null

  return (
    <section className="bg-white py-14">
      <div className="container-pd">
        <h2 className="text-center font-bold text-xl mb-8">
          RECENTLY LISTED <span className="text-pd-gold">POODLES</span>
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-pd-cream animate-pulse aspect-square rounded-md" />
              ))
            : listings.map((listing) => {
                const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
                return (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="bg-white border border-pd-black/10 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-pd-cream">
                      {photo ? (
                        <img
                          src={photo.url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pd-gray text-sm">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-pd-black truncate">
                        {listing.title || 'Untitled listing'}
                      </h3>
                      <p className="text-sm text-pd-gray">
                        {listing.breeder?.kennel_name ?? 'Unknown kennel'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm text-pd-gray">
                        <span>{listing.size?.label ?? '—'}</span>
                        <span>{listing.country?.name ?? '—'}</span>
                      </div>
                      <p className="mt-1 text-xs text-pd-gray">
                        {ageFromDob(listing.date_of_birth)}
                      </p>
                    </div>
                  </Link>
                )
              })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/search"
            className="inline-block border border-pd-black/20 px-6 py-3 text-sm font-bold hover:border-pd-gold hover:text-pd-gold"
          >
            SEE ALL LISTINGS
          </Link>
        </div>
      </div>
    </section>
  )
}
