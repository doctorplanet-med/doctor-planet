'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Truck,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  Banknote,
  MapPin,
  Phone,
  User,
  Edit,
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart-store'

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  profession: string
  isProfileComplete: boolean
}

interface ShippingSettings {
  freeShippingMinimum: number
  shippingFee: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotal, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notes, setNotes] = useState('')
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingMinimum: 5000,
    shippingFee: 500,
  })

  const subtotal = getTotal()
  const shipping = subtotal >= shippingSettings.freeShippingMinimum ? 0 : shippingSettings.shippingFee
  const total = subtotal + shipping

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        if (session?.user?.id) {
          const profileRes = await fetch('/api/profile')
          if (profileRes.ok) {
            const data = await profileRes.json()
            setProfile(data.user)
          }
        }
        
        // Fetch shipping settings
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          setShippingSettings({
            freeShippingMinimum: settings.freeShippingMinimum || 5000,
            shippingFee: settings.shippingFee || 500,
          })
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsFetching(false)
      }
    }
    
    if (session) {
      fetchData()
    }
  }, [session])

  if (status === 'loading' || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-secondary-400" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-secondary-600 mb-8">
            Add some products to your cart before checkout.
          </p>
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // Check if profile is complete
  if (!profile?.isProfileComplete) {
    return (
      <div className="min-h-screen pt-0 sm:pt-20 bg-secondary-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-secondary-900 mb-4">
              Complete Your Profile First
            </h1>
            <p className="text-secondary-600 mb-8">
              Please complete your profile with delivery address and contact information before placing an order.
            </p>
            <Link href="/profile" className="btn-primary">
              <User className="w-5 h-5 mr-2" />
              Complete Profile
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.salePrice || item.price,
            size: item.size,
            color: item.color,
          })),
          subtotal,
          shippingFee: shipping,
          total,
          shippingAddress: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            postalCode: profile.postalCode,
            country: profile.country,
          }),
          paymentMethod: 'COD',
          notes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        clearCart()
        toast.success('Order placed successfully!')
        router.push(`/orders/${data.order.id}`)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to place order')
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-0 sm:pt-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Continue Shopping
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-8">
              Checkout
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Address (From Profile) */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-heading font-semibold">Delivery Address</h2>
                  </div>
                  <Link href="/profile" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </div>

                <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-secondary-900">{profile.name}</p>
                  <p className="text-secondary-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </p>
                  <p className="text-secondary-600">
                    {profile.address}
                    {profile.city && `, ${profile.city}`}
                    {profile.state && `, ${profile.state}`}
                    {profile.postalCode && ` ${profile.postalCode}`}
                  </p>
                  <p className="text-secondary-600">{profile.country}</p>
                </div>
              </div>

              {/* Payment Method - Cash on Delivery Only */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Payment Method</h2>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-secondary-600">Pay when you receive your order</p>
                    </div>
                    <Check className="w-6 h-6 text-green-600 ml-auto" />
                  </div>
                </div>
                
                <p className="text-sm text-secondary-500 mt-4">
                  * Please have the exact amount ready for the delivery person.
                </p>
              </div>

              {/* Delivery Notes */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Delivery Notes (Optional)</h2>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery? (e.g., Ring doorbell twice, Leave at reception desk)"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full text-lg py-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Placing Order...
                  </span>
                ) : (
                  `Place Order - PKR ${total.toFixed(0)} (COD)`
                )}
              </button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
              <h2 className="text-xl font-heading font-semibold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-80 overflow-y-auto mb-6 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-sm text-secondary-500">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-secondary-900">
                      PKR {((item.salePrice || item.price) * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-secondary-100 pt-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `PKR ${shipping.toFixed(0)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-secondary-500">
                    Free shipping on orders over PKR {shippingSettings.freeShippingMinimum}
                  </p>
                )}
                <div className="flex justify-between text-xl font-bold text-secondary-900 pt-3 border-t border-secondary-100">
                  <span>Total</span>
                  <span>PKR {total.toFixed(0)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-secondary-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  Quality guaranteed products
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Truck className="w-4 h-4 text-green-500" />
                  Fast & reliable delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Check className="w-4 h-4 text-green-500" />
                  Pay cash on delivery
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
