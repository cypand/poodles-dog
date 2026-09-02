import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const resendApiKey = process.env.RESEND_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { listing_id } = await req.json()

    if (!listing_id) {
      return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(
        `id, title, price, currency_code, sex, country_code,
         size:poodle_sizes(code, label),
         colour:poodle_colours(code, label),
         country:countries(name, continent)`
      )
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const size = Array.isArray(listing.size) ? listing.size[0] : listing.size
    const colour = Array.isArray(listing.colour) ? listing.colour[0] : listing.colour
    const country = Array.isArray(listing.country) ? listing.country[0] : listing.country

    const { data: alerts } = await supabase.from('listing_alerts').select('*')

    const matches = (alerts ?? []).filter((alert) => {
      if (alert.size_code && alert.size_code !== size?.code) return false
      if (alert.sex && alert.sex !== listing.sex) return false
      if (alert.colour_code && alert.colour_code !== colour?.code) return false
      if (alert.location_code) {
        const matchesLocation =
          alert.location_code === listing.country_code ||
          alert.location_code === country?.continent ||
          alert.location_code === 'WORLDWIDE'
        if (!matchesLocation) return false
      }
      return true
    })

    if (matches.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const listingUrl = `https://poodles.dog/listing/${listing.id}`
    const priceText = listing.price ? `${listing.price} ${listing.currency_code}` : 'Price on request'

    let sentCount = 0

    for (const match of matches) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'POODLES.DOG <noreply@poodles.dog>',
          to: match.email,
          subject: `New listing matching your alert: ${listing.title || 'Poodle'}`,
          html: `
            <h2>A new listing matches your alert</h2>
            <p><strong>${listing.title || 'Untitled listing'}</strong></p>
            <p>${size?.label ?? ''} ${listing.sex ? '· ' + listing.sex : ''} ${colour ? '· ' + colour.label : ''}</p>
            <p>${country?.name ?? ''}</p>
            <p>${priceText}</p>
            <p><a href="${listingUrl}">View this listing</a></p>
          `,
        }),
      })

      if (res.ok) sentCount++
    }

    return NextResponse.json({ sent: sentCount })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
