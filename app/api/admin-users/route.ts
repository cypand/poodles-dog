import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user: requester } } = await supabaseAuth.auth.getUser(token)

    if (!requester) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single()

    if (requesterProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, role, banned, created_at')

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    const merged = (profiles ?? []).map((p) => {
      const authUser = authUsers?.users.find((u) => u.id === p.id)
      return {
        ...p,
        email: authUser?.email ?? null,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
      }
    })

    merged.sort((a, b) => {
      if (!a.last_sign_in_at) return 1
      if (!b.last_sign_in_at) return -1
      return new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()
    })

    return NextResponse.json({ users: merged })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
