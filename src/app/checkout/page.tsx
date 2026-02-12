'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  Mail,
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

interface CheckoutFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  saveForNextTime: boolean
}

// Mobile Product Item Component with dropdown details
function MobileProductItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-secondary-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center gap-3 bg-white hover:bg-secondary-50 transition-colors"
      >
        {/* Product Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-secondary-900 truncate">{item.name}</p>
          <p className="text-xs text-secondary-500 mt-0.5">Qty: {item.quantity}</p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-secondary-900">
            PKR {(((item.salePrice || item.price) + (item.customizationPrice || 0)) * item.quantity).toFixed(0)}
          </p>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-secondary-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-secondary-400" />
          )}
        </div>
      </button>

      {/* Dropdown Details */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-secondary-200"
          >
            <div className="p-3 bg-secondary-50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary-600">Unit Price:</span>
                <span className="font-medium text-secondary-900">
                  PKR {((item.salePrice || item.price) + (item.customizationPrice || 0)).toFixed(0)}
                </span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-secondary-600">Quantity:</span>
                <span className="font-medium text-secondary-900">{item.quantity}</span>
              </div>

              {item.size && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary-600">Size:</span>
                  <span className="font-medium text-secondary-900">{item.size}</span>
                </div>
              )}

              {item.color && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary-600">Color:</span>
                  <span className="font-medium text-secondary-900">{item.color}</span>
                </div>
              )}

              {item.customization && (
                <div className="mt-2 p-2 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-xs font-medium text-primary-700 mb-1">Customized</p>
                  {Object.entries(item.customization).map(([category, options]) => (
                    <div key={category} className="text-[10px] text-secondary-600 mb-1">
                      <span className="font-medium">{category}:</span>{' '}
                      {Object.entries(options).map(([opt, val], idx) => (
                        <span key={opt}>
                          {opt}: {val}
                          {idx < Object.entries(options).length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  ))}
                  {item.customizationPrice && (
                    <p className="text-xs text-primary-600 font-medium mt-1">
                      +PKR {item.customizationPrice.toFixed(0)}
                    </p>
                  )}
                </div>
              )}

              {item.salePrice && item.salePrice < item.price && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary-600">Original Price:</span>
                  <span className="font-medium text-secondary-500 line-through">
                    PKR {item.price.toFixed(0)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs pt-2 border-t border-secondary-200">
                <span className="text-secondary-700 font-medium">Subtotal:</span>
                <span className="font-bold text-primary-600">
                  PKR {(((item.salePrice || item.price) + (item.customizationPrice || 0)) * item.quantity).toFixed(0)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    saveForNextTime: false,
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
        // Fetch profile to pre-fill if available
        if (session?.user?.id) {
          const profileRes = await fetch('/api/profile')
          if (profileRes.ok) {
            const data = await profileRes.json()
            setProfile(data.user)
            // Pre-fill form with profile data if available
            if (data.user) {
              setFormData({
                name: data.user.name || '',
                email: data.user.email || session.user.email || '',
                phone: data.user.phone || '',
                address: data.user.address || '',
                city: data.user.city || '',
                state: data.user.state || '',
                postalCode: data.user.postalCode || '',
                country: data.user.country || 'Pakistan',
                saveForNextTime: false,
              })
            }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number')
      return false
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your delivery address')
      return false
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      // If "save for next time" is checked, update profile
      if (formData.saveForNextTime) {
        try {
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
            }),
          })
        } catch (err) {
          console.error('Failed to save profile:', err)
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: (item.salePrice || item.price) + (item.customizationPrice || 0),
            size: item.size,
            color: item.color,
            customization: item.customization,
            customizationPrice: item.customizationPrice,
          })),
          subtotal,
          shippingFee: shipping,
          total,
          shippingAddress: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
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
          className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 mb-6 sm:mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
          {/* Left Column - Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 300 1234567"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold">Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House no., Street name"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-secondary-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-secondary-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-secondary-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  {/* Save for next time checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="saveForNextTime"
                        checked={formData.saveForNextTime}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">
                        Save this information for next time
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold">Payment Method</h2>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-secondary-600">Pay when you receive your order</p>
                    </div>
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  </div>
                </div>
                
                <p className="text-sm text-secondary-500 mt-4">
                  * Please have the exact amount ready for the delivery person.
                </p>
              </div>

              {/* Delivery Notes */}
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Truck className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold">Delivery Notes (Optional)</h2>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery? (e.g., Ring doorbell twice, Leave at reception desk)"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Submit Button - Desktop */}
              <button
                type="submit"
                disabled={isLoading}
                className="hidden lg:flex btn-primary w-full text-lg py-4 items-center justify-center"
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

          {/* Right Column - Order Summary (Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:block"
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
                      <p className="font-semibold text-secondary-900 mt-1">
                        PKR {(((item.salePrice || item.price) + (item.customizationPrice || 0)) * item.quantity).toFixed(0)}
                      </p>
                    </div>
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

          {/* Mobile Products List */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-lg font-heading font-semibold text-secondary-900 mb-4">
                Order Items ({items.length})
              </h3>

              {/* Products List */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <MobileProductItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>

              {/* Totals Section */}
              <div className="space-y-3 pt-4 border-t-2 border-secondary-200">
                <div className="flex justify-between text-sm text-secondary-600">
                  <span>Subtotal</span>
                  <span className="font-medium">PKR {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">Free</span>
                    ) : (
                      `PKR ${shipping.toFixed(0)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-secondary-500">
                    Free shipping on orders over PKR {shippingSettings.freeShippingMinimum}
                  </p>
                )}
                <div className="flex justify-between text-xl font-bold text-secondary-900 pt-3 border-t border-secondary-200">
                  <span>Total</span>
                  <span className="text-primary-600">PKR {total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Mobile Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="btn-primary w-full text-lg py-4 mt-6"
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
          </div>
        </div>
      </div>
    </div>
  )
}
