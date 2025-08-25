import { ProductList } from '@/components/ProductList'
import { Logo } from '@/components/Logo'

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" showTagline={false} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            MENU
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Premium Kava and Kratom beverages, available in half-gallon and gallon sizes.
            All prices include prep and local delivery.
          </p>
        </div>
        
        <ProductList />
      </div>
    </div>
  )
} 