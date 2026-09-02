'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Inquiry = {
  id: string
  listing_id: string
  sender_name: string
  sender_email: string
  sender_country: string | null
  message: string
  created_at: string
  read: boolean
  listing: { title: string } | null
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotLoggedIn(true)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('inquiries')
        .select('id, listing_id, sender_name, sender_email, sender_country, message, created_at, read, listing:listings(title)')
        .eq('breeder_id', user.id)
        .order('created_at', { ascending: false })

      setInquiries((data as unknown as Inquiry[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const markAsRead = async (id: string) => {
    await supabase.from('inquiries').update({ read: true }).eq('id', id)
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
  }

  if (notLoggedIn) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-gray-500">
            Please <Link href="/login" className="underline">sign in</Link> to view your inquiries.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Inquiries</h1>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && inquiries.length === 0 && (
          <p className="text-gray-500">You haven't received any messages yet.</p>
        )}

        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`border rounded-md p-4 ${inquiry.read ? '' : 'border-pd-gold bg-pd-gold/5'}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold">
                    {inquiry.sender_name}{' '}
                    {!inquiry.read && (
                      <span className="text-[10px] bg-pd-gold text-pd-black px-1.5 py-0.5 rounded font-bold ml-1">
                        NEW
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{inquiry.sender_email}</p>
                  {inquiry.sender_country && (
                    <p className="text-sm text-gray-500">{inquiry.sender_country}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Re:{' '}
                <Link href={`/listing/${inquiry.listing_id}`} className="underline">
                  {inquiry.listing?.title || 'Listing'}
                </Link>
              </p>

              <p className="text-sm mt-3 whitespace-pre-wrap">{inquiry.message}</p>

              {!inquiry.read && (
                <button
                  onClick={() => markAsRead(inquiry.id)}
                  className="mt-3 text-xs font-bold text-pd-black border px-3 py-1.5 hover:bg-gray-50"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
