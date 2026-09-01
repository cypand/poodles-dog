'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Header from '@/components/Header'

const STEPS = ['Basics', 'Size & Purpose', 'Pedigree & Kennel', 'Health', 'Price & Location', 'Photos']

type ListingForm = {
  listing_type: string
  title: string
  description: string
  date_of_birth: string
  ready_from: string
  males_available: string
  females_available: string
}

export default function PostAListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<ListingForm>({
    listing_type: 'PUPPY',
    title: '',
    description: '',
    date_of_birth: '',
    ready_from: '',
    males_available: '',
    females_available: '',
  })

  const update = (field: keyof ListingForm, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <h1 className="text-2xl font-bold mb-2">Post a Listing</h1>

        <div className="flex items-center gap-2 mb-8 text-xs text-gray-500">
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

        {step > 0 && (
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
