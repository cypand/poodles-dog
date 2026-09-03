'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Breeder = {
  id: string
  kennel_name: string
  about: string | null
  country_code: string | null
  listing_count: number
}

export default function BreedersPage() {
  const [loading, setLoading] = useState(true)
  const [breeders, setBreeders] = useState<Breeder[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: breederProfiles } = await supabase
        .from('breeder_profiles')
        .select('id, kennel_name, about')
        .order('kennel_name')

      const { data: listingCounts } = await supabase
        .from('listings')
        .select('breeder_id')
        .eq('status', 'ACTIVE')

      const countMap: Record<string, number> = {}
      for (const l of listingCounts ?? []) {
        if (l.breeder_id) {
          countMap[l.breeder_id] = (countMap[l.breeder_id] ?? 0) + 1
        }
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, country_code')

      const countryMap: Record<string, string | null> = {}
      for (const p of profiles ?? []) {
        countryMap[p.id] = p.country_code
      }

      const merged = (breederProfiles ?? []).map((b) => ({
        ...b,
        country_code: countryMap[b.id] ?? null,
        listing_count: countMap[b.id] ?? 0,
      }))

      setBreeders(merged)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Breeders</h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && breeders.length === 0 && (
          <p className="text-gray-500">No breeders yet.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {breeders.map((b) => (
            <Link
              key={b.id}
              href={`/breeder/${b.id}`}
              className="border rounded-md p-4 hover:bg-gray-50"
            >
              <p className="font-semibold">{b.kennel_name || 'Unnamed kennel'}</p>
              {b.about && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.about}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {b.listing_count} active {b.listing_count === 1 ? 'listing' : 'listings'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
