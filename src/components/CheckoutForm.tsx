'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CashAppButton } from '@/components/CashAppButton'
import { CashAppQR } from '@/components/CashAppQR'

export function CheckoutForm() {
  const router = useRouter()
  const { cart, getTotal } = useCart() // clearCart unused
  const [paymentMethod, setPaymentMethod] = useState<'cashapp' | 'zelle' | ''>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-lg mb-4">Your cart is empty</div>
        <button
          onClick={() => router.push('/menu')}
          className="bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  const handlePaymentMethodSelect = async (method: 'cashapp' | 'zelle') => {
    setPaymentMethod(method)
    setError('')
    
    // Place order automatically when payment method is selected
    if (!orderPlaced) {
      setLoading(true)
      
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error('You must be logged in to place an order')
        }

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            items: cart,
            total_cents: getTotal(),
            payment: method,
            notes: notes || null
          })
          .select()
          .single()

        if (orderError) {
          throw orderError
        }

        // Send email notifications automatically
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              customerName: user.user_metadata?.name || 'Customer',
              customerEmail: user.email || '',
              items: cart,
              totalCents: getTotal(),
              paymentMethod: method,
              notes: notes || undefined,
              confirmationCode: order.confirmation_code
            })
          })

          const emailResult = await emailResponse.json()
          
          if (!emailResult.success) {
            console.error('Email sending failed:', emailResult.error)
            // Don't fail the order if email fails
          } else {
            console.log('Emails sent successfully:', emailResult)
          }
          
        } catch (emailError) {
          console.error('Email notification failed:', emailError)
          // Don't fail the order if email fails
        }

        setOrderPlaced(true)
        console.log('Order placed successfully:', order.id)

      } catch (err) {
        console.error('Order placement error:', err)
        setError(err instanceof Error ? err.message : 'Failed to place order')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">
                    {item.name} ({item.size.replace('_', ' ')})
                  </div>
                  <div className="text-gray-400 text-sm">
                    Qty: {item.qty}
                  </div>
                </div>
                <div className="text-white font-bold">
                  {formatPrice(item.price_cents * item.qty)}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-3 mt-4">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-white">Total</div>
                <div className="text-2xl font-bold text-white">{formatPrice(getTotal())}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Payment Method</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cashapp"
                checked={paymentMethod === 'cashapp'}
                onChange={() => handlePaymentMethodSelect('cashapp')}
                disabled={loading}
                className="text-white bg-gray-700 border-gray-600 focus:ring-white"
              />
              <div>
                <div className="text-white font-medium">Cash App</div>
                <div className="text-gray-400 text-sm">
                  Pay to: $londonxsmith
                </div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="zelle"
                checked={paymentMethod === 'zelle'}
                onChange={() => handlePaymentMethodSelect('zelle')}
                disabled={loading}
                className="text-white bg-gray-700 border-gray-600 focus:ring-white"
              />
              <div>
                <div className="text-white font-medium">Zelle</div>
                <div className="text-gray-400 text-sm">
                  Send to: 305-726-3729
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Order Notes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Order Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions or delivery notes..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-center">
            Placing your order and sending email notifications...
          </div>
        )}

        {/* Success Message */}
        {orderPlaced && !loading && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-center">
            ✅ Order placed successfully! 
            <div className="mt-2 text-sm">
              Email notifications have been sent automatically to you and our team.
            </div>
          </div>
        )}

        {/* Payment Instructions (shown after payment method selection) */}
        {paymentMethod && (
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-white mb-4">Payment Instructions</h3>
            
            {/* Email Instructions */}
            <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg mb-4">
              <div className="font-bold mb-2">📧 What happens when you click &quot;Pay Now&quot;:</div>
              <div className="text-sm space-y-1">
                <div>1. Your order will be saved to our system</div>
                <div>2. Email notifications will be sent automatically</div>
                <div>3. You'll receive a confirmation email with payment details</div>
                <div>4. Our team will be notified of your order</div>
                <div>5. Then proceed with payment using the instructions below</div>
              </div>
            </div>
            
            {/* Payment Tracking Info */}
            {orderPlaced && (
              <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg mb-4">
                <div className="font-bold mb-2">📧 Order Confirmation Sent!</div>
                <div className="text-sm">
                  Check your email for order details. Once you make payment, 
                  please include your confirmation code in the memo field.
                </div>
              </div>
            )}
            
            {paymentMethod === 'cashapp' ? (
              <div className="space-y-4">
                <div className="text-gray-300">
                  <p className="mb-2">Send <span className="font-bold text-white">{formatPrice(getTotal())}</span> to:</p>
                  <p className="font-mono text-lg text-white">$londonxsmith</p>
                </div>
                
                <CashAppButton 
                  amount={getTotal() / 100} 
                  cashtag="londonxsmith"
                  memo="Lowkey Kava Order"
                  className="w-full"
                />
                
                <CashAppQR 
                  cashtag="londonxsmith"
                  amount={getTotal() / 100}
                  memo="Lowkey Kava Order"
                />
              </div>
            ) : (
              <div className="text-gray-300">
                <p className="mb-2">Send <span className="font-bold text-white">{formatPrice(getTotal())}</span> via Zelle to:</p>
                <p className="font-mono text-lg text-white">305-726-3729</p>
                <p className="text-sm text-gray-400 mt-2">
                  Please include &quot;Lowkey Kava Order&quot; in the memo field.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
