'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import { Logo } from '@/components/Logo'
import { CartItem } from '@/lib/types'

interface Order {
  id: string
  user_id: string
  items: CartItem[]
  total_cents: number
  payment: 'cashapp' | 'zelle'
  status: 'pending' | 'awaiting_payment' | 'paid' | 'fulfilled' | 'cancelled'
  confirmation_code: string
  notes?: string
  created_at: string
  user_email?: string
  user_name?: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(email, name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const ordersWithUserInfo = data?.map(order => ({
        ...order,
        user_email: order.profiles?.email,
        user_name: order.profiles?.name
      })) || []

      setOrders(ordersWithUserInfo)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // If marking as paid, send payment confirmation email
      if (newStatus === 'paid') {
        const order = orders.find(o => o.id === orderId)
        if (order && order.user_email) {
          try {
            await sendPaymentConfirmationEmail({
              orderId: order.id,
              customerName: order.user_name || 'Customer',
              customerEmail: order.user_email,
              items: order.items,
              totalCents: order.total_cents,
              confirmationCode: order.confirmation_code
            })
          } catch (emailError) {
            console.error('Payment confirmation email failed:', emailError)
            // Don't fail the status update if email fails
          }
        }
      }

      // Refresh orders
      await fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600'
      case 'awaiting_payment': return 'bg-orange-600'
      case 'paid': return 'bg-green-600'
      case 'fulfilled': return 'bg-blue-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'awaiting_payment': return 'Awaiting Payment'
      case 'paid': return 'Paid'
      case 'fulfilled': return 'Fulfilled'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-white mt-4">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage orders and track payments</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-white font-medium">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {order.user_name || 'Customer'} • {order.user_email}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {formatPrice(order.total_cents)}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-gray-300 text-sm mb-1">Items:</div>
                    <div className="text-gray-400 text-sm">
                      {order.items.map((item: CartItem, index: number) => (
                        <div key={index}>
                          {item.name} ({item.size.replace('_', ' ')}) - Qty: {item.qty}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-gray-300 text-sm mb-1">Payment Details:</div>
                    <div className="text-gray-400 text-sm">
                      <div>Method: {order.payment.toUpperCase()}</div>
                      <div>Confirmation Code: <span className="font-mono bg-gray-600 px-1 rounded">{order.confirmation_code}</span></div>
                      {order.notes && <div>Notes: {order.notes}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'paid')}
                          disabled={updating === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {updating === order.id ? 'Updating...' : 'Mark as Paid'}
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updating === order.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                        disabled={updating === order.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {updating === order.id ? 'Updating...' : 'Mark as Fulfilled'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
