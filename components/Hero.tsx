'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  return (
    <section className="bg-pd-black text-white">
      <div className="container-pd py-14 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Find your poodle,
          <br />
          <span className="text-pd-gold">connecting you with breeders all around the world.</span>
        </h1>

        <div className="mt-6 border border-pd-gold/60 bg-white/5 px-4 py-3 inline-block">
          <p className="font-bold text-sm text-white">
            You deal directly with the breeder — every listing, every message.
          </p>
        </div>

        <p className="mt-5 text-white/70 max-w-md">
          Discover Poodles from breeders around the world. Browse available dogs, learn about
          breeders, and contact them directly.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-5">
          <button
            onClick={() => router.push('/search')}
            className="bg-pd-gold text-pd-black font-bold text-sm px-6 py-3"
          >
            FIND POODLES
          </button>
          <a
            href="/post-a-listing"
            className="text-white/60 text-sm underline hover:text-pd-gold"
          >
            Are you a breeder? Post a listing →
          </a>
        </div>
      </div>
    </section>
  )
}
