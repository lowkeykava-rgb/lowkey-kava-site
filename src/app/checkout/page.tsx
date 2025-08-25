import { CheckoutForm } from '@/components/CheckoutForm'
import { Logo } from '@/components/Logo'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="md" showTagline={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Checkout
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Review your order and select your payment method.
          </p>
        </div>
        
        <CheckoutForm />
      </div>
    </div>
  )
}
