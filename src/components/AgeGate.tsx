'use client'

import { useState, useEffect } from 'react'

interface AgeGateProps {
  children: React.ReactNode
}

export function AgeGate({ children }: AgeGateProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [showGate, setShowGate] = useState(true)

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem('age-verified')
    if (verified === 'true') {
      setIsVerified(true)
      setShowGate(false)
    }
  }, [])

  const handleVerify = () => {
    setIsVerified(true)
    setShowGate(false)
    localStorage.setItem('age-verified', 'true')
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  if (!showGate) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Age Verification Required
          </h2>
          <p className="text-slate-600">
            You must be at least {process.env.NEXT_PUBLIC_AGE_MIN || 21} years old to access this site.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            I am {process.env.NEXT_PUBLIC_AGE_MIN || 21} or older
          </button>
          
          <button
            onClick={handleDecline}
            className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            I am under {process.env.NEXT_PUBLIC_AGE_MIN || 21}
          </button>
        </div>
        
        <div className="mt-6 text-xs text-slate-500">
          <p>By entering this site, you confirm you are of legal age.</p>
          <p className="mt-1">
            This site contains products that may not be legal in all jurisdictions.
          </p>
        </div>
      </div>
    </div>
  )
} 