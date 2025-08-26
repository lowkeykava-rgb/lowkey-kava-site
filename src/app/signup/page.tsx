import { Suspense } from 'react'
import { SignupForm } from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Account
          </h1>
          <p className="text-slate-600">
            Enter your invite code and details to get started
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
} 