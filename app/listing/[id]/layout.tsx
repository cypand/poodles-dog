import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client used only to build link previews (WhatsApp, Facebook, etc.)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Always fetch fresh data so edited titles/photos show up in previews
      fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: 'no-store' }),
    },
  }
)

type PreviewListing = {
  title: string | null
  description: string | null
  price: number | null
  currency_code: string | null
  photos: { url: string; sort_order: number }[] | null
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const fallback: Metadata = {
    title: { absolute: 'Poodle listing | Poodles.dog' },
    description: 'Find your poodle on Poodles.dog, connecting you with breeders all around the world.',
  }

  try {
    const { data } = await supabase
      .from('listings')
      .select('title, description, price, currency_code, photos:listing_photos(url, sort_order)')
      .eq('id', params.id)
      .maybeSingle()

    if (!data) return fallback

    const listing = data as unknown as PreviewListing
    const title = listing.title?.trim() || 'Poodle listing'
    const priceText = listing.price ? `${listing.price} ${listing.currency_code ?? ''}`.trim() : 'Price on request'
    const descSource = listing.description?.trim() || 'Find your poodle on Poodles.dog.'
    const shortDesc = descSource.length > 150 ? `${descSource.slice(0, 147)}...` : descSource
    const description = `${priceText} · ${shortDesc}`

    const firstPhoto = [...(listing.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]
    const url = `https://www.poodles.dog/listing/${params.id}`

    return {
      title: { absolute: `${title} | Poodles.dog` },
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Poodles.dog',
        type: 'website',
        ...(firstPhoto ? { images: [{ url: firstPhoto.url, alt: title }] } : {}),
      },
      twitter: {
        card: firstPhoto ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(firstPhoto ? { images: [firstPhoto.url] } : {}),
      },
    }
  } catch {
    return fallback
  }
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
