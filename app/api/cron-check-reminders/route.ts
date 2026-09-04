import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resendApiKey = process.env.RESEND_API_KEY!
const cronSecret = process.env.CRON_SECRET!

const ADMIN_EMAIL = 'cypand@gmail.com'

const MESSAGE_SUBJECTS = [
  "🐩 Someone's waiting to hear back from you!",
  "🐾 Your inbox has a wagging tail in it",
  "Woof! A message is feeling a little ignored",
]

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'POODLES.DOG <noreply@poodles.dog>',
      to,
      subject,
      html,
    }),
  })
  return res.ok
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const results = { message_reminders_sent: 0, admin_digest_sent: false }

  // --- 1. Unread message reminders (15 minutes) ---
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

  const { data: staleMessages } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, created_at')
    .eq('read', false)
    .is('reminder_sent_at', null)
    .lt('created_at', fifteenMinAgo)

  for (const msg of staleMessages ?? []) {
    const { data: convo } = await supabase
      .from('conversations')
      .select('buyer_id, breeder_id')
      .eq('id', msg.conversation_id)
      .single()

    if (!convo) continue

    const recipientId = msg.sender_id === convo.breeder_id ? convo.buyer_id : convo.breeder_id

    const { data: recipientUser } = await supabase.auth.admin.getUserById(recipientId)
    const recipientEmail = recipientUser?.user?.email

    if (recipientEmail) {
      const subject = MESSAGE_SUBJECTS[Math.floor(Math.random() * MESSAGE_SUBJECTS.length)]
      const html = `
        <h2>You've got an unread message 🐾</h2>
        <p>Someone on poodles.dog sent you a message about 15 minutes ago, and it's still patiently sitting there, unread.</p>
        <p><a href="https://poodles.dog/messages/${msg.conversation_id}">Go say hello →</a></p>
        <p style="color:#888;font-size:12px;">You're getting this because you have an account on poodles.dog. No spam, we promise — just one nudge per message.</p>
      `
      const sent = await sendEmail(recipientEmail, subject, html)
      if (sent) results.message_reminders_sent++
    }

    await supabase.from('messages').update({ reminder_sent_at: new Date().toISOString() }).eq('id', msg.id)
  }

  // --- 2. Admin digest (30 minutes) ---
  const { data: digestState } = await supabase
    .from('admin_digest_state')
    .select('last_sent_at')
    .eq('id', 1)
    .single()

  const thirtyMinAgo = Date.now() - 30 * 60 * 1000
  const lastSent = digestState?.last_sent_at ? new Date(digestState.last_sent_at).getTime() : 0

  if (lastSent < thirtyMinAgo) {
    const [
      { count: pendingListings },
      { count: pendingReports },
      { count: pendingRequests },
      { count: pendingVerifications },
    ] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('role_change_requests').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('breeder_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    ])

    const total = (pendingListings ?? 0) + (pendingReports ?? 0) + (pendingRequests ?? 0) + (pendingVerifications ?? 0)

    if (total > 0) {
      const html = `
        <h2>🐾 The pack is waiting for you</h2>
        <p>Here's what's pending on poodles.dog right now:</p>
        <ul>
          <li>${pendingListings ?? 0} listing(s) awaiting approval</li>
          <li>${pendingReports ?? 0} report(s) to review</li>
          <li>${pendingRequests ?? 0} breeder request(s) pending</li>
          <li>${pendingVerifications ?? 0} verification(s) pending</li>
        </ul>
        <p><a href="https://poodles.dog/admin/listings">Open the admin panel →</a></p>
      `
      const sent = await sendEmail(ADMIN_EMAIL, '🐾 Your poodles.dog admin update', html)
      results.admin_digest_sent = sent
    }

    await supabase.from('admin_digest_state').upsert({ id: 1, last_sent_at: new Date().toISOString() })
  }

  return NextResponse.json(results)
}
