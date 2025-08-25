export type Product = {
  id: string
  name: string
  size: 'half_gallon' | 'gallon'
  description?: string
  price_cents: number
  active: boolean
  sort_order: number
  created_at: string
}

export type CartItem = {
  product_id: string
  name: string
  size: Product['size']
  qty: number
  price_cents: number
}

export type Order = {
  id: string
  user_id: string
  items: CartItem[]
  notes?: string
  total_cents: number
  payment: 'cashapp' | 'zelle'
  status: 'pending' | 'awaiting_payment' | 'paid' | 'fulfilled' | 'cancelled'
  confirmation_code: string
  created_at: string
}

export type Plan = {
  id: string
  name: string
  description?: string
  interval: 'weekly' | 'monthly'
  price_cents: number
  items: CartItem[]
  active: boolean
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  plan_id: string
  next_run_date: string
  active: boolean
  created_at: string
}

export type Profile = {
  user_id: string
  email: string
  name?: string
  phone?: string
  created_at: string
}

export type Invite = {
  code: string
  issued_to_email?: string
  max_uses: number
  uses: number
  expires_at?: string
  active: boolean
  created_at: string
}

export type User = {
  id: string
  email: string
  created_at: string
} 