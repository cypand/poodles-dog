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

  // Breeder request state
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestStatus, setRequestStatus] = useState<string | null>(null)
  const [requestSaving, setRequestSaving] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [reqKennelName, setReqKennelName] = useState('')
  const [reqLitterParents, setReqLitterParents] = useState('')
  const [reqLitterSize, setReqLitterSize] = useState('')
  const [reqMessage, setReqMessage] = useState('')

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

      if (profileData?.role === 'buyer') {
        const { data: existingRequest } = await supabase
          .from('role_change_requests')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        setRequestStatus(existingRequest?.status ?? null)
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setRequestSaving(true)
    setRequestError('')
    setRequestSuccess(false)

    const { error: insertError } = await supabase.from('role_change_requests').insert({
      user_id: profile.id,
      kennel_name: reqKennelName,
      litter_parents: reqLitterParents,
      litter_size: reqLitterSize,
      message: reqMessage,
      status: 'PENDING',
    })

    if (insertError) {
      setRequestError(insertError.message)
      setRequestSaving(false)
      return
    }

    setRequestSaving(false)
    setRequestSuccess(true)
    setRequestStatus('PENDING')
    setShowRequestForm(false)
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

        {profile.role === 'breeder' && (
          <a
            href="/my-listings"
            className="inline-block mb-6 bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            Go to my Breeder Dashboard (My Listings) →
          </a>
        )}

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

        {profile.role === 'buyer' && (
          <>
            <hr className="my-8" />
            <h2 className="text-lg font-bold mb-2">Become a Breeder</h2>

            {requestStatus === 'PENDING' && (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                Your request to become a breeder is pending review. We'll notify you once it's approved.
              </p>
            )}

            {requestStatus === 'REJECTED' && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                Your previous request was not approved. You can submit a new one below.
              </p>
            )}

            {(!requestStatus || requestStatus === 'REJECTED') && !showRequestForm && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Want to list puppies for sale? Tell us a bit about your litter and we'll review your request.
                </p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
                >
                  Request to become a breeder
                </button>
              </>
            )}

            {showRequestForm && (
              <form onSubmit={handleSubmitRequest} className="space-y-4 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Kennel name (if any)</label>
                  <input
                    type="text"
                    value={reqKennelName}
                    onChange={(e) => setReqKennelName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Litter parents (sire &amp; dam — size, colour, registration if any)
                  </label>
                  <textarea
                    required
                    value={reqLitterParents}
                    onChange={(e) => setReqLitterParents(e.target.value)}
                    placeholder="e.g. Sire: Standard Poodle, apricot, KC registered. Dam: Standard Poodle, red."
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Litter size / number of puppies</label>
                  <input
                    type="text"
                    required
                    value={reqLitterSize}
                    onChange={(e) => setReqLitterSize(e.target.value)}
                    placeholder="e.g. 5 puppies (3 male, 2 female)"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Anything else we should know?</label>
                  <textarea
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                {requestError && <p className="text-red-600 text-sm">{requestError}</p>}
                {requestSuccess && <p className="text-green-600 text-sm">Request submitted!</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={requestSaving}
                    className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {requestSaving ? 'Submitting...' : 'Submit request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="text-sm text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </>
  )
}
