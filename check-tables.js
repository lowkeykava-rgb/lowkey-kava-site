const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('Checking database tables...')

  const tables = ['profiles', 'invites', 'products', 'orders', 'plans', 'subscriptions', 'admins']

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error && error.code === 'PGRST116') {
        console.log(`❌ ${table} table does not exist`)
      } else if (error) {
        console.log(`❌ ${table} table error:`, error.message)
      } else {
        console.log(`✅ ${table} table exists`)
      }
    } catch (error) {
      console.log(`❌ ${table} table error:`, error.message)
    }
  }
}

checkTables()
