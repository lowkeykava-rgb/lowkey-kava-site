'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signupSchema } from '@/lib/validations'
import { validateInviteCode } from '@/lib/utils'

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  })

  useEffect(() => {
    const invite = searchParams.get('invite')
    if (invite) {
      setInviteCode(invite)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formData)
      
      if (!validateInviteCode(inviteCode)) {
        setError('Invalid invite code format')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Check if invite code is valid
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', inviteCode)
        .eq('active', true)
        .single()

      if (inviteError || !invite) {
        setError('Invalid or expired invite code')
        setLoading(false)
        return
      }

      if (invite.uses >= invite.max_uses) {
        setError('This invite code has already been used')
        setLoading(false)
        return
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError('This invite code has expired')
        setLoading(false)
        return
      }

      // Send magic link
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: validatedData.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
          data: {
            name: validatedData.name,
            phone: validatedData.phone,
            invite_code: inviteCode
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      // Show success message
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          Check your email for a magic link to complete your signup!
        </div>
        <div className="text-slate-600 text-sm">
          Redirecting to login page...
        </div>
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
        <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-700 mb-2">
          Invite Code *
        </label>
        <input
          type="text"
          id="inviteCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter your invite code"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Your full name"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number (optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(555) 123-4567"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <a href="/login" className="text-slate-900 hover:underline font-medium">
          Sign in here
        </a>
      </div>
    </form>
  )
} 