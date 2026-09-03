'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'buyer' | 'breeder'>('buyer')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('display_name') || signUpError.message.toLowerCase().includes('duplicate')) {
        setError('That display name is already taken. Please choose a different one.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerifying(true)

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })

    if (verifyError) {
      setError(verifyError.message)
      setVerifying(false)
      return
    }

    if (verifyData.user) {
      await supabase
        .from('profiles')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', verifyData.user.id)
    }

    setVerifying(false)
    router.push('/')
    router.refresh()
  }

  if (success) {
    return (
      <div className="bg-pd-cream min-h-screen">
        <div className="max-w-md mx-auto pt-16 p-6">
          <div className="bg-white border border-pd-black/10 rounded-md p-6">
            <h1 className="text-2xl font-bold mb-2 text-center text-pd-black">Check your email</h1>
            <p className="text-pd-gray text-center mb-6">
              We've sent a 6-digit code to <strong>{email}</strong>. Enter it below
              to complete your registration.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-pd-black">
                  Confirmation code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full border border-pd-black/15 rounded-md px-3 py-2 text-center text-lg tracking-widest"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-pd-black text-pd-gold rounded-md py-2 font-medium disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify and finish'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-pd-cream min-h-screen">
      <div className="max-w-md mx-auto pt-16 p-6">
        <div className="bg-white border border-pd-black/10 rounded-md p-6">
          <h1 className="text-2xl font-bold mb-2 text-pd-black">Create an account</h1>
          <p className="text-pd-gray text-sm mb-6">
            poodles.dog has two sides: <strong>buyers</strong> search and contact
            breeders directly, while <strong>breeders</strong> create listings for
            their puppies. Pick the account type below that matches what you want
            to do — you'll be able to update it later from your profile.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">
                Display name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-pd-black/15 rounded-md px-3 py-2"
              />
              <p className="text-xs text-pd-gray mt-1">Must be unique — this is how other users will see you.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-pd-black/15 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-pd-black/15 rounded-md px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pd-gray"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-pd-black/15 rounded-md px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pd-gray"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-pd-black">
                I am a...
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-pd-black">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'buyer'}
                    onChange={() => setRole('buyer')}
                  />
                  Buyer
                </label>
                <label className="flex items-center gap-2 text-pd-black">
                  <input
                    type="radio"
                    name="role"
                    checked={role === 'breeder'}
                    onChange={() => setRole('breeder')}
                  />
                  Breeder
                </label>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-pd-black">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree to the{' '}
                <a href="/legal" target="_blank" className="underline">
                  Terms of Service and Privacy Policy
                </a>
              </span>
            </label>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pd-black text-pd-gold rounded-md py-2 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
