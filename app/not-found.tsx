import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-24 p-6 text-center">
        <h1 className="text-6xl mb-4">🐩💨</h1>
        <h2 className="text-2xl font-bold mb-2">This page ran off chasing a squirrel</h2>
        <p className="text-gray-500 mb-6">
          We couldn't find what you're looking for. Let's get you back on track.
        </p>
        <Link href="/" className="inline-block bg-black text-white font-bold px-6 py-3 rounded-md">
          Take me home
        </Link>
      </div>
    </>
  )
}
