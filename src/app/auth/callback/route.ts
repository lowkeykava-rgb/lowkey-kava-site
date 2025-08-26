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
  
  // Return HTML that will redirect the user
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <meta http-equiv="refresh" content="0;url=${redirectUrl.toString()}">
        <script>
          window.location.href = '${redirectUrl.toString()}';
        </script>
      </head>
      <body>
        <p>Redirecting to menu...</p>
        <p>If you are not redirected automatically, <a href="${redirectUrl.toString()}">click here</a>.</p>
      </body>
    </html>
  `
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
} 