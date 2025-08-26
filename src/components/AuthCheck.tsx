'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth check error:', error)
      }
      
      if (session?.user) {
        setUser(session.user)
        
        // Redirect to menu if they're on the home page
        if (window.location.pathname === '/') {
          router.push('/menu')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Checking authentication...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg max-w-md mx-auto mb-4">
          ✅ You are logged in as: {user.email}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/menu')}
            className="bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Go to Menu
          </button>
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.reload()
            }}
            className="bg-slate-100 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors font-medium ml-3"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
