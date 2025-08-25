'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem } from '@/lib/types'

interface CartContextType {
  cart: CartItem[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addToCart: (item: CartItem) => void
  updateQuantity: (productId: string, size: string, qty: number) => void
  removeFromCart: (productId: string, size: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    console.log('Adding to cart:', item)
    setCart(prevCart => {
      const existingItem = prevCart.find(
        cartItem => cartItem.product_id === item.product_id && cartItem.size === item.size
      )

      if (existingItem) {
        const newCart = prevCart.map(cartItem =>
          cartItem.product_id === item.product_id && cartItem.size === item.size
            ? { ...cartItem, qty: cartItem.qty + item.qty }
            : cartItem
        )
        console.log('Updated cart (existing item):', newCart)
        return newCart
      } else {
        const newCart = [...prevCart, item]
        console.log('Updated cart (new item):', newCart)
        return newCart
      }
    })
  }

  const updateQuantity = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product_id === productId && item.size === size
          ? { ...item, qty }
          : item
      )
    )
  }

  const removeFromCart = (productId: string, size: string) => {
    setCart(prevCart =>
      prevCart.filter(
        item => !(item.product_id === productId && item.size === size)
      )
    )
  }

  const clearCart = () => {
    setCart([])
    setIsOpen(false)
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price_cents * item.qty), 0)
  }

  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.qty, 0)
  }

  const setIsOpenWithLog = (open: boolean) => {
    console.log('CartContext setIsOpen called with:', open)
    setIsOpen(open)
  }

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      setIsOpen: setIsOpenWithLog,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
