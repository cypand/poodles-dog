'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
}

type ConversationInfo = {
  id: string
  buyer_id: string
  breeder_id: string
  buyer: { display_name: string | null } | null
  breeder: { kennel_name: string | null } | null
}

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: convo, error: convoError } = await supabase
        .from('conversations')
        .select(
          `id, buyer_id, breeder_id,
           buyer:profiles!conversations_buyer_id_fkey(display_name),
           breeder:breeder_profiles!conversations_breeder_id_fkey(kennel_name)`
        )
        .eq('id', conversationId)
        .single()

      if (convoError || !convo) {
        setError('Conversation not found or you do not have access.')
        setLoading(false)
        return
      }

      setConversation(convo as unknown as ConversationInfo)

      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      setMessages(msgs ?? [])
      setLoading(false)

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
    }
    load()
  }, [conversationId, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return

    setSending(true)
    setError('')

    const { data: inserted, error: insertError } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, body: newMessage.trim() })
      .select('id, sender_id, body, created_at')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSending(false)
      return
    }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    setMessages((prev) => [...prev, inserted])
    setNewMessage('')
    setSending(false)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (error || !conversation) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto p-6">
          <p className="text-red-600">{error || 'Conversation not found.'}</p>
        </div>
      </>
    )
  }

  const isBuyer = conversation.buyer_id === userId
  const otherName = isBuyer
    ? conversation.breeder?.kennel_name ?? 'Breeder'
    : conversation.buyer?.display_name ?? 'Buyer'

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto p-6 flex flex-col" style={{ minHeight: '70vh' }}>
        <h1 className="text-xl font-bold mb-4">{otherName}</h1>

        <div className="flex-1 space-y-3 mb-4">
          {messages.map((m) => {
            const isMine = m.sender_id === userId
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <div className="flex gap-2 sticky bottom-4 bg-white pt-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-black text-white px-4 rounded-md text-sm font-bold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
