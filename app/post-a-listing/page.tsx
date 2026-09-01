'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

const STEPS = ['Basics', 'Size & Purpose', 'Pedigree & Kennel', 'Health', 'Price & Location', 'Photos']

const PURPOSE_OPTIONS = [
  { code: 'PET_HOME', label: 'Pet home' },
  { code: 'SHOW_HOME', label: 'Show home' },
  { code: 'GROOMING_DOG', label: 'Grooming dog' },
]

const SIZE_OPTIONS = [
  { code: 'TOY', label: 'Toy (24–28cm)' },
  { code: 'MINIATURE', label: 'Miniature (28–35cm)' },
  { code: 'MEDIUM', label: 'Medium (35–45cm)' },
  { code: 'STANDARD', label: 'Standard (45–60cm)' },
]

const DNA_RESULT_OPTIONS = [
  { value: 'CLEAR', label: 'Clear' },
  { value: 'CARRIER', label: 'Carrier' },
  { value: 'AFFECTED', label: 'Affected' },
]

const EXAM_RESULT_OPTIONS = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ABNORMAL', label: 'Abnormal' },
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

type ListingForm = {
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
  sire_colour: string
  dam_colour: string
  purposes: string[]
  kennel_registration_name: string
  registry_code: string
  registration_number: string
  has_pedigree: string
  parent_titles: string
  microchipped: boolean
  vaccinated: boolean
  price: string
  currency_code: string
  country_code: string
  sell_scope: string[]
  transport_options: string[]
}

type Colour = { code: string; label: string }
type Registry = { id: number; code: string; name: string }
type HealthTestType = { id: number; code: string; label: string; result_type: string }
type Currency = { code: string; symbol: string }
type Country = { code: string; name: string }

export default function PostAListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [colours, setColours] = useState<Colour[]>([])
  const [registries, setRegistries] = useState<Registry[]>([])
  const [healthTests, setHealthTests] = useState<HealthTestType[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  const [sireResults, setSireResults] = useState<Record<string, string>>({})
  const [damResults, setDamResults] = useState<Record<string, string>>({})

  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null])
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null])

  const [form, setForm] = useState<ListingForm>({
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
    sire_colour: '',
    dam_colour: '',
    purposes: [],
    kennel_registration_name: '',
    registry_code: '',
    registration_number: '',
    has_pedigree: '',
    parent_titles: '',
    microchipped: false,
    vaccinated: false,
    price: '',
    currency_code: 'EUR',
    country_code: '',
    sell_scope: [],
    transport_options: [],
  })

  useEffect(() => {
    const loadLookups = async () => {
      const { data: coloursData } = await supabase.from('poodle_colours').select('code, label').order('label')
      setColours(coloursData ?? [])

      const { data: registriesData } = await supabase.from('registries').select('id, code, name').order('name')
      setRegistries(registriesData ?? [])

      const { data: healthData } = await supabase
        .from('health_test_types')
        .select('id, code, label, result_type')
        .order('label')
      setHealthTests(healthData ?? [])

      const { data: currencyData } = await supabase.from('currencies').select('code, symbol').order('code')
      setCurrencies(currencyData ?? [])

      const { data: countryData } = await supabase.from('countries').select('code, name').order('name')
      setCountries(countryData ?? [])
    }
    loadLookups()
  }, [])

  const update = (field: keyof ListingForm, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const toggleBoolean = (field: 'microchipped' | 'vaccinated') => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const togglePurpose = (code: string) => {
    setForm((prev) => {
      const has = prev.purposes.includes(code)
      if (has) return { ...prev, purposes: prev.purposes.filter((p) => p !== code) }
      if (prev.purposes.length >= 3) return prev
      return { ...prev, purposes: [...prev.purposes, code] }
    })
  }

  const toggleListValue = (field: 'sell_scope' | 'transport_options', code: string) => {
    setForm((prev) => {
      const list = prev[field]
      const has = list.includes(code)
      return { ...prev, [field]: has ? list.filter((v) => v !== code) : [...list, code] }
    })
  }

  const toggleParentTest = (
    code: string,
    resultType: string,
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    setter((prev) => {
      const copy = { ...prev }
      if (copy[code] !== undefined) {
        delete copy[code]
      } else {
        copy[code] = resultType === 'SCORE' ? '' : resultType === 'EXAM' ? 'NORMAL' : 'CLEAR'
      }
      return copy
    })
  }

  const setParentTestResult = (
    code: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    setter((prev) => ({ ...prev, [code]: value }))
  }

  const handlePhotoChange = (index: number, file: File | null) => {
    const newPhotos = [...photos]
    newPhotos[index] = file
    setPhotos(newPhotos)

    const newPreviews = [...photoPreviews]
    if (file) {
      newPreviews[index] = URL.createObjectURL(file)
    } else {
      newPreviews[index] = null
    }
    setPhotoPreviews(newPreviews)
  }

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.listing_type) return 'Please select a listing type.'
      if (!form.sex) return 'Please select the sex.'
      if (!form.date_of_birth) return 'Please enter the date of birth.'
    }
    if (step === 1) {
      if (!form.size_code) return 'Please select a size.'
      if (!form.colour_code) return 'Please select a colour.'
    }
    if (step === 4) {
      if (!form.price) return 'Please enter a price.'
      if (!form.country_code) return 'Please select a country.'
    }
    return null
  }

  const next = () => {
    const stepError = validateStep()
    if (stepError) {
      setError(stepError)
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const renderResultInput = (
    t: HealthTestType,
    results: Record<string, string>,
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (results[t.code] === undefined) return null
    if (t.result_type === 'SCORE') {
      return (
        <input
          type="text"
          value={results[t.code]}
          onChange={(e) => setParentTestResult(t.code, e.target.value, setter)}
          placeholder="e.g. 0/0"
          className="border rounded-md px-2 py-1 text-sm w-24"
        />
      )
    }
    const options = t.result_type === 'EXAM' ? EXAM_RESULT_OPTIONS : DNA_RESULT_OPTIONS
    return (
      <select
        value={results[t.code]}
        onChange={(e) => setParentTestResult(t.code, e.target.value, setter)}
        className="border rounded-md px-2 py-1 text-sm"
      >
        {options.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    )
  }

  const renderParentHealthSection = (
    title: string,
    results: Record<string, string>,
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => (
    <div className="border rounded-md p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {healthTests.map((t) => (
        <div key={t.code} className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={results[t.code] !== undefined}
              onChange={() => toggleParentTest(t.code, t.result_type, setter)}
            />
            <span className="text-sm">{t.label}</span>
          </label>
          {renderResultInput(t, results, setter)}
        </div>
      ))}
    </div>
  )

  const validate = (): string | null => {
    if (photos.every((p) => p === null)) return 'Please upload at least 1 photo.'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to post a listing.')
        setSaving(false)
        return
      }

      let sireId: string | null = null
      let damId: string | null = null

      if (form.sire_colour || Object.keys(sireResults).length > 0) {
        const { data: sireDog } = await supabase
          .from('dogs')
          .insert({ owner_breeder_id: user.id, size_id: null, registered_name: 'Sire' })
          .select('id')
          .single()
        sireId = sireDog?.id ?? null

        if (sireId) {
          const testEntries = Object.entries(sireResults)
          for (const [code, value] of testEntries) {
            const testType = healthTests.find((t) => t.code === code)
            if (testType) {
              await supabase.from('dog_health_results').insert({
                dog_id: sireId,
                test_type_id: testType.id,
                result_value: value,
              })
            }
          }
        }
      }

      if (form.dam_colour || Object.keys(damResults).length > 0) {
        const { data: damDog } = await supabase
          .from('dogs')
          .insert({ owner_breeder_id: user.id, size_id: null, registered_name: 'Dam' })
          .select('id')
          .single()
        damId = damDog?.id ?? null

        if (damId) {
          const testEntries = Object.entries(damResults)
          for (const [code, value] of testEntries) {
            const testType = healthTests.find((t) => t.code === code)
            if (testType) {
              await supabase.from('dog_health_results').insert({
                dog_id: damId,
                test_type_id: testType.id,
                result_value: value,
              })
            }
          }
        }
      }

      const registry = registries.find((r) => r.code === form.registry_code)

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          breeder_id: user.id,
          listing_type: form.listing_type,
          title: form.title,
          description: form.description,
          sex: form.sex,
          size_id: null,
          colour_id: null,
          date_of_birth: form.date_of_birth || null,
          ready_from: form.ready_from || null,
          males_available: form.males_available ? Number(form.males_available) : null,
          females_available: form.females_available ? Number(form.females_available) : null,
          has_pedigree: form.has_pedigree === 'yes',
          registry_id: registry?.id ?? null,
          kennel_registration_name: form.kennel_registration_name || null,
          registration_number: form.registration_number || null,
          sire_id: sireId,
          dam_id: damId,
          price: form.price ? Number(form.price) : null,
          currency_code: form.currency_code,
          country_code: form.country_code,
          sell_scope: form.sell_scope.length > 0 ? form.sell_scope[0] : null,
          transport_options: form.transport_options.length > 0 ? form.transport_options : null,
          microchipped: form.microchipped,
          vaccinated: form.vaccinated,
          status: 'PENDING',
        })
        .select('id')
        .single()

      if (listingError || !listing) {
        setError(listingError?.message ?? 'Could not create listing.')
        setSaving(false)
        return
      }

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        if (!file) continue

        const fileExt = file.name.split('.').pop()
        const filePath = `${listing.id}/${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(filePath, file, { upsert: true })

        if (uploadError) continue

        const { data: publicUrlData } = supabase.storage.from('listing-photos').getPublicUrl(filePath)

        await supabase.from('listing_photos').insert({
          listing_id: listing.id,
          url: publicUrlData.publicUrl,
          sort_order: i,
        })
      }

      router.push('/search')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setSaving(false)
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <h1 className="text-2xl font-bold mb-2">Post a Listing</h1>

        <div className="flex items-center gap-2 mb-8 text-xs text-gray-500 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className={`px-2 py-1 rounded ${i === step ? 'bg-black text-white' : ''}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Listing type</label>
              <select
                value={form.listing_type}
                onChange={(e) => update('listing_type', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="LITTER">Litter</option>
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
                placeholder="e.g. Standard Poodle Puppies Available"
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
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Approximate adult size</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sire (father) colour</label>
                <input
                  type="text"
                  value={form.sire_colour}
                  onChange={(e) => update('sire_colour', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dam (mother) colour</label>
                <input
                  type="text"
                  value={form.dam_colour}
                  onChange={(e) => update('dam_colour', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Suitable for (choose 1–3)</label>
              <div className="space-y-2">
                {PURPOSE_OPTIONS.map((p) => (
                  <label key={p.code} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.purposes.includes(p.code)}
                      onChange={() => togglePurpose(p.code)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Kennel club</label>
              <select
                value={form.registry_code}
                onChange={(e) => update('registry_code', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a kennel club</option>
                {registries.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium mb-1">Do the parents have pedigree?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="has_pedigree"
                    checked={form.has_pedigree === 'yes'}
                    onChange={() => update('has_pedigree', 'yes')}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="has_pedigree"
                    checked={form.has_pedigree === 'no'}
                    onChange={() => update('has_pedigree', 'no')}
                  />
                  No
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Parent titles (optional)</label>
              <input
                type="text"
                value={form.parent_titles}
                onChange={(e) => update('parent_titles', e.target.value)}
                placeholder="e.g. CH, INT CH"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Tick each health test that has been carried out on the parents, and enter the result.
            </p>
            {renderParentHealthSection('Sire (father)', sireResults, setSireResults)}
            {renderParentHealthSection('Dam (mother)', damResults, setDamResults)}
            <div className="border-t pt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.microchipped} onChange={() => toggleBoolean('microchipped')} />
                Puppy is microchipped
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.vaccinated} onChange={() => toggleBoolean('vaccinated')} />
                Puppy is vaccinated
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Willing to send to (choose all that apply)</label>
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
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Upload up to 3 photos. At least 1 photo is required.</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <label className="block text-sm font-medium mb-2">Photo {i + 1}</label>
                {photoPreviews[i] && (
                  <img src={photoPreviews[i]!} alt={`Preview ${i + 1}`} className="w-full h-48 object-cover rounded-md mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(i, e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="flex justify-between mt-8">
          <button onClick={back} disabled={step === 0} className="px-4 py-2 border rounded-md disabled:opacity-30">
            Back
          </button>
          {step === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-md disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Listing'}
            </button>
          ) : (
            <button onClick={next} className="px-4 py-2 bg-black text-white rounded-md">
              Next
            </button>
          )}
        </div>
      </div>
    </>
  )
}
