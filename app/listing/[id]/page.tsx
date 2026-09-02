'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Flag } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

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
  breeder: { kennel_name: string } | null
  photos: { url: string; sort_order: number }[]
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
  const listingId = params?.id as string

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderCountry, setSenderCountry] = useState('')
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
    const load = async () => {
      if (!listingId) return
      setLoading(true)

      const { data } = await supabase
        .from('listings')
        .select(
          `id, breeder_id, title, description, price, currency_code, country_code, city, sell_scope,
           sex, date_of_birth, ready_from, has_pedigree, kennel_registration_name, registration_number,
           microchipped, vaccinated, created_at,
           size:poodle_sizes(label),
           colour:poodle_colours(label),
           country:countries(name),
           registry:registries(name),
           breeder:breeder_profiles(kennel_name),
           photos:listing_photos(url, sort_order)`
        )
        .eq('id', listingId)
        .single()

      setListing((data as unknown as ListingDetail) ?? null)
      setLoading(false)
    }
    load()
  }, [listingId])

  const handleSendInquiry = async () => {
    if (!listing) return
    setSendError('')

    if (!senderName || !senderEmail || !message) {
      setSendError('Please fill in your name, email, and a message.')
      return
    }

    setSending(true)

    const { error } = await supabase.from('inquiries').insert({
      listing_id: listing.id,
      breeder_id: listing.breeder_id,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_country: senderCountry || null,
      message,
    })

    if (error) {
      setSendError('Something went wrong sending your message. Please try again.')
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
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
        <div className="max-w-5xl mx-auto p-6 text-gray-500">Loading...</div>
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

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
        {/* Left: photos + details */}
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

          <h1 className="text-2xl font-bold mb-1">{listing.title || 'Untitled listing'}</h1>
          <p className="text-gray-500 mb-4">{listing.breeder?.kennel_name ?? 'Unknown kennel'}</p>

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
        </div>

        {/* Right: contact breeder form */}
        <div>
          <div className="border rounded-md p-5 sticky top-6">
            <h2 className="font-bold text-lg mb-4">Contact the breeder</h2>

            {sent ? (
              <p className="text-green-700 text-sm">
                Your message has been sent to the breeder. They will contact you directly at the email
                you provided.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Your name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your country (optional)</label>
                  <input
                    type="text"
                    value={senderCountry}
                    onChange={(e) => setSenderCountry(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="I'm interested in this listing, could you tell me more about..."
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                {sendError && <p className="text-red-600 text-sm">{sendError}</p>}

                <button
                  onClick={handleSendInquiry}
                  disabled={sending}
                  className="w-full bg-pd-black text-white font-bold text-sm py-3 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </div>
            )}
          </div>

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
