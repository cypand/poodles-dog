'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type ConversationRow = {
  id: string
  buyer_id: string
  breeder_id: string
  listing_id: string | null
  last_message_at: string
}

type DisplayConversation = ConversationRow & {
  otherName: string
  listingTitle: string | null
  unread_count: number
}

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<DisplayConversation[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('conversations')
        .select('id, buyer_id, breeder_id, listing_id, last_message_at')
        .or(`buyer_id.eq.${user.id},breeder_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      const convos = (data as ConversationRow[]) ?? []

      const enriched = await Promise.all(
        convos.map(async (c) => {
          const isBuyer = c.buyer_id === user.id
          let otherName = 'Unknown'

          if (isBuyer) {
            const { data: breederProfile } = await supabase
              .from('breeder_profiles')
              .select('kennel_name')
              .eq('id', c.breeder_id)
              .single()
            otherName = breederProfile?.kennel_name || 'Breeder'
          } else {
            const { data: buyerProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', c.buyer_id)
              .single()
            otherName = buyerProfile?.display_name || 'Buyer'
          }

          let listingTitle: string | null = null
          if (c.listing_id) {
            const { data: listing } = await supabase
              .from('listings')
              .select('title')
              .eq('id', c.listing_id)
              .single()
            listingTitle = listing?.title ?? null
          }

          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', c.id)
            .eq('read', false)
            .neq('sender_id', user.id)

          return { ...c, otherName, listingTitle, unread_count: count ?? 0 }
        })
      )

      setConversations(enriched)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {conversations.length === 0 && (
          <p className="text-gray-500">No conversations yet.</p>
        )}

        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="block border rounded-md p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.otherName}</p>
                  {c.listingTitle && (
                    <p className="text-sm text-gray-500">Re: {c.listingTitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {c.unread_count > 0 && (
                    <span className="bg-pd-gold text-pd-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {c.unread_count}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(c.last_message_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
