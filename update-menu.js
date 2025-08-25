require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateMenu() {
  try {
    console.log('Updating menu with actual products...')

    // First, clear existing products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all products

    if (deleteError) {
      throw deleteError
    }

    console.log('✅ Cleared existing products')

    // Add new products matching the menu
    const products = [
      // Kratom Tea - Unflavored
      {
        name: 'Kratom Tea - Unflavored (Red/Green/White)',
        size: 'half_gallon',
        description: 'Premium kratom leaf tea. Available in Red, Green, or White strains. Mix & match strains available.',
        price_cents: 2500, // $25.00
        sort_order: 1
      },
      {
        name: 'Kratom Tea - Unflavored (Red/Green/White)',
        size: 'gallon',
        description: 'Premium kratom leaf tea. Available in Red, Green, or White strains. Mix & match strains available.',
        price_cents: 4000, // $40.00
        sort_order: 2
      },
      // Kratom Tea - Flavored
      {
        name: 'Kratom Tea - Flavored (Red/Green/White)',
        size: 'half_gallon',
        description: 'Premium kratom leaf tea with flavoring. Available in Red, Green, or White strains. Mix & match strains available.',
        price_cents: 3000, // $30.00
        sort_order: 3
      },
      {
        name: 'Kratom Tea - Flavored (Red/Green/White)',
        size: 'gallon',
        description: 'Premium kratom leaf tea with flavoring. Available in Red, Green, or White strains. Mix & match strains available.',
        price_cents: 5000, // $50.00
        sort_order: 4
      },
      // Kava
      {
        name: 'Kava',
        size: 'half_gallon',
        description: 'Traditional kava root beverage',
        price_cents: 3000, // $30.00
        sort_order: 5
      },
      {
        name: 'Kava',
        size: 'gallon',
        description: 'Traditional kava root beverage',
        price_cents: 5000, // $50.00
        sort_order: 6
      }
    ]

    const { data, error } = await supabase
      .from('products')
      .insert(products)

    if (error) {
      throw error
    }

    console.log('✅ Menu updated successfully!')
    console.log('Added products:', data)

  } catch (error) {
    console.error('❌ Error updating menu:', error)
  }
}

updateMenu()
