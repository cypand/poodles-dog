import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const PROTECTED_ADMIN_EMAIL = 'cypand@gmail.com'

export const dynamic = 'force-dynamic'

async function getRequesterRole(token: string) {
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user: requester } } = await supabaseAuth.auth.getUser(token)
  if (!requester) return { requester: null, role: null }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
  const { data: requesterProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', requester.id)
    .single()

  return { requester, role: requesterProfile?.role ?? null }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const { requester, role } = await getRequesterRole(token)

    if (!requester) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, role, banned, suspended_until, created_at')

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    const { data: listingCounts } = await supabaseAdmin
      .from('listings')
      .select('breeder_id')

    const countMap: Record<string, number> = {}
    for (const l of listingCounts ?? []) {
      if (l.breeder_id) {
        countMap[l.breeder_id] = (countMap[l.breeder_id] ?? 0) + 1
      }
    }

    const merged = (profiles ?? []).map((p) => {
      const authUser = authUsers?.users.find((u) => u.id === p.id)
      return {
        ...p,
        email: authUser?.email ?? null,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        listing_count: countMap[p.id] ?? 0,
      }
    })

    merged.sort((a, b) => {
      if (!a.last_sign_in_at) return 1
      if (!b.last_sign_in_at) return -1
      return new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()
    })

    return NextResponse.json(
      { users: merged, requesterRole: role },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const { requester, role } = await getRequesterRole(token)

    if (!requester) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { user_id, action, duration_hours } = await req.json()

    if (!user_id || !action) {
      return NextResponse.json({ error: 'Missing user_id or action' }, { status: 400 })
    }

    if (action !== 'suspend' && action !== 'unsuspend') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const targetUser = authUsers?.users.find((u) => u.id === user_id)

    if (targetUser?.email === PROTECTED_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'This account cannot be suspended' }, { status: 403 })
    }

    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot suspend an admin account' }, { status: 403 })
    }

    const suspended_until =
      action === 'suspend'
        ? new Date(Date.now() + (duration_hours ?? 24) * 60 * 60 * 1000).toISOString()
        : null

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ suspended_until })
      .eq('id', user_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ suspended_until })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const { requester, role } = await getRequesterRole(token)

    if (!requester) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { user_id } = await req.json()
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete an admin account' }, { status: 403 })
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
