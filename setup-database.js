const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please check your .env.local file has:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up database...')

  try {
    // Create products table
    console.log('Creating products table...')
    const { error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productsError && productsError.code === 'PGRST116') {
      console.log('Products table does not exist. Please run the SQL manually in Supabase dashboard.')
      console.log('Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql')
      console.log('And run the contents of: supabase/migrations/001_initial_schema.sql')
      return
    }

    console.log('✅ Products table exists')

    // Insert sample products
    const products = [
      {
        name: 'Kava Half Gallon',
        size: 'half_gallon',
        description: 'Traditional kava drink',
        price_cents: 2500,
        sort_order: 1
      },
      {
        name: 'Kava Gallon',
        size: 'gallon',
        description: 'Traditional kava drink',
        price_cents: 4500,
        sort_order: 2
      },
      {
        name: 'Kratom Tea Half Gallon (Unflavored)',
        size: 'half_gallon',
        description: 'Unflavored kratom tea',
        price_cents: 2500,
        sort_order: 3
      },
      {
        name: 'Kratom Tea Gallon (Unflavored)',
        size: 'gallon',
        description: 'Unflavored kratom tea',
        price_cents: 4500,
        sort_order: 4
      },
      {
        name: 'Kratom Tea Half Gallon (Flavored)',
        size: 'half_gallon',
        description: 'Flavored kratom tea with strain selection',
        price_cents: 2800,
        sort_order: 5
      },
      {
        name: 'Kratom Tea Gallon (Flavored)',
        size: 'gallon',
        description: 'Flavored kratom tea with strain selection',
        price_cents: 5000,
        sort_order: 6
      }
    ]

    const { error: insertProductsError } = await supabase
      .from('products')
      .insert(products)

    if (insertProductsError) {
      console.error('Error inserting products:', insertProductsError)
    } else {
      console.log('✅ Sample products inserted')
    }

    // Check if invites table exists
    console.log('Checking invites table...')
    const { error: invitesError } = await supabase
      .from('invites')
      .select('*')
      .limit(1)

    if (invitesError && invitesError.code === 'PGRST116') {
      console.log('Invites table does not exist. Please run the SQL manually.')
      return
    }

    // Insert invite code
    const { error: inviteError } = await supabase
      .from('invites')
      .upsert({
        code: 'WELCOME2024',
        issued_to_email: null,
        max_uses: 100,
        uses: 0,
        expires_at: '2025-12-31T23:59:59Z',
        active: true
      }, { onConflict: 'code' })

    if (inviteError) {
      console.error('Error inserting invite:', inviteError)
    } else {
      console.log('✅ Invite code created')
    }

    // Check if orders table exists
    console.log('Checking orders table...')
    const { error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    if (ordersError && ordersError.code === 'PGRST116') {
      console.log('Orders table does not exist. Please run the SQL manually.')
      return
    }

    console.log('✅ Orders table exists')

    console.log('🎉 Database setup complete!')
    console.log('You can now test the ordering system.')

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase()
