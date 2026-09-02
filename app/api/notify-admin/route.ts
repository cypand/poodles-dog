import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

const ADMIN_EMAIL = 'cypand@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { listing_id } = await req.json()

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: listing } = await supabase
      .from('listings')
      .select(`id, title, breeder:breeder_profiles(kennel_name)`)
      .eq('id', listing_id)
      .single()

    const breeder = listing && Array.isArray(listing.breeder) ? listing.breeder[0] : listing?.breeder
    const listingTitle = listing?.title || 'Untitled listing'
    const kennelName = breeder?.kennel_name || 'Unknown kennel'
    const reviewUrl = 'https://poodles.dog/admin/listings'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'POODLES.DOG <noreply@poodles.dog>',
        to: ADMIN_EMAIL,
        subject: `New listing pending approval: ${listingTitle}`,
        html: `
          <h2>A new listing needs review</h2>
          <p><strong>${listingTitle}</strong></p>
          <p>Submitted by: ${kennelName}</p>
          <p><a href="${reviewUrl}">Review it in the admin panel</a></p>
        `,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.log('notify-admin: Resend send failed', { status: res.status, errText })
      return NextResponse.json({ sent: false }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
