              'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

type Profile = {
  id: string
  display_name: string | null
  role: string
  country_code: string | null
  city: string | null
}

type BreederProfile = {
  kennel_name: string
  about: string | null
  years_breeding: number | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
}

type Country = {
  code: string
  name: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [breeder, setBreeder] = useState<BreederProfile | null>(null)
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name, role, country_code, city')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      const { data: countriesData } = await supabase
        .from('countries')
        .select('code, name')
        .order('name')

      setCountries(countriesData ?? [])

      if (profileData?.role === 'breeder') {
        const { data: breederData } = await supabase
          .from('breeder_profiles')
          .select('kennel_name, about, years_breeding, website_url, instagram_url, facebook_url')
          .eq('id', user.id)
          .single()

        setBreeder(breederData)
      }

      setLoading(false)
    }

    load()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        city: profile.city,
        country_code: profile.country_code,
      })
      .eq('id', profile.id)

    if (profileError) {
      setError(profileError.message)
      setSaving(false)
      return
    }

    if (profile.role === 'breeder' && breeder) {
      const { error: breederError } = await supabase
        .from('breeder_profiles')
        .update({
          kennel_name: breeder.kennel_name,
          about: breeder.about,
          years_breeding: breeder.years_breeding,
          website_url: breeder.website_url,
          instagram_url: breeder.instagram_url,
          facebook_url: breeder.facebook_url,
        })
        .eq('id', profile.id)

      if (breederError) {
        setError(breederError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSuccess(true)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto mt-16 p-6">Loading...</div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto mt-16 p-6">Profile not found.</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-16 p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display name</label>
            <input
              type="text"
              value={profile.display_name ?? ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={profile.city ?? ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={profile.country_code ?? ''}
              onChange={(e) => setProfile({ ...profile, country_code: e.target.value || null })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select a country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account type</label>
            <p className="text-gray-600 capitalize">{profile.role}</p>
          </div>

          {profile.role === 'breeder' && breeder && (
            <>
              <hr className="my-6" />
              <h2 className="text-lg font-bold mb-2">Breeder details</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Kennel name</label>
                <input
                  type="text"
                  value={breeder.kennel_name ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, kennel_name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">About</label>
                <textarea
                  value={breeder.about ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, about: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Years breeding</label>
                <input
                  type="number"
                  value={breeder.years_breeding ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, years_breeding: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={breeder.website_url ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, website_url: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instagram</label>
                <input
                  type="url"
                  value={breeder.instagram_url ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, instagram_url: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Facebook</label>
                <input
                  type="url"
                  value={breeder.facebook_url ?? ''}
                  onChange={(e) => setBreeder({ ...breeder, facebook_url: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">Saved successfully.</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white rounded-md py-2 font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </>
  )
}
