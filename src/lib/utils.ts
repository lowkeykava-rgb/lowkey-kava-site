import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function generateConfirmationCode(orderId: string, createdAt: string): string {
  // Simple hash for demo - in production use crypto
  const str = orderId + createdAt
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 8)
}

export function validateInviteCode(code: string): boolean {
  return code.length >= 6 && code.length <= 20
} 