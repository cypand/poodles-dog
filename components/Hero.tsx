'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

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
            Connecting Poodle lovers with responsible breeders worldwide.
          </p>
          <p className="mt-4 text-white/50 text-sm max-w-md font-semibold">
            Two types of accounts:
          </p>
          <p className="mt-2 text-white/50 text-sm max-w-md">
            <strong className="text-pd-gold">Buyers:</strong> Looking for your next Poodle?
            Discover puppies and dogs from responsible breeders around the world.
          </p>
          <p className="mt-2 text-white/50 text-sm max-w-md">
            <strong className="text-pd-gold">Breeders:</strong> Showcase your Poodles and
            connect directly with people searching for their perfect companion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/search')}
              className="bg-pd-gold text-pd-black font-bold text-sm px-6 py-3"
            >
              FIND POODLES
            </button>
            <a
              href="/post-a-listing"
              className="border border-white/30 font-bold text-sm px-6 py-3 flex items-center gap-2 hover:border-pd-gold hover:text-pd-gold"
            >
              POST A LISTING
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden">
          <img
            src="/hero-photo.jpg"
            alt="Five Poodles of different colours sitting together in a garden"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
