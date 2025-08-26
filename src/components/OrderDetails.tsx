'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/lib/types'

interface OrderDetailsProps {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrder = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white">Loading order details...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md mx-auto">
          {error || 'Order not found'}
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_payment': return 'text-yellow-400'
      case 'paid': return 'text-green-400'
      case 'fulfilled': return 'text-blue-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'awaiting_payment': return 'Awaiting Payment'
      case 'paid': return 'Paid'
      case 'fulfilled': return 'Fulfilled'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Order Status</h2>
          <span className={`font-bold ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="text-gray-300">
          <div>Order ID: {order.id}</div>
          <div>Confirmation Code: {order.confirmation_code}</div>
          <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => (
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
              <div className="text-2xl font-bold text-white">{formatPrice(order.total_cents)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {order.status === 'awaiting_payment' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Payment Instructions</h2>
          
          {order.payment === 'cashapp' ? (
            <div className="space-y-4">
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-2">Cash App Payment</h3>
                <div className="text-green-200 space-y-2">
                  <div>1. Open Cash App</div>
                  <div>2. Send <span className="font-bold">{formatPrice(order.total_cents)}</span> to:</div>
                  <div className="font-bold text-xl">{process.env.NEXT_PUBLIC_CASHAPP_TAG || '$yourcashtag'}</div>
                  <div>3. Include this code in the memo: <span className="font-bold">{order.confirmation_code}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-2">Zelle Payment</h3>
                <div className="text-blue-200 space-y-2">
                  <div>1. Open your banking app</div>
                  <div>2. Send <span className="font-bold">{formatPrice(order.total_cents)}</span> via Zelle to:</div>
                  <div className="font-bold text-xl">{process.env.NEXT_PUBLIC_ZELLE_CONTACT || 'email@example.com'}</div>
                  <div>3. Include this code in the memo: <span className="font-bold">{order.confirmation_code}</span></div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
            <div className="text-yellow-200 text-sm">
              <strong>Important:</strong> Please include the confirmation code in your payment memo so we can match your payment to your order.
            </div>
          </div>
        </div>
      )}

      {/* Order Notes */}
      {order.notes && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Order Notes</h2>
          <div className="text-gray-300">
            {order.notes}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Need Help?</h2>
        <div className="text-gray-300 space-y-2">
          <div>Email: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'}</div>
          <div>Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE || '555-555-5555'}</div>
        </div>
      </div>
    </div>
  )
}
