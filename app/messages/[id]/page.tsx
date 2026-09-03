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
}

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [otherId, setOtherId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasBlockedOther, setHasBlockedOther] = useState(false)

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
        .select('id, buyer_id, breeder_id')
        .eq('id', conversationId)
        .single()

      if (convoError || !convo) {
        setError(`Conversation not found. Debug: ${convoError?.message ?? 'no data'}`)
        setLoading(false)
        return
      }

      setConversation(convo)

      const isBuyer = convo.buyer_id === user.id
      const otherUserId = isBuyer ? convo.breeder_id : convo.buyer_id
      setOtherId(otherUserId)

      if (isBuyer) {
        const { data: breederProfile } = await supabase
          .from('breeder_profiles')
          .select('kennel_name')
          .eq('id', convo.breeder_id)
          .single()
        setOtherName(breederProfile?.kennel_name || 'Breeder')
      } else {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', convo.buyer_id)
          .single()
        setOtherName(buyerProfile?.display_name || 'Buyer')
      }

      const { data: blockedByMe } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', otherUserId)
        .maybeSingle()
      setHasBlockedOther(!!blockedByMe)

      const { data: blockedMe } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', otherUserId)
        .eq('blocked_id', user.id)
        .maybeSingle()
      setIsBlocked(!!blockedMe)

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

  const handleToggleBlock = async () => {
    if (!userId || !otherId) return

    if (hasBlockedOther) {
      await supabase.from('blocked_users').delete().eq('blocker_id', userId).eq('blocked_id', otherId)
      setHasBlockedOther(false)
    } else {
      if (!confirm(`Block ${otherName}? They will no longer be able to message you.`)) return
      await supabase.from('blocked_users').insert({ blocker_id: userId, blocked_id: otherId })
      setHasBlockedOther(true)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-2xl mx-auto p-6 text-pd-gray">Loading...</div>
        </div>
      </>
    )
  }

  if (error || !conversation) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-2xl mx-auto p-6">
            <p className="text-red-600">{error || 'Conversation not found.'}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-2xl mx-auto p-6 flex flex-col" style={{ minHeight: '70vh' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-pd-black">{otherName}</h1>
            <button
              onClick={handleToggleBlock}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border bg-white ${
                hasBlockedOther
                  ? 'border-green-600 text-green-700 hover:bg-green-50'
                  : 'border-red-600 text-red-600 hover:bg-red-50'
              }`}
            >
              {hasBlockedOther ? 'Unblock' : 'Block'}
            </button>
          </div>

          {isBlocked && (
            <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
              This user has blocked you. You can't send new messages in this conversation.
            </p>
          )}

          {hasBlockedOther && (
            <p className="text-sm text-pd-gray bg-white border border-pd-black/10 rounded-md p-3 mb-3">
              You've blocked this user. Unblock them to send new messages.
            </p>
          )}

          <div className="flex-1 space-y-3 mb-4">
            {messages.map((m) => {
              const isMine = m.sender_id === userId
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      isMine ? 'bg-pd-black text-pd-gold' : 'bg-white text-pd-black border border-pd-black/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-pd-gold/60' : 'text-pd-gray'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          {!isBlocked && !hasBlockedOther && (
            <div className="flex gap-2 sticky bottom-4 bg-pd-cream pt-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="flex-1 border border-pd-black/15 rounded-md px-3 py-2 text-sm bg-white"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="bg-pd-black text-pd-gold px-4 rounded-md text-sm font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
