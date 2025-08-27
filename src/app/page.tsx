import { Suspense } from 'react'
import { AgeGate } from '@/components/AgeGate'
import { AuthOptions } from '@/components/AuthOptions'
import { Logo } from '@/components/Logo'
import { AuthRedirect } from '@/components/AuthRedirect'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Premium Kava and Kratom beverages delivered to your door. 
            Invite-only access for quality and community.
          </p>
        </div>
        
        <AgeGate>
          <AuthOptions />
        </AgeGate>
      </div>
    </div>
  )
}
