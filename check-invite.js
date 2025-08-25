const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkInviteCode() {
  console.log('🔍 Checking invite code status...')
  
  try {
    // Check the current invite code
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', 'WELCOME2024')
      .single()
    
    if (error) {
      console.error('❌ Error fetching invite:', error)
      return
    }
    
    console.log('📋 Current invite code status:')
    console.log('Code:', data.code)
    console.log('Active:', data.active)
    console.log('Uses:', data.uses)
    console.log('Max Uses:', data.max_uses)
    console.log('Expires At:', data.expires_at)
    console.log('Created At:', data.created_at)
    
    // Check if it's expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)
    const isExpired = now > expiresAt
    
    console.log('\n⏰ Expiration check:')
    console.log('Current time:', now.toISOString())
    console.log('Expires at:', expiresAt.toISOString())
    console.log('Is expired:', isExpired)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkInviteCode()
