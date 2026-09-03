'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type BreederProfile = {
  id: string
  kennel_name: string
  about: string | null
  years_breeding: number | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  profile: { display_name: string | null } | null
}

type Listing = {
  id: string
  title: string
  price: number | null
  currency_code: string | null
  photos: { url: string; sort_order: number }[]
}

export default function BreederProfilePage() {
  const router = useRouter()
  const params = useParams()
  const breederId = params.id as string

  const [loading, setLoading] = useState(true)
  const [breeder, setBreeder] = useState<BreederProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data: breederData } = await supabase
        .from('breeder_profiles')
        .select(
          `id, kennel_name, about, years_breeding, website_url, instagram_url, facebook_url,
           profile:profiles(display_name)`
        )
        .eq('id', breederId)
        .single()

      setBreeder(breederData as unknown as BreederProfile)

      const { data: listingsData } = await supabase
        .from('listings')
        .select(`id, title, price, currency_code, photos:listing_photos(url, sort_order)`)
        .eq('breeder_id', breederId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      setListings((listingsData as unknown as Listing[]) ?? [])
      setLoading(false)
    }
    load()
  }, [breederId])

  const handleSendMessage = async () => {
    if (!userId) {
      router.push('/login')
      return
    }
    if (!messageText.trim()) return

    setSending(true)
    setError('')

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', userId)
      .eq('breeder_id', breederId)
      .is('listing_id', null)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({ buyer_id: userId, breeder_id: breederId })
        .select('id')
        .single()

      if (convoError || !newConvo) {
        setError(convoError?.message ?? 'Could not start conversation.')
        setSending(false)
        return
      }
      conversationId = newConvo.id
    }

    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: messageText.trim(),
    })

    if (msgError) {
      setError(msgError.message)
      setSending(false)
      return
    }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    setSending(false)
    setSent(true)
    setTimeout(() => router.push(`/messages/${conversationId}`), 800)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (!breeder) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6 text-gray-500">Breeder not found.</div>
      </>
    )
  }

  const isSelf = userId === breeder.id

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">{breeder.kennel_name || breeder.profile?.display_name}</h1>
        {breeder.years_breeding && (
          <p className="text-sm text-gray-500 mb-4">{breeder.years_breeding} years breeding</p>
        )}

        {breeder.about && <p className="text-gray-700 mb-4 whitespace-pre-wrap">{breeder.about}</p>}

        <div className="flex gap-3 text-sm mb-6">
          {breeder.website_url && (
            <a href={breeder.website_url} target="_blank" rel="noreferrer" className="underline text-blue-600">
              Website
            </a>
          )}
          {breeder.instagram_url && (
            <a href={breeder.instagram_url} target="_blank" rel="noreferrer" className="underline text-blue-600">
              Instagram
            </a>
          )}
          {breeder.facebook_url && (
            <a href={breeder.facebook_url} target="_blank" rel="noreferrer" className="underline text-blue-600">
              Facebook
            </a>
          )}
        </div>

        {!isSelf && (
          <div className="border rounded-md p-4 mb-8">
            <h2 className="font-bold mb-2">Message this breeder</h2>
            {sent ? (
              <p className="text-green-700 text-sm">Message sent! Redirecting...</p>
            ) : (
              <>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={3}
                  placeholder="Say hello..."
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                />
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </>
            )}
          </div>
        )}

        <h2 className="text-lg font-bold mb-3">Listings ({listings.length})</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {listings.map((listing) => {
            const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
            return (
              <Link key={listing.id} href={`/listing/${listing.id}`} className="border rounded-md overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  {photo ? (
                    <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-semibold truncate">{listing.title || 'Untitled'}</p>
                  <p className="text-xs text-gray-500">
                    {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
