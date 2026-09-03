'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Conversation = {
  id: string
  buyer_id: string
  breeder_id: string
  last_message_at: string
  buyer: { display_name: string | null } | null
  breeder: { kennel_name: string | null } | null
  listing: { title: string } | null
  unread_count: number
}

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from('conversations')
        .select(
          `id, buyer_id, breeder_id, last_message_at,
           buyer:profiles!conversations_buyer_id_fkey(display_name),
           breeder:breeder_profiles!conversations_breeder_id_fkey(kennel_name),
           listing:listings(title)`
        )
        .or(`buyer_id.eq.${user.id},breeder_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      const convos = (data as unknown as Conversation[]) ?? []

      const withCounts = await Promise.all(
        convos.map(async (c) => {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', c.id)
            .eq('read', false)
            .neq('sender_id', user.id)
          return { ...c, unread_count: count ?? 0 }
        })
      )

      setConversations(withCounts)
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
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === userId
            const otherName = isBuyer
              ? c.breeder?.kennel_name ?? 'Breeder'
              : c.buyer?.display_name ?? 'Buyer'
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="block border rounded-md p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{otherName}</p>
                    {c.listing?.title && (
                      <p className="text-sm text-gray-500">Re: {c.listing.title}</p>
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
            )
          })}
        </div>
      </div>
    </>
  )
}
