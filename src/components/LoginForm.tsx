'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation' // Unused import
import { createClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/validations'

export function LoginForm() {
  // const router = useRouter() // Unused variable
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate email
      const validatedData = loginSchema.parse({ email })
      
      const supabase = createClient()

      // Send magic link
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: validatedData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) {
        throw signInError
      }

      setSuccess(true)

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          Check your email for a magic link to sign in!
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Send another link
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
      </button>

      <div className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-slate-900 hover:underline font-medium">
          Sign up here
        </a>
      </div>
    </form>
  )
} 