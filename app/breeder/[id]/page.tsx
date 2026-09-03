'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
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
  verification_status: string
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
  const [isBanned, setIsBanned] = useState(false)
  const [banProcessing, setBanProcessing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data: breederData } = await supabase
        .from('breeder_profiles')
        .select(
          `id, kennel_name, about, years_breeding, website_url, instagram_url, facebook_url, verification_status,
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

      if (user) {
        const { data: blocked } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', breederId)
          .maybeSingle()
        setIsBanned(!!blocked)
      }

      setLoading(false)
    }
    load()
  }, [breederId])

  const handleToggleBan = async () => {
    if (!userId) {
      router.push('/login')
      return
    }

    setBanProcessing(true)

    if (isBanned) {
      await supabase.from('blocked_users').delete().eq('blocker_id', userId).eq('blocked_id', breederId)
      setIsBanned(false)
    } else {
      if (!confirm(`Ban ${breeder?.kennel_name ?? 'this breeder'}? They will no longer be able to message you.`)) {
        setBanProcessing(false)
        return
      }
      await supabase.from('blocked_users').insert({ blocker_id: userId, blocked_id: breederId })
      setIsBanned(true)
    }

    setBanProcessing(false)
  }

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
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-3xl mx-auto p-6 text-pd-gray">Loading...</div>
        </div>
      </>
    )
  }

  if (!breeder) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-3xl mx-auto p-6 text-pd-gray">Breeder not found.</div>
        </div>
      </>
    )
  }

  const isSelf = userId === breeder.id
  const isVerified = breeder.verification_status === 'verified'

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-6 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{breeder.kennel_name || breeder.profile?.display_name}</h1>
              {isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold bg-pd-gold text-pd-black px-2 py-1 rounded">
                  <BadgeCheck size={14} /> Verified Breeder
                </span>
              )}
            </div>
            {breeder.years_breeding && (
              <p className="text-sm text-white/60 mt-1">{breeder.years_breeding} years breeding</p>
            )}
          </div>

          {breeder.about && (
            <p className="text-pd-black/80 mb-4 whitespace-pre-wrap bg-white border border-pd-black/10 rounded-md p-4">
              {breeder.about}
            </p>
          )}

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
            <div className="border border-pd-black/10 rounded-md p-4 mb-4 bg-white">
              <h2 className="font-bold mb-2 text-pd-black">Message this breeder</h2>
              {sent ? (
                <p className="text-green-700 text-sm">Message sent! Redirecting...</p>
              ) : (
                <>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={3}
                    placeholder="Say hello..."
                    className="w-full border border-pd-black/15 rounded-md px-3 py-2 text-sm mb-2"
                  />
                  {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className="bg-pd-black text-pd-gold px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </>
              )}
            </div>
          )}

          {!isSelf && (
            <div className="mb-8">
              <button
                onClick={handleToggleBan}
                disabled={banProcessing}
                className={`text-sm font-bold px-4 py-2 rounded-md border disabled:opacity-50 ${
                  isBanned
                    ? 'border-green-600 text-green-700 hover:bg-green-50 bg-white'
                    : 'border-red-600 text-red-600 hover:bg-red-50 bg-white'
                }`}
              >
                {banProcessing ? 'Updating...' : isBanned ? 'Unban user' : 'Ban user'}
              </button>
              {isBanned && (
                <p className="text-xs text-pd-gray mt-2">This breeder cannot message you.</p>
              )}
            </div>
          )}

          <h2 className="text-lg font-bold mb-3 text-pd-black">Listings ({listings.length})</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((listing) => {
              const photo = listing.photos?.sort((a, b) => a.sort_order - b.sort_order)[0]
              return (
                <Link key={listing.id} href={`/listing/${listing.id}`} className="bg-white border border-pd-black/10 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-pd-cream">
                    {photo ? (
                      <img src={photo.url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pd-gray text-xs">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-semibold truncate text-pd-black">{listing.title || 'Untitled'}</p>
                    <p className="text-xs text-pd-gold font-bold">
                      {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
