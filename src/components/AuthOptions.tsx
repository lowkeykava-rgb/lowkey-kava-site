'use client'

import { useState } from 'react'
import Link from 'next/link'

export function AuthOptions() {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim()) {
      // Redirect to signup with invite code
      window.location.href = `/signup?invite=${encodeURIComponent(inviteCode.trim())}`
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {!showInviteForm ? (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600 mb-6">
              Sign in to your account or enter an invite code to get started
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium block text-center"
            >
              Sign In
            </Link>
            
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              I have an invite code
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Enter Invite Code
            </h2>
            <p className="text-slate-600 mb-6">
              Enter your invite code to create an account
            </p>
          </div>
          
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-700 mb-2">
                Invite Code
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
            
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Continue with Invite
              </button>
              
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          By using this site, you agree to our{' '}
          <Link href="/policies/terms" className="text-slate-700 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/policies/privacy" className="text-slate-700 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
} 