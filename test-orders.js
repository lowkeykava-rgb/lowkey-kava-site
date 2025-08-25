const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testOrders() {
  console.log('Testing orders table...')

  try {
    // Test inserting an order
    const testOrder = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      items: [{ name: 'Test Product', size: 'half_gallon', qty: 1, price_cents: 2500 }],
      total_cents: 2500,
      payment: 'cashapp',
      notes: 'Test order'
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()

    if (error) {
      console.error('Error inserting test order:', error)
      return
    }

    console.log('✅ Test order created successfully:', data[0].id)
    console.log('Confirmation code:', data[0].confirmation_code)

    // Clean up - delete the test order
    await supabase
      .from('orders')
      .delete()
      .eq('id', data[0].id)

    console.log('✅ Test order cleaned up')
    console.log('🎉 Orders table is working correctly!')

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testOrders()
