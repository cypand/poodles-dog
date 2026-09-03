'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Flag, BadgeCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type HealthResult = {
  test_type: { label: string } | null
  result_value: string
}

type ParentDog = {
  id: string
  registered_name: string | null
  colour: { label: string } | null
  size: { label: string } | null
  health_results: HealthResult[]
}

type ListingDetail = {
  id: string
  breeder_id: string
  title: string
  description: string | null
  price: number | null
  currency_code: string | null
  country_code: string | null
  city: string | null
  sell_scope: string[] | null
  sex: string | null
  date_of_birth: string | null
  ready_from: string | null
  has_pedigree: boolean | null
  kennel_registration_name: string | null
  registration_number: string | null
  microchipped: boolean | null
  vaccinated: boolean | null
  created_at: string
  size: { label: string } | null
  colour: { label: string } | null
  country: { name: string } | null
  registry: { name: string } | null
  breeder: { kennel_name: string; verification_status: string } | null
  photos: { url: string; sort_order: number }[]
  sire_id: string | null
  dam_id: string | null
}

const REPORT_REASONS = [
  'Scam / fraudulent listing',
  'Animal welfare concern',
  'Fake or misleading photos',
  'Inappropriate content',
  'Other',
]

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params?.id as string

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [sire, setSire] = useState<ParentDog | null>(null)
  const [dam, setDam] = useState<ParentDog | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [canEdit, setCanEdit] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportEmail, setReportEmail] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    const loadParentDog = async (dogId: string): Promise<ParentDog | null> => {
      const { data: dog } = await supabase
        .from('dogs')
        .select('id, registered_name, colour:poodle_colours(label), size:poodle_sizes(label)')
        .eq('id', dogId)
        .single()

      if (!dog) return null

      const { data: results } = await supabase
        .from('dog_health_results')
        .select('result_value, test_type:health_test_types(label)')
        .eq('dog_id', dogId)

      return { ...(dog as unknown as ParentDog), health_results: (results as unknown as HealthResult[]) ?? [] }
    }

    const load = async () => {
      if (!listingId) return
      setLoading(true)

      const { data } = await supabase
        .from('listings')
        .select(
          `id, breeder_id, title, description, price, currency_code, country_code, city, sell_scope,
           sex, date_of_birth, ready_from, has_pedigree, kennel_registration_name, registration_number,
           microchipped, vaccinated, created_at, sire_id, dam_id,
           size:poodle_sizes(label),
           colour:poodle_colours(label),
           country:countries(name),
           registry:registries(name),
           breeder:breeder_profiles(kennel_name, verification_status),
           photos:listing_photos(url, sort_order)`
        )
        .eq('id', listingId)
        .single()

      const listingData = data as unknown as ListingDetail
      setListing(listingData ?? null)
      setLoading(false)

      if (listingData?.sire_id) {
        setSire(await loadParentDog(listingData.sire_id))
      }
      if (listingData?.dam_id) {
        setDam(await loadParentDog(listingData.dam_id))
      }

      supabase.rpc('increment_listing_view', { listing_id_input: listingId }).then(() => {})

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        if (data) {
          const isOwner = (data as unknown as ListingDetail).breeder_id === user.id
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
          setCanEdit(isOwner || profile?.role === 'admin')
        }
      }
    }
    load()
  }, [listingId])

  const handleSendMessage = async () => {
    if (!listing) return
    setSendError('')

    if (!userId) {
      router.push('/login')
      return
    }

    if (!message.trim()) {
      setSendError('Please write a message.')
      return
    }

    setSending(true)

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', userId)
      .eq('breeder_id', listing.breeder_id)
      .eq('listing_id', listing.id)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({ buyer_id: userId, breeder_id: listing.breeder_id, listing_id: listing.id })
        .select('id')
        .single()

      if (convoError || !newConvo) {
        setSendError(convoError?.message ?? 'Could not start conversation.')
        setSending(false)
        return
      }
      conversationId = newConvo.id
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: message.trim(),
    })

    if (error) {
      setSendError('Something went wrong sending your message. Please try again.')
      setSending(false)
      return
    }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    setSent(true)
    setSending(false)
    setTimeout(() => router.push(`/messages/${conversationId}`), 800)
  }

  const handleSubmitReport = async () => {
    if (!listing) return
    setReportError('')

    if (!reportReason) {
      setReportError('Please select a reason.')
      return
    }

    setReportSending(true)

    const { error } = await supabase.from('reports').insert({
      listing_id: listing.id,
      reporter_email: reportEmail || null,
      reason: reportReason,
      details: reportDetails || null,
      status: 'PENDING',
    })

    if (error) {
      setReportError('Something went wrong submitting your report. Please try again.')
      setReportSending(false)
      return
    }

    setReportSent(true)
    setReportSending(false)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto p-6 text-gray-500">Sniffing out the details...</div>
      </>
    )
  }

  if (!listing) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto p-6 text-gray-500">Listing not found.</div>
      </>
    )
  }

  const sortedPhotos = [...(listing.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const isOwnListing = userId === listing.breeder_id
  const isVerified = listing.breeder?.verification_status === 'verified'

  const renderParentSection = (title: string, dog: ParentDog | null) => {
    if (!dog) return null
    return (
      <div className="border rounded-md p-3 mb-3">
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-xs text-gray-500 mb-2">
          {dog.colour?.label ?? '—'} · {dog.size?.label ?? '—'}
        </p>
        {dog.health_results.length > 0 ? (
          <ul className="text-xs text-gray-700 space-y-0.5">
            {dog.health_results.map((r, i) => (
              <li key={i}>
                {r.test_type?.label ?? 'Test'}: <span className="font-medium">{r.result_value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400">No health test results recorded.</p>
        )}
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3">
            {sortedPhotos[activePhoto] ? (
              <img
                src={sortedPhotos[activePhoto].url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No photo
              </div>
            )}
          </div>

          {sortedPhotos.length > 1 && (
            <div className="flex gap-2 mb-6">
              {sortedPhotos.map((p, i) => (
                <button
                  key={p.url}
                  onClick={() => setActivePhoto(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    i === activePhoto ? 'border-pd-gold' : 'border-transparent'
                  }`}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold mb-1">{listing.title || 'Untitled listing'}</h1>
            {canEdit && (
              <a
                href={`/listing/${listing.id}/edit`}
                className="flex-shrink-0 text-xs font-bold text-blue-600 border border-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-50"
              >
                Edit
              </a>
            )}
          </div>
          <a href={`/breeder/${listing.breeder_id}`} className="text-gray-500 mb-4 hover:underline inline-flex items-center gap-1">
            {listing.breeder?.kennel_name ?? 'Unknown kennel'}
            {isVerified && <BadgeCheck size={16} className="text-green-600" />}
          </a>

          <p className="text-2xl font-bold text-pd-black mb-6">
            {listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'}
          </p>

          <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
            <div>
              <span className="text-gray-500 block">Sex</span>
              <span className="font-medium">{listing.sex ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Size</span>
              <span className="font-medium">{listing.size?.label ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Colour</span>
              <span className="font-medium">{listing.colour?.label ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Date of birth</span>
              <span className="font-medium">{listing.date_of_birth ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Ready from</span>
              <span className="font-medium">{listing.ready_from ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Location</span>
              <span className="font-medium">
                {listing.city ? `${listing.city}, ` : ''}
                {listing.country?.name ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Pedigree</span>
              <span className="font-medium">{listing.has_pedigree ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Registry</span>
              <span className="font-medium">{listing.registry?.name ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Microchipped</span>
              <span className="font-medium">{listing.microchipped ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Vaccinated</span>
              <span className="font-medium">{listing.vaccinated ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {listing.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {(sire || dam) && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Parent Health Tests</h2>
              {renderParentSection('Sire (father)', sire)}
              {renderParentSection('Dam (mother)', dam)}
            </div>
          )}
        </div>

        <div>
          {!isOwnListing && (
            <div className="border rounded-md p-5 sticky top-6">
              <h2 className="font-bold text-lg mb-4">Message the breeder</h2>

              {sent ? (
                <p className="text-green-700 text-sm">Message sent! Redirecting to your conversation...</p>
              ) : !userId ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Sign in to message this breeder directly.
                  </p>
                  <a
                    href="/login"
                    className="inline-block bg-pd-black text-white font-bold text-sm py-3 px-6"
                  >
                    Sign in
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="I'm interested in this listing, could you tell me more about..."
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

                  {sendError && <p className="text-red-600 text-sm">{sendError}</p>}

                  <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="w-full bg-pd-black text-white font-bold text-sm py-3 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            {!showReportForm ? (
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1.5 text-gray-500 text-xs font-medium hover:text-red-600"
              >
                <Flag size={13} /> Report this listing
              </button>
            ) : (
              <div className="border rounded-md p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                  <Flag size={14} /> Report this listing
                </h3>

                {reportSent ? (
                  <p className="text-green-700 text-sm">
                    Thanks, your report has been submitted. Our team will review it.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Reason</label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Select a reason</option>
                        {REPORT_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Details (optional)
                      </label>
                      <textarea
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Your email (optional)
                      </label>
                      <input
                        type="email"
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>

                    {reportError && <p className="text-red-600 text-sm">{reportError}</p>}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitReport}
                        disabled={reportSending}
                        className="flex-1 bg-red-600 text-white font-bold text-sm py-2 disabled:opacity-50"
                      >
                        {reportSending ? 'Submitting...' : 'Submit report'}
                      </button>
                      <button
                        onClick={() => setShowReportForm(false)}
                        className="px-4 py-2 border text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
