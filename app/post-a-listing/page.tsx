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
  { code: 'TOY', label: 'Toy' },
  { code: 'MINIATURE', label: 'Miniature' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'STANDARD', label: 'Standard' },
]

const RESULT_OPTIONS = [
  { value: 'CLEAR', label: 'Clear' },
  { value: 'CARRIER', label: 'Carrier' },
  { value: 'AFFECTED', label: 'Affected' },
]

type ListingForm = {
  listing_type: string
  title: string
  description: string
  date_of_birth: string
  ready_from: string
  males_available: string
  females_available: string
  size_code: string
  adult_height_cm: string
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
}

type Colour = { code: string; label: string }
type Registry = { id: number; code: string; name: string }
type HealthTestType = { id: number; code: string; label: string; result_type: string }

export default function PostAListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [colours, setColours] = useState<Colour[]>([])
  const [registries, setRegistries] = useState<Registry[]>([])
  const [healthTests, setHealthTests] = useState<HealthTestType[]>([])

  const [sireResults, setSireResults] = useState<Record<string, string>>({})
  const [damResults, setDamResults] = useState<Record<string, string>>({})

  const [form, setForm] = useState<ListingForm>({
    listing_type: 'PUPPY',
    title: '',
    description: '',
    date_of_birth: '',
    ready_from: '',
    males_available: '',
    females_available: '',
    size_code: '',
    adult_height_cm: '',
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
  })

  useEffect(() => {
    const loadLookups = async () => {
      const { data: coloursData } = await supabase
        .from('poodle_colours')
        .select('code, label')
        .order('label')
      setColours(coloursData ?? [])

      const { data: registriesData } = await supabase
        .from('registries')
        .select('id, code, name')
        .order('name')
      setRegistries(registriesData ?? [])

      const { data: healthData } = await supabase
        .from('health_test_types')
        .select('id, code, label, result_type')
        .order('label')
      setHealthTests(healthData ?? [])
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
      if (has) {
        return { ...prev, purposes: prev.purposes.filter((p) => p !== code) }
      }
      if (prev.purposes.length >= 3) {
        return prev
      }
      return { ...prev, purposes: [...prev.purposes, code] }
    })
  }

  const toggleParentTest = (
    parent: 'sire' | 'dam',
    code: string,
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    setter((prev) => {
      const copy = { ...prev }
      if (copy[code]) {
        delete copy[code]
      } else {
        copy[code] = 'CLEAR'
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

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

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
              checked={!!results[t.code]}
              onChange={() => toggleParentTest(title === 'Sire (father)' ? 'sire' : 'dam', t.code, setter)}
            />
            <span className="text-sm">{t.label}</span>
          </label>
          {results[t.code] && (
            <select
              value={results[t.code]}
              onChange={(e) => setParentTestResult(t.code, e.target.value, setter)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              {RESULT_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  )

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
              <label className="block text-sm font-medium mb-1">Adult height (cm) — optional</label>
              <input
                type="number"
                min="0"
                value={form.adult_height_cm}
                onChange={(e) => update('adult_height_cm', e.target.value)}
                placeholder="e.g. 35"
                className="w-full border rounded-md px-3 py-2"
              />
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
              Tick each health test that has been carried out on the parents, and select the result.
            </p>

            {renderParentHealthSection('Sire (father)', sireResults, setSireResults)}
            {renderParentHealthSection('Dam (mother)', damResults, setDamResults)}

            <div className="border-t pt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.microchipped}
                  onChange={() => toggleBoolean('microchipped')}
                />
                Puppy is microchipped
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.vaccinated}
                  onChange={() => toggleBoolean('vaccinated')}
                />
                Puppy is vaccinated
              </label>
            </div>
          </div>
        )}

        {step > 3 && (
          <div className="text-gray-400 italic py-12 text-center">
            Step "{STEPS[step]}" coming soon...
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="flex justify-between mt-8">
          <button
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={step === STEPS.length - 1}
            className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </>
  )
}
