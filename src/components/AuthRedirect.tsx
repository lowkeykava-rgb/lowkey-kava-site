'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function AuthRedirect() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    
    if (code) {
      // If there's a code parameter, redirect to the auth callback
      const authCallbackUrl = `/auth/callback?code=${code}`
      console.log('Redirecting to auth callback:', authCallbackUrl)
      window.location.href = authCallbackUrl
    }
  }, [searchParams])

  // This component doesn't render anything visible
  return null
}
