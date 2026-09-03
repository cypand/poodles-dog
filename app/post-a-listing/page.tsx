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
  sire_size: string
  dam_colour: string
  dam_size: string
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

type Colour = { id: number; code: string; label: string }
type Size = { id: number; code: string; label: string }
type Registry = { id: number; code: string; name: string }
type HealthTestType = { id: number; code: string; label: string; result_type: string }
type Currency = { code: string; symbol: string }
type Country = { code: string; name: string }

type AccessState = 'checking' | 'not_logged_in' | 'not_breeder' | 'allowed'

const todayStr = () => new Date().toISOString().slice(0, 10)

const FUTURE_DOB_MESSAGE = "That date hasn't happened yet — neither has this puppy."
const READY_BEFORE_BIRTH_MESSAGE = "A puppy can't leave home before it's even born. Please pick a 'ready from' date after the birth date."

const inputClass = "w-full border border-pd-black/15 rounded-md px-3 py-2 bg-white"
const labelClass = "block text-sm font-medium mb-1 text-pd-black"

export default function PostAListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [access, setAccess] = useState<AccessState>('checking')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showCuteMessage, setShowCuteMessage] = useState(false)

  const [colours, setColours] = useState<Colour[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
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
    sire_size: '',
    dam_colour: '',
    dam_size: '',
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
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAccess('not_logged_in')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setUserRole(profile?.role ?? null)

      if (profile?.role === 'breeder' || profile?.role === 'admin') {
        setAccess('allowed')
      } else {
        setAccess('not_breeder')
      }
    }
    checkAccess()
  }, [])

  useEffect(() => {
    if (access !== 'allowed') return

    const loadLookups = async () => {
      const { data: coloursData } = await supabase.from('poodle_colours').select('id, code, label').order('label')
      setColours(coloursData ?? [])

      const { data: sizesData } = await supabase.from('poodle_sizes').select('id, code, label').order('label')
      setSizes(sizesData ?? [])

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
  }, [access])

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

    if (index === 0 && file) {
      setShowCuteMessage(true)
      setTimeout(() => setShowCuteMessage(false), 3000)
    }
  }

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.listing_type) return 'Please select a listing type.'
      if (!form.sex) return 'Please select the sex.'
      if (!form.date_of_birth) return 'Please enter the date of birth.'
      if (form.date_of_birth > todayStr()) {
        return FUTURE_DOB_MESSAGE
      }
      if (form.ready_from && form.ready_from < form.date_of_birth) {
        return READY_BEFORE_BIRTH_MESSAGE
      }
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
          className="border border-pd-black/15 rounded-md px-2 py-1 text-sm w-24 bg-white"
        />
      )
    }
    const options = t.result_type === 'EXAM' ? EXAM_RESULT_OPTIONS : DNA_RESULT_OPTIONS
    return (
      <select
        value={results[t.code]}
        onChange={(e) => setParentTestResult(t.code, e.target.value, setter)}
        className="border border-pd-black/15 rounded-md px-2 py-1 text-sm bg-white"
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
    <div className="border border-pd-black/15 rounded-md p-4 space-y-3 bg-white">
      <h3 className="font-semibold text-pd-black">{title}</h3>
      {healthTests.map((t) => (
        <div key={t.code} className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 flex-1 text-pd-black">
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
    if (form.date_of_birth > todayStr()) {
      return FUTURE_DOB_MESSAGE
    }
    if (form.ready_from && form.ready_from < form.date_of_birth) {
      return READY_BEFORE_BIRTH_MESSAGE
    }
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

      if (userRole === 'admin') {
        const { data: existingBreederProfile } = await supabase
          .from('breeder_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingBreederProfile) {
          await supabase.from('breeder_profiles').insert({
            id: user.id,
            kennel_name: form.kennel_registration_name || 'Admin Listing',
          })
        }
      }

      const sizeMatch = sizes.find((s) => s.code === form.size_code)
      const colourMatch = colours.find((c) => c.code === form.colour_code)
      const sireSizeMatch = sizes.find((s) => s.code === form.sire_size)
      const damSizeMatch = sizes.find((s) => s.code === form.dam_size)

      let sireId: string | null = null
      let damId: string | null = null

      if (form.sire_colour || form.sire_size || Object.keys(sireResults).length > 0) {
        const { data: sireDog } = await supabase
          .from('dogs')
          .insert({
            owner_breeder_id: user.id,
            size_id: sireSizeMatch?.id ?? null,
            registered_name: 'Sire',
          })
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

      if (form.dam_colour || form.dam_size || Object.keys(damResults).length > 0) {
        const { data: damDog } = await supabase
          .from('dogs')
          .insert({
            owner_breeder_id: user.id,
            size_id: damSizeMatch?.id ?? null,
            registered_name: 'Dam',
          })
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
          size_id: sizeMatch?.id ?? null,
          colour_id: colourMatch?.id ?? null,
          date_of_birth: form.date_of_birth || null,
          ready_from: form.ready_from || null,
          males_available: form.males_available ? Number(form.males_available) : null,
          females_available: form.females_available ? Number(form.females_available) : null,
          purpose: form.purposes.length > 0 ? form.purposes : null,
          has_pedigree: form.has_pedigree === 'yes',
          registry_id: registry?.id ?? null,
          kennel_registration_name: form.kennel_registration_name || null,
          registration_number: form.registration_number || null,
          sire_id: sireId,
          dam_id: damId,
          price: form.price ? Number(form.price) : null,
          currency_code: form.currency_code,
          country_code: form.country_code,
          sell_scope: form.sell_scope.length > 0 ? form.sell_scope : null,
          transport_options: form.transport_options.length > 0 ? form.transport_options : null,
          microchipped: form.microchipped,
          vaccinated: form.vaccinated,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
        })
        .select('id')
        .single()

      if (listingError || !listing) {
        setError(listingError?.message ?? 'Could not create listing.')
        setSaving(false)
        return
      }

      fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      }).catch(() => {
        // Non-critical: admin email failing shouldn't block listing creation
      })

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
      sessionStorage.setItem('poodles-just-published', 'true')
      router.push('/search')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setSaving(false)
  }

  if (access === 'checking') {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-2xl mx-auto pt-16 p-6 text-pd-gray">Loading...</div>
        </div>
      </>
    )
  }

  if (access === 'not_logged_in') {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-md mx-auto pt-16 p-6 text-center">
            <h1 className="text-2xl font-bold mb-3 text-pd-black">Sign in required</h1>
            <p className="text-pd-gray mb-6">
              You need to be signed in with a breeder account to post a listing.
            </p>
            <a
              href="/login"
              className="inline-block bg-pd-black text-pd-gold font-bold px-6 py-3"
            >
              Sign in
            </a>
          </div>
        </div>
      </>
    )
  }

  if (access === 'not_breeder') {
    return (
      <>
        <Header />
        <div className="bg-pd-cream min-h-screen">
          <div className="max-w-md mx-auto pt-16 p-6 text-center">
            <h1 className="text-2xl font-bold mb-3 text-pd-black">Breeder account required</h1>
            <p className="text-pd-gray mb-6">
              Only breeder accounts can post listings. Your current account is registered as a
              buyer. To post a listing, please create a separate account and select
              <strong> "Breeder"</strong> during sign up.
            </p>
            <a
              href="/register"
              className="inline-block bg-pd-black text-pd-gold font-bold px-6 py-3"
            >
              Create a breeder acc
