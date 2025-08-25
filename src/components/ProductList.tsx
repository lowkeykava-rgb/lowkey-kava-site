'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, CartItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'
import { CartSheet } from '@/components/CartSheet'

type Strain = 'red' | 'green' | 'white' | 'mix'
type Flavor = 'strawberry' | 'mango' | 'peach'
type FlavorIntensity = 'light' | 'regular'

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStrains, setSelectedStrains] = useState<Record<string, Strain>>({})
  const [selectedFlavors, setSelectedFlavors] = useState<Record<string, Flavor>>({})
  const [selectedFlavorIntensity, setSelectedFlavorIntensity] = useState<Record<string, FlavorIntensity>>({})
  const { addToCart, isOpen, setIsOpen, getItemCount, cart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  const handleAddToCart = (product: Product) => {
    const strain = selectedStrains[product.id]
    const flavor = selectedFlavors[product.id]
    const flavorIntensity = selectedFlavorIntensity[product.id]
    
    if (product.name.includes('Kratom') && !strain) {
      alert('Please select a strain for Kratom products')
      return
    }
    
    if (product.name.includes('Flavored') && !flavor) {
      alert('Please select a flavor for flavored products')
      return
    }
    
    if (product.name.includes('Flavored') && !flavorIntensity) {
      alert('Please select flavor intensity for flavored products')
      return
    }

    let productName = product.name
    if (strain) {
      productName += ` (${strain.charAt(0).toUpperCase() + strain.slice(1)})`
    }
    if (flavor) {
      productName += ` - ${flavor.charAt(0).toUpperCase() + flavor.slice(1)}`
    }
    if (flavorIntensity) {
      productName += ` (${flavorIntensity === 'regular' ? 'Regular' : 'Light'} Flavor)`
    }
    
    const cartItem: CartItem = {
      product_id: product.id,
      name: productName,
      size: product.size,
      qty: 1,
      price_cents: product.price_cents
    }
    addToCart(cartItem)
    
    // Show success message
    setShowSuccess(product.id)
    setTimeout(() => setShowSuccess(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-600">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          {error}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-600">No products available at the moment.</div>
      </div>
    )
  }

  // Group products by type
  const kratomProducts = products.filter(p => p.name.includes('Kratom'))
  const kavaProducts = products.filter(p => p.name.includes('Kava') && !p.name.includes('Kratom'))

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Cart Button */}
      <div className="flex justify-end">
        <button
          key={cart.length} // Force re-render when cart changes
          onClick={() => {
            console.log('Cart button clicked, setting isOpen to true')
            console.log('Current isOpen state:', isOpen)
            setIsOpen(true)
            console.log('Set isOpen to true')
          }}
          className="relative bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2 cursor-pointer"
        >
          <ShoppingCart size={20} />
          <span>Cart ({getItemCount()})</span>
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Kratom Tea Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          KRATOM TEA
        </h2>
        <p className="text-gray-300 mb-2">
          <span className="text-red-400">Red</span>, <span className="text-green-400">Green</span>, or <span className="text-white">White</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Unflavored */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Unflavored</h3>
            <div className="space-y-4">
                          {kratomProducts.filter(p => p.name.includes('Unflavored')).map((product) => (
              <div key={product.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {product.size === 'half_gallon' ? '½ Gallon' : '1 Gallon'}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {formatPrice(product.price_cents)}
                  </span>
                </div>
                
                {/* Strain Selection */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">Select Strain:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['red', 'green', 'white', 'mix'] as Strain[]).map((strain) => (
                      <label key={strain} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`strain-${product.id}`}
                          value={strain}
                          checked={selectedStrains[product.id] === strain}
                          onChange={(e) => setSelectedStrains(prev => ({
                            ...prev,
                            [product.id]: e.target.value as Strain
                          }))}
                          className="text-white bg-gray-700 border-gray-600 focus:ring-white"
                        />
                        <span className="text-sm text-white capitalize">
                          {strain === 'red' && <span className="text-red-400">Red</span>}
                          {strain === 'green' && <span className="text-green-400">Green</span>}
                          {strain === 'white' && <span className="text-white">White</span>}
                          {strain === 'mix' && <span className="text-purple-400">Mix</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full px-4 py-2 rounded transition-colors font-medium ${
                    showSuccess === product.id 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {showSuccess === product.id ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            ))}
            </div>
          </div>

          {/* Flavored */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Flavored</h3>
            <div className="space-y-4">
                          {kratomProducts.filter(p => p.name.includes('Flavored')).map((product) => (
              <div key={product.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {product.size === 'half_gallon' ? '½ Gallon' : '1 Gallon'}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {formatPrice(product.price_cents)}
                  </span>
                </div>
                
                {/* Strain Selection */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">Select Strain:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['red', 'green', 'white', 'mix'] as Strain[]).map((strain) => (
                      <label key={strain} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`strain-${product.id}`}
                          value={strain}
                          checked={selectedStrains[product.id] === strain}
                          onChange={(e) => setSelectedStrains(prev => ({
                            ...prev,
                            [product.id]: e.target.value as Strain
                          }))}
                          className="text-white bg-gray-700 border-gray-600 focus:ring-white"
                        />
                        <span className="text-sm text-white capitalize">
                          {strain === 'red' && <span className="text-red-400">Red</span>}
                          {strain === 'green' && <span className="text-green-400">Green</span>}
                          {strain === 'white' && <span className="text-white">White</span>}
                          {strain === 'mix' && <span className="text-purple-400">Mix</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Flavor Selection */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">Select Flavor:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['strawberry', 'mango', 'peach'] as Flavor[]).map((flavor) => (
                      <label key={flavor} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`flavor-${product.id}`}
                          value={flavor}
                          checked={selectedFlavors[product.id] === flavor}
                          onChange={(e) => setSelectedFlavors(prev => ({
                            ...prev,
                            [product.id]: e.target.value as Flavor
                          }))}
                          className="text-white bg-gray-700 border-gray-600 focus:ring-white"
                        />
                        <span className="text-sm text-white capitalize">
                          {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Flavor Intensity Selection */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">Flavor Intensity:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'regular'] as FlavorIntensity[]).map((intensity) => (
                      <label key={intensity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`intensity-${product.id}`}
                          value={intensity}
                          checked={selectedFlavorIntensity[product.id] === intensity}
                          onChange={(e) => setSelectedFlavorIntensity(prev => ({
                            ...prev,
                            [product.id]: e.target.value as FlavorIntensity
                          }))}
                          className="text-white bg-gray-700 border-gray-600 focus:ring-white"
                        />
                        <span className="text-sm text-white">
                          {intensity === 'regular' ? 'Regular Flavor' : 'Light Flavor'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full px-4 py-2 rounded transition-colors font-medium ${
                    showSuccess === product.id 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {showSuccess === product.id ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mt-4">Mix & match strains available.</p>
      </div>

      {/* Kava Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          KAVA
        </h2>
        <div className="max-w-md mx-auto space-y-4">
          {kavaProducts.map((product) => (
            <div key={product.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <div>
                <span className="text-white">
                  {product.size === 'half_gallon' ? '½ Gallon' : '1 Gallon'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-white">
                  {formatPrice(product.price_cents)}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    showSuccess === product.id 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {showSuccess === product.id ? '✓ Added!' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="text-center">
        <div className="border border-white rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white mb-2">COMING SOON:</h3>
          <p className="text-gray-300">
            <span className="text-red-400">Red</span>, <span className="text-green-400">Green</span>, and <span className="text-white">White Powder</span>
          </p>
        </div>
      </div>

      {/* Cart Sheet */}
      <CartSheet />
    </div>
  )
} 