'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const SIZE_OPTIONS = [
  { code: 'TOY', label: 'Toy (24–28cm)' },
  { code: 'MINIATURE', label: 'Miniature (28–35cm)' },
  { code: 'MEDIUM', label: 'Medium (35–45cm)' },
  { code: 'STANDARD', label: 'Standard (45–60cm)' },
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
type Country = { code: string; name: string }

export default function Hero() {
  const router = useRouter()
  const [colours, setColours] = useState<Colour[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColours, setSelectedColours] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const [openPanel, setOpenPanel] = useState<'size' | 'colour' | 'location' | null>(null)

  useEffect(() => {
    const loadLookups = async () => {
      const { data: coloursData } = await supabase.from('poodle_colours').select('code, label').order('label')
      setColours(coloursData ?? [])

      const { data: countryData } = await supabase.from('countries').select('code, name').order('name')
      setCountries(countryData ?? [])
    }
    loadLookups()
  }, [])

  const toggle = (list: string[], setList: (v: string[]) => void, code: string) => {
    setList(list.includes(code) ? list.filter((c) => c !== code) : [...list, code])
  }

  const summary = (list: string[], allLabels: { code: string; label: string }[], placeholder: string) => {
    if (list.length === 0) return placeholder
    if (list.length === 1) {
      const found = allLabels.find((o) => o.code === list[0])
      return found?.label ?? placeholder
    }
    return `${list.length} selected`
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedSizes.length > 0) params.set('size', selectedSizes.join(','))
    if (selectedColours.length > 0) params.set('colour', selectedColours.join(','))
    if (selectedLocations.length > 0) params.set('location', selectedLocations.join(','))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="bg-pd-black text-white">
      <div className="container-pd grid md:grid-cols-2 gap-8 items-center py-14">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find your Poodle.
            <br />
            <span className="text-pd-gold">Anywhere in the world.</span>
          </h1>
          <p className="mt-4 text-white/70 max-w-md">
            The global marketplace for Poodle puppies and dogs from
            responsible breeders.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSearch}
              className="bg-pd-gold text-pd-black font-bold text-sm px-6 py-3 flex items-center gap-2 hover:bg-pd-gold-light"
            >
              FIND POODLES <Search size={16} />
            </button>
            <a
              href="/post-a-listing"
              className="border border-white/30 font-bold text-sm px-6 py-3 flex items-center gap-2 hover:border-pd-gold hover:text-pd-gold"
            >
              POST A LISTING <Plus size={16} />
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full">
          <div className="w-full h-full bg-pd-black-2 border border-white/10 flex items-center justify-center text-white/30 text-sm">
            Hero photo placeholder
          </div>
        </div>
      </div>

      <div className="container-pd -mb-10 relative z-10">
        <div className="bg-white text-pd-black p-5 shadow-xl grid sm:grid-cols-5 gap-4 items-end relative">
          <CheckboxField
            label="SIZE"
            summary={summary(selectedSizes, SIZE_OPTIONS, 'All Sizes')}
            isOpen={openPanel === 'size'}
            onToggleOpen={() => setOpenPanel(openPanel === 'size' ? null : 'size')}
            options={SIZE_OPTIONS}
            selected={selectedSizes}
            onToggleOption={(code) => toggle(selectedSizes, setSelectedSizes, code)}
          />
          <CheckboxField
            label="COLOUR"
            summary={summary(selectedColours, colours, 'Any Colour')}
            isOpen={openPanel === 'colour'}
            onToggleOpen={() => setOpenPanel(openPanel === 'colour' ? null : 'colour')}
            options={colours}
            selected={selectedColours}
            onToggleOption={(code) => toggle(selectedColours, setSelectedColours, code)}
          />
          <CheckboxField
            label="LOCATION"
            summary={summary(selectedLocations, [...REGION_OPTIONS, ...countries.map((c) => ({ code: c.code, label: c.name }))], 'Worldwide')}
            isOpen={openPanel === 'location'}
            onToggleOpen={() => setOpenPanel(openPanel === 'location' ? null : 'location')}
            options={[...REGION_OPTIONS, ...countries.map((c) => ({ code: c.code, label: c.name }))]}
            selected={selectedLocations}
            onToggleOption={(code) => toggle(selectedLocations, setSelectedLocations, code)}
          />
          <button
            onClick={handleSearch}
            className="bg-pd-black text-white font-bold text-sm h-11 flex items-center justify-center gap-2 hover:bg-pd-black-2 sm:col-span-2"
          >
            SEARCH <Search size={16} />
          </button>
        </div>
        <button className="flex items-center gap-1 text-pd-gold text-xs font-bold mt-2">
          <SlidersHorizontal size={14} /> Advanced Filters
        </button>
      </div>
    </section>
  )
}

function CheckboxField({
  label,
  summary,
  isOpen,
  onToggleOpen,
  options,
  selected,
  onToggleOption,
}: {
  label: string
  summary: string
  isOpen: boolean
  onToggleOpen: () => void
  options: { code: string; label: string }[]
  selected: string[]
  onToggleOption: (code: string) => void
}) {
  return (
    <div className="relative flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-wide text-pd-gray">{label}</span>
      <button
        type="button"
        onClick={onToggleOpen}
        className="border border-black/15 h-11 px-3 text-sm bg-white text-left truncate"
      >
        {summary}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white border border-black/15 shadow-lg z-20 p-2">
          {options.map((opt) => (
            <label key={opt.code} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.code)}
                onChange={() => onToggleOption(opt.code)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
