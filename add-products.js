require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addProducts() {
  try {
    console.log('Adding sample products...')

    const products = [
      {
        name: 'Kava Half-Gallon',
        size: 'half_gallon',
        description: 'Traditional kava root beverage',
        price_cents: 2500,
        sort_order: 1
      },
      {
        name: 'Kava Gallon',
        size: 'gallon',
        description: 'Traditional kava root beverage',
        price_cents: 4500,
        sort_order: 2
      },
      {
        name: 'Kratom Tea Half-Gallon',
        size: 'half_gallon',
        description: 'Premium kratom leaf tea',
        price_cents: 3000,
        sort_order: 3
      },
      {
        name: 'Kratom Tea Gallon',
        size: 'gallon',
        description: 'Premium kratom leaf tea',
        price_cents: 5500,
        sort_order: 4
      }
    ]

    const { data, error } = await supabase
      .from('products')
      .insert(products)

    if (error) {
      throw error
    }

    console.log('✅ Products added successfully!')
    console.log('Added products:', data)

    // Also add some plans
    console.log('\nAdding sample plans...')

    const plans = [
      {
        name: 'Weekly Kava Half',
        description: 'Weekly delivery of half-gallon kava',
        interval: 'weekly',
        price_cents: 2500,
        items: JSON.stringify([{
          name: 'Kava Half-Gallon',
          size: 'half_gallon',
          qty: 1,
          price_cents: 2500
        }])
      },
      {
        name: 'Monthly Mixed',
        description: 'Monthly delivery of mixed beverages',
        interval: 'monthly',
        price_cents: 10000,
        items: JSON.stringify([
          {
            name: 'Kava Half-Gallon',
            size: 'half_gallon',
            qty: 1,
            price_cents: 2500
          },
          {
            name: 'Kratom Tea Half-Gallon',
            size: 'half_gallon',
            qty: 1,
            price_cents: 3000
          }
        ])
      }
    ]

    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert(plans)

    if (planError) {
      throw planError
    }

    console.log('✅ Plans added successfully!')
    console.log('Added plans:', planData)

  } catch (error) {
    console.error('❌ Error adding products:', error)
  }
}

addProducts()
