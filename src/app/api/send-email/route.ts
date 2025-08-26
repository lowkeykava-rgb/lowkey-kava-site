import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { CartItem } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, items, totalCents, paymentMethod, notes, confirmationCode } = await request.json()

    // Create the email content
                 const itemsList = items.map((item: CartItem) => {
      const options = []
      if (item.strains) options.push(`Strains: ${item.strains.join(', ')}`)
      if (item.flavor) options.push(`Flavor: ${item.flavor}`)
      if (item.flavorIntensity) options.push(`Intensity: ${item.flavorIntensity}`)
      
      const optionsText = options.length > 0 ? ` (${options.join(', ')})` : ''
      return `- ${item.name} (${item.size.replace('_', ' ')}) - Qty: ${item.qty} - $${((item.price_cents * item.qty) / 100).toFixed(2)}${optionsText}`
    }).join('\n')

    const adminSubject = `New Order #${orderId.slice(-6).toUpperCase()} - Lowkey Kava`
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Order Received! 🎉</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Total:</strong> $${(totalCents / 100).toFixed(2)}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>

        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Items</h3>
          <pre style="white-space: pre-wrap; font-family: inherit;">${itemsList}</pre>
        </div>

        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Next Steps</h3>
          <ol>
            <li>Customer will send payment via ${paymentMethod}</li>
            <li>Mark order as 'paid' when payment is received</li>
            <li>Arrange delivery details with customer</li>
          </ol>
        </div>

        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">Lowkey Kava</p>
      </div>
    `

    const customerSubject = `Order Confirmation #${orderId.slice(-6).toUpperCase()} - Lowkey Kava`
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for your order!</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
          <p><strong>Total:</strong> $${(totalCents / 100).toFixed(2)}</p>
        </div>

        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Order</h3>
          <pre style="white-space: pre-wrap; font-family: inherit;">${itemsList}</pre>
        </div>

        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Instructions</h3>
          ${paymentMethod === 'cashapp' 
            ? `<p>Please send $${(totalCents / 100).toFixed(2)} to <strong>$londonxsmith</strong> via Cash App.</p>`
            : `<p>Please send $${(totalCents / 100).toFixed(2)} to <strong>305-726-3729</strong> via Zelle.</p>`
          }
          <p><strong>Important:</strong> Include your confirmation code (<strong>${confirmationCode}</strong>) in the memo field.</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>We'll contact you once payment is received to arrange delivery details.</p>
        </div>

        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">Thank you for choosing Lowkey Kava!</p>
      </div>
    `

    // Send admin notification email
    console.log('Sending admin email to: lowkeykava@gmail.com')
    const adminEmail = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain for now
      to: 'lowkeykava@gmail.com',
      subject: adminSubject,
      html: adminHtml,
    })
    console.log('Admin email result:', adminEmail)

    // Send customer confirmation email
    console.log('Sending customer email to:', customerEmail)
    const customerEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain for now
      to: customerEmail,
      subject: customerSubject,
      html: customerHtml,
    })
    console.log('Customer email result:', customerEmailResult)

    return NextResponse.json({ 
      success: true, 
      adminEmailId: adminEmail.data?.id,
      customerEmailId: customerEmailResult.data?.id,
      adminEmailStatus: adminEmail.error ? 'failed' : 'sent',
      customerEmailStatus: customerEmailResult.error ? 'failed' : 'sent'
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
