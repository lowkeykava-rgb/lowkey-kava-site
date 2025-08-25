import { CartItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: CartItem[]
  totalCents: number
  paymentMethod: 'cashapp' | 'zelle'
  notes?: string
  confirmationCode: string
}

interface PaymentConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  items: CartItem[]
  totalCents: number
  confirmationCode: string
}

export async function sendOrderNotificationEmail(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, items, totalCents, paymentMethod, notes, confirmationCode } = data
  
  const itemsList = items.map(item => {
    const options = []
    if (item.strains) options.push(`Strains: ${item.strains.join(', ')}`)
    if (item.flavor) options.push(`Flavor: ${item.flavor}`)
    if (item.flavorIntensity) options.push(`Intensity: ${item.flavorIntensity}`)
    
    const optionsText = options.length > 0 ? ` (${options.join(', ')})` : ''
    return `- ${item.name} (${item.size.replace('_', ' ')}) - Qty: ${item.qty} - ${formatPrice(item.price_cents * item.qty)}${optionsText}`
  }).join('\n')

  const subject = `New Order #${orderId.slice(-6).toUpperCase()} - Lowkey Kava`
  
  const body = `
New Order Received! 🎉

Order ID: ${orderId}
Confirmation Code: ${confirmationCode}
Customer: ${customerName}
Email: ${customerEmail}
Payment Method: ${paymentMethod}
Total: ${formatPrice(totalCents)}
${notes ? `Notes: ${notes}` : ''}

Items:
${itemsList}

Next Steps:
1. Customer will send payment via ${paymentMethod}
2. Mark order as 'paid' when payment is received
3. Arrange delivery details with customer

---
Lowkey Kava
  `.trim()

  // For now, use mailto: but with better instructions
  const mailtoLink = `mailto:lowkeykava@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  // Return the mailto link for the client to open
  return mailtoLink
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData) {
  const { orderId, customerName, customerEmail, items, totalCents, confirmationCode } = data
  
  const itemsList = items.map(item => 
    `- ${item.name} (${item.size.replace('_', ' ')}) - Qty: ${item.qty} - ${formatPrice(item.price_cents * item.qty)}`
  ).join('\n')

  const subject = `Payment Received - Order #${orderId.slice(-6).toUpperCase()} - Lowkey Kava`
  
  const body = `
Payment Confirmed! 🎉

Order ID: ${orderId}
Confirmation Code: ${confirmationCode}

Hi ${customerName},

We've received your payment of ${formatPrice(totalCents)} for your order.

Your Order:
${itemsList}

Next Steps:
We'll contact you shortly to arrange delivery details.

Thank you for choosing Lowkey Kava!

---
Lowkey Kava
  `.trim()

  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailtoLink)
}
