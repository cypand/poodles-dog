'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

const SIZE_OPTIONS = [
  { code: 'TOY', label: 'Toy (24–28cm)' },
  { code: 'MINIATURE', label: 'Miniature (28–35cm)' },
  { code: 'MEDIUM', label: 'Medium (35–45cm)' },
  { code: 'STANDARD', label: 'Standard (45–60cm)' },
]

const SELL_SCOPE_OPTIONS = [
  { code: 'OWN_COUNTRY', label: 'Own country only' },
  { code: 'EUROPE', label: 'Europe' },
  { code: 'UK', label: 'UK' },
  { code: 'NORTH_AMERICA', label: 'North America' },
  { code: 'SOUTH_AMERICA', label: 'South America' },
  { code: 'ASIA', label: 'Asia' },
  { code: 'AFRICA', label: 'Africa' },
  { code: 'OCEANIA', label: 'Oceania' },
  { code: 'WORLDWIDE', label: 'Worldwide' },
]

const TRANSPORT_OPTIONS = [
  { code: 'GROUND', label: 'By car / ground transport' },
  { code: 'AIR_CARGO', label: 'By plane / air cargo' },
  { code: 'BUYER_COLLECTION', label: 'New owner collects in person' },
  { code: 'FLIGHT_NANNY', label: 'Courier / transport company' },
  { code: 'ANY', label: 'Any of the above / no preference' },
]

type Colour = { id: number; code: string; label: string }
type Size = { id: number; code: string; label: string }
type Currency = { code: string; symbol: string }
type Country = { code: string; name: string }
type Photo = { id: number; url: string; sort_order: number }

type EditForm = {
  listing_type: string
  title: string
  description: string
  sex: string
  date_of_birth: string
  ready_from: string
  males_available: string
  females_available: string
  size_code: string
  colour_code: string
  has_pedigree: boolean
  kennel_registration_name: string
  registration_number: string
  parent_titles: string
  microchipped: boolean
  vaccinated: boolean
  price: string
  currency_code: string
  country_code: string
  sell_scope: string[]
  transport_options: string[]
  status: string
}

export default function AdminEditListingPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [sizes, setSizes] = useState<Size[]>([])
  const [colours, setColours] = useState<Colour[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([])
  const [newPhotos, setNewPhotos] = useState<(File | null)[]>([null, null, null])

  const [form, setForm] = useState<EditForm>({
    listing_type: 'PUPPY',
    title: '',
    description: '',
    sex: '',
    date_of_birth: '',
    ready_from: '',
    males_available: '',
    females_available: '',
    size_code: '',
    colour_code: '',
    has_pedigree: false,
    kennel_registration_name: '',
    registration_number: '',
    parent_titles: '',
    microchipped: false,
    vaccinated: false,
    price: '',
    currency_code: 'EUR',
    country_code: '',
    sell_scope: [],
    transport_options: [],
    status: 'PENDING',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setIsAdmin(true)

      const { data: sizesData } = await supabase.from('poodle_sizes').select('id, code, label').order('label')
      setSizes(sizesData ?? [])

      const { data: coloursData } = await supabase.from('poodle_colours').select('id, code, label').order('label')
      setColours(coloursData ?? [])

      const { data: currencyData } = await supabase.from('currencies').select('code, symbol').order('code')
      setCurrencies(currencyData ?? [])

      const { data: countryData } = await supabase.from('countries').select('code, name').order('name')
      setCountries(countryData ?? [])

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(
          `listing_type, title, description, sex, date_of_birth, ready_from,
           males_available, females_available, has_pedigree, kennel_registration_name,
           registration_number, parent_titles, microchipped, vaccinated, price,
           currency_code, country_code, sell_scope, transport_options, status,
           size:poodle_sizes(code), colour:poodle_colours(code),
           photos:listing_photos(id, url, sort_order)`
        )
        .eq('id', listingId)
        .single()

      if (listingError || !listing) {
        setError(`Listing not found. Debug: ${listingError?.message ?? 'no listing returned'} (id: ${listingId})`)
        setLoading(false)
        return
      }

      const size = Array.isArray(listing.size) ? listing.size[0] : listing.size
      const colour = Array.isArray(listing.colour) ? listing.colour[0] : listing.colour

      setForm({
        listing_type: listing.listing_type ?? 'PUPPY',
        title: listing.title ?? '',
        description: listing.description ?? '',
        sex: listing.sex ?? '',
        date_of_birth: listing.date_of_birth ?? '',
        ready_from: listing.ready_from ?? '',
        males_available: listing.males_available?.toString() ?? '',
        females_available: listing.females_available?.toString() ?? '',
        size_code: size?.code ?? '',
        colour_code: colour?.code ?? '',
        has_pedigree: listing.has_pedigree ?? false,
        kennel_registration_name: listing.kennel_registration_name ?? '',
        registration_number: listing.registration_number ?? '',
        parent_titles: listing.parent_titles ?? '',
        microchipped: listing.microchipped ?? false,
        vaccinated: listing.vaccinated ?? false,
        price: listing.price?.toString() ?? '',
        currency_code: listing.currency_code ?? 'EUR',
        country_code: listing.country_code ?? '',
        sell_scope: listing.sell_scope ?? [],
        transport_options: listing.transport_options ?? [],
        status: listing.status ?? 'PENDING',
      })

      setExistingPhotos(((listing.photos as unknown as Photo[]) ?? []).sort((a, b) => a.sort_order - b.sort_order))
      setLoading(false)
    }
    load()
  }, [listingId, router])

  const update = (field: keyof EditForm, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const toggleBoolean = (field: 'microchipped' | 'vaccinated' | 'has_pedigree') => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleListValue = (field: 'sell_scope' | 'transport_options', code: string) => {
    setForm((prev) => {
      const list = prev[field]
      const has = list.includes(code)
      return { ...prev, [field]: has ? list.filter((v) => v !== code) : [...list, code] }
    })
  }

  const handleDeleteExistingPhoto = async (photo: Photo) => {
    if (!confirm('Remove this photo?')) return
    await supabase.from('listing_photos').delete().eq('id', photo.id)
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const handleNewPhotoChange = (index: number, file: File | null) => {
    const copy = [...newPhotos]
    copy[index] = file
    setNewPhotos(copy)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    const sizeMatch = sizes.find((s) => s.code === form.size_code)
    const colourMatch = colours.find((c) => c.code === form.colour_code)

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        listing_type: form.listing_type,
        title: form.title,
        description: form.description,
        sex: form.sex,
        date_of_birth: form.date_of_birth || null,
        ready_from: form.ready_from || null,
        males_available: form.males_available ? Number(form.males_available) : null,
        females_available: form.females_available ? Number(form.females_available) : null,
        size_id: sizeMatch?.id ?? null,
        colour_id: colourMatch?.id ?? null,
        has_pedigree: form.has_pedigree,
        kennel_registration_name: form.kennel_registration_name || null,
        registration_number: form.registration_number || null,
        parent_titles: form.parent_titles || null,
        microchipped: form.microchipped,
        vaccinated: form.vaccinated,
        price: form.price ? Number(form.price) : null,
        currency_code: form.currency_code,
        country_code: form.country_code,
        sell_scope: form.sell_scope.length > 0 ? form.sell_scope : null,
        transport_options: form.transport_options.length > 0 ? form.transport_options : null,
        status: form.status,
      })
      .eq('id', listingId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    const startIndex = existingPhotos.length
    for (let i = 0; i < newPhotos.length; i++) {
      const file = newPhotos[i]
      if (!file) continue

      const fileExt = file.name.split('.').pop()
      const filePath = `${listingId}/${startIndex + i}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) continue

      const { data: publicUrlData } = supabase.storage.from('listing-photos').getPublicUrl(filePath)

      await supabase.from('listing_photos').insert({
        listing_id: listingId,
        url: publicUrlData.publicUrl,
        sort_order: startIndex + i,
      })
    }

    setSaving(false)
    setSuccess(true)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto mt-16 p-6 text-gray-500">Loading...</div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto mt-16 p-6">
          <p className="text-red-600">You do not have access to this page.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-10 p-6 mb-16">
        <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">Saved successfully.</p>}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="SOLD">Sold</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Listing type</label>
            <select
              value={form.listing_type}
              onChange={(e) => update('listing_type', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="PUPPY">Puppy</option>
              <option value="YOUNG_DOG">Young dog</option>
              <option value="ADULT_DOG">Adult dog</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sex</label>
            <select
              value={form.sex}
              onChange={(e) => update('sex', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update('date_of_birth', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ready from</label>
              <input
                type="date"
                value={form.ready_from}
                onChange={(e) => update('ready_from', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Males available</label>
              <input
                type="number"
                min="0"
                value={form.males_available}
                onChange={(e) => update('males_available', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Females available</label>
              <input
                type="number"
                min="0"
                value={form.females_available}
                onChange={(e) => update('females_available', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <select
              value={form.size_code}
              onChange={(e) => update('size_code', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select a size</option>
              {SIZE_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Colour</label>
            <select
              value={form.colour_code}
              onChange={(e) => update('colour_code', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select a colour</option>
              {colours.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.has_pedigree} onChange={() => toggleBoolean('has_pedigree')} />
            Has pedigree
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Kennel name</label>
            <input
              type="text"
              value={form.kennel_registration_name}
              onChange={(e) => update('kennel_registration_name', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Registration number</label>
            <input
              type="text"
              value={form.registration_number}
              onChange={(e) => update('registration_number', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parent titles</label>
            <input
              type="text"
              value={form.parent_titles}
              onChange={(e) => update('parent_titles', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.microchipped} onChange={() => toggleBoolean('microchipped')} />
              Microchipped
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.vaccinated} onChange={() => toggleBoolean('vaccinated')} />
              Vaccinated
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={form.currency_code}
                onChange={(e) => update('currency_code', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={form.country_code}
              onChange={(e) => update('country_code', e.target.value)}
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
            <label className="block text-sm font-medium mb-1">Willing to send to</label>
            <div className="space-y-2">
              {SELL_SCOPE_OPTIONS.map((s) => (
                <label key={s.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.sell_scope.includes(s.code)}
                    onChange={() => toggleListValue('sell_scope', s.code)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transport options</label>
            <div className="space-y-2">
              {TRANSPORT_OPTIONS.map((t) => (
                <label key={t.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.transport_options.includes(t.code)}
                    onChange={() => toggleListValue('transport_options', t.code)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photos</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  <img src={photo.url} alt="Listing" className="w-full h-24 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingPhoto(photo)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-2">Add more photos:</p>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="file"
                accept="image/*"
                onChange={(e) => handleNewPhotoChange(i, e.target.files?.[0] ?? null)}
                className="w-full text-sm mb-2"
              />
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={() => router.push('/admin/listings')}
              className="px-6 py-2 border rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
