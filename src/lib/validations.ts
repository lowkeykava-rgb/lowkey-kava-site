import { z } from 'zod'

export const inviteCodeSchema = z.object({
  code: z.string().min(6).max(20)
})

export const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email()
})

export const profileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().optional()
})

export const orderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    name: z.string(),
    size: z.enum(['half_gallon', 'gallon']),
    qty: z.number().int().min(1),
    price_cents: z.number().int().min(0)
  })).min(1),
  notes: z.string().optional(),
  payment: z.enum(['cashapp', 'zelle'])
})

export const subscriptionSchema = z.object({
  plan_id: z.string().uuid()
})

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  size: z.enum(['half_gallon', 'gallon']),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  active: z.boolean(),
  sort_order: z.number().int().min(0)
})

export const planSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  interval: z.enum(['weekly', 'monthly']),
  price_cents: z.number().int().min(0),
  items: z.array(z.object({
    name: z.string(),
    size: z.enum(['half_gallon', 'gallon']),
    qty: z.number().int().min(1),
    price_cents: z.number().int().min(0)
  })).min(1),
  active: z.boolean()
})

export const inviteSchema = z.object({
  code: z.string().min(6).max(20),
  issued_to_email: z.string().email().optional(),
  max_uses: z.number().int().min(1).max(100),
  expires_at: z.string().datetime().optional()
}) 