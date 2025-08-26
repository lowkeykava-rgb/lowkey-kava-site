import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/menu'

  console.log('Auth callback called with:', { code: !!code, origin, next })

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user data from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('User authenticated:', user.email)
        
        // Check if profile exists, if not create it
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!profile) {
          // Create profile from user metadata
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email!,
              name: user.user_metadata?.name,
              phone: user.user_metadata?.phone
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }

        // Handle invite code if present
        if (user.user_metadata?.invite_code) {
          // Get current invite to increment uses
          const { data: currentInvite } = await supabase
            .from('invites')
            .select('uses')
            .eq('code', user.user_metadata.invite_code)
            .single()

          if (currentInvite) {
            const { error: inviteError } = await supabase
              .from('invites')
              .update({ uses: currentInvite.uses + 1 })
              .eq('code', user.user_metadata.invite_code)

            if (inviteError) {
              console.error('Error updating invite:', inviteError)
            }
          }
        }
      }
    } else {
      console.error('Auth error:', error)
    }
  }

  // Use the next parameter if provided, otherwise default to /menu
  const redirectPath = next || '/menu'
  const redirectUrl = new URL(redirectPath, origin)
  console.log('Redirecting to:', redirectUrl.toString())
  
  // Use a more explicit redirect with status 302
  const response = NextResponse.redirect(redirectUrl, 302)
  
  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
} 