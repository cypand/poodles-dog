'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type UserProfile = {
  id: string
  display_name: string | null
  role: string
  city: string | null
  country_code: string | null
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isBanned, setIsBanned] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, role, city, country_code')
        .eq('id', profileId)
        .single()

      setProfile(data)

      if (user && data) {
        const { data: blocked } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', profileId)
          .maybeSingle()
        setIsBanned(!!blocked)
      }

      setLoading(false)
    }
    load()
  }, [profileId])

  const handleToggleBan = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    setProcessing(true)

    if (isBanned) {
      await supabase.from('blocked_users').delete().eq('blocker_id', currentUserId).eq('blocked_id', profileId)
      setIsBanned(false)
    } else {
      if (!confirm(`Ban ${profile?.display_name ?? 'this user'}? They will no longer be able to message you.`)) {
        setProcessing(false)
        return
      }
      await supabase.from('blocked_users').insert({ blocker_id: currentUserId, blocked_id: profileId })
      setIsBanned(true)
    }

    setProcessing(false)
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

  if (!profile) {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-2xl mx-auto p-6 text-pd-gray">User not found.</div>
        </div>
      </>
    )
  }

  const isSelf = currentUserId === profile.id

  return (
    <>
      <Header />
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-pd-black text-white rounded-md p-6 mb-6">
            <h1 className="text-2xl font-bold">{profile.display_name ?? 'Unnamed user'}</h1>
            <p className="text-sm text-white/60 mt-1 capitalize">{profile.role}</p>
          </div>

          {(profile.city || profile.country_code) && (
            <p className="text-sm text-pd-gray mb-4">
              {profile.city ? `${profile.city}` : ''}{profile.city && profile.country_code ? ', ' : ''}{profile.country_code ?? ''}
            </p>
          )}

          {profile.role === 'breeder' && (
            <Link href={`/breeder/${profile.id}`} className="inline-block mb-4 text-sm text-blue-600 underline">
              View breeder profile & listings →
            </Link>
          )}

          {!isSelf && (
            <div className="bg-white border border-pd-black/10 rounded-md p-4">
              <button
                onClick={handleToggleBan}
                disabled={processing}
                className={`text-sm font-bold px-4 py-2 rounded-md border disabled:opacity-50 ${
                  isBanned
                    ? 'border-green-600 text-green-700 hover:bg-green-50 bg-white'
                    : 'border-red-600 text-red-600 hover:bg-red-50 bg-white'
                }`}
              >
                {processing ? 'Updating...' : isBanned ? 'Unban user' : 'Ban user'}
              </button>
              {isBanned && (
                <p className="text-xs text-pd-gray mt-2">This user cannot message you.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
