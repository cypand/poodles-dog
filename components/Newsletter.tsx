'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const SIZE_OPTIONS = [
  { code: 'TOY', label: 'Toy' },
  { code: 'MINIATURE', label: 'Miniature' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'STANDARD', label: 'Standard' },
]

const SEX_OPTIONS = [
  { code: 'MALE', label: 'Male' },
  { code: 'FEMALE', label: 'Female' },
]

const REGION_OPTIONS = [
  { code: 'EUROPE', label: 'Europe' },
  { code: 'UK', label: 'UK' },
  { code: 'NORTH_AMERICA', label: 'North America' },
  { code: 'SOUTH_AMERICA', label: 'South America' },
  { code: 'ASIA', label: 'Asia' },
  { code: 'AFRICA', label: 'Africa' },
  { code: 'OCEANIA', label: 'Oceania' },
  { code: 'WORLDWIDE', label: 'Worldwide' },
]

type Colour = { code: string; label: string }

export default function Newsletter() {
  const [colours, setColours] = useState<Colour[]>([])
  const [email, setEmail] = useState('')
  const [size, setSize] = useState('')
  const [sex, setSex] = useState('')
  const [colour, setColour] = useState('')
  const [location, setLocation] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadColours = async () => {
      const { data } = await supabase.from('poodle_colours').select('code, label').order('label')
      setColours(data ?? [])
    }
    loadColours()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setSending(true)

    const { error: insertError } = await supabase.from('listing_alerts').insert({
      email,
      size_code: size || null,
      sex: sex || null,
      colour_code: colour || null,
      location_code: location || null,
    })

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  }

  return (
    <section className="bg-pd-black text-white py-8 overflow-x-hidden">
      <div className="container-pd min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="text-pd-gold" size={22} />
          <div>
            <div className="font-bold text-sm">Get notified about new listings</div>
            <div className="text-xs text-white/60">
              For buyers and breeders — tell us what you're looking for and we'll email you
              when a matching listing goes live.
            </div>
          </div>
        </div>

        {sent ? (
          <p className="text-sm text-pd-gold">
            You're all set! We'll email you when a matching listing is posted.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="bg-transparent border border-white/25 px-3 py-2 text-sm text-white [&>option]:text-black"
            >
              <option value="">Any size</option>
              {SIZE_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="bg-transparent border border-white/25 px-3 py-2 text-sm text-white [&>option]:text-black"
            >
              <option value="">Any sex</option>
              {SEX_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="bg-transparent border border-white/25 px-3 py-2 text-sm text-white [&>option]:text-black"
            >
              <option value="">Any colour</option>
              {colours.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border border-white/25 px-3 py-2 text-sm text-white [&>option]:text-black"
            >
              <option value="">Any location</option>
              {REGION_OPTIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-transparent border border-white/25 px-3 py-2 text-sm placeholder:text-white/40"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-pd-gold text-pd-black font-bold text-xs px-4 py-2 hover:bg-pd-gold-light disabled:opacity-50 whitespace-nowrap"
              >
                {sending ? '...' : 'NOTIFY ME'}
              </button>
            </div>
          </form>
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </section>
  )
}
 
