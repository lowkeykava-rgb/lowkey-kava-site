import { OrderDetails } from '@/components/OrderDetails'
import { Logo } from '@/components/Logo'

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderPage({ params }: OrderPageProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="md" showTagline={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Order Confirmation
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Thank you for your order! Here are your payment instructions.
          </p>
        </div>
        
        <OrderDetails orderId={params.id} />
      </div>
    </div>
  )
}
