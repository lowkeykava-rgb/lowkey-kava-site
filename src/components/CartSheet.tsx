'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingCart } from 'lucide-react'

export function CartSheet() {
  const {
    cart,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    getTotal,
    // getItemCount // Unused variable
  } = useCart()

  console.log('CartSheet render - isOpen:', isOpen, 'cart length:', cart.length)

  if (!isOpen) {
    console.log('CartSheet returning null because isOpen is false')
    return null
  }

  console.log('CartSheet rendering modal')

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Your Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.size}-${index}`}
                    className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">
                        {item.size.replace('_', ' ')} • {formatPrice(item.price_cents)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.qty - 1)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-slate-900">{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.qty + 1)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        {formatPrice(item.price_cents * item.qty)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.size)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-900">Total:</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(getTotal())}
                </span>
              </div>
              
              <div className="text-sm text-slate-500 mb-4">
                <p>Prices include prep & local delivery window TBD via text</p>
              </div>
              
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors font-medium text-center block"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 