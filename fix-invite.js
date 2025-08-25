const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createInviteCode() {
  console.log('🎫 Creating WELCOME2024 invite code...')
  
  try {
    // First, let's see what's in the invites table
    const { data: existingInvites, error: fetchError } = await supabase
      .from('invites')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching invites:', fetchError)
      return
    }
    
    console.log('📋 Current invites in database:', existingInvites)
    
    // Create the WELCOME2024 invite code
    const { data, error } = await supabase
      .from('invites')
      .insert({
        code: 'WELCOME2024',
        max_uses: 100,
        uses: 0,
        expires_at: '2025-12-31',
        active: true
      })
    
    if (error) {
      console.error('❌ Error creating invite:', error)
      return
    }
    
    console.log('✅ Invite code WELCOME2024 created successfully!')
    console.log('📅 Expiration date: 2025-12-31')
    console.log('🎫 You can now use invite code: WELCOME2024')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createInviteCode()
