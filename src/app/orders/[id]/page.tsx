'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
  Banknote,
  AlertCircle,
  Loader2,
  XCircle,
} from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  product: {
    id: string
    name: string
    slug: string
    images: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingFee: number
  total: number
  shippingAddress: string
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'amber', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
  PROCESSING: { color: 'indigo', icon: Package, label: 'Processing' },
  SHIPPED: { color: 'purple', icon: Truck, label: 'Shipped' },
  DELIVERED: { color: 'green', icon: CheckCircle, label: 'Delivered' },
  CANCELLED: { color: 'red', icon: XCircle, label: 'Cancelled' },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.order)
        } else if (response.status === 404) {
          setError('Order not found')
        } else {
          setError('Failed to load order')
        }
      } catch (err) {
        setError('Failed to load order')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchOrder()
    }
  }, [session, params.id])

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-24 bg-secondary-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-secondary-900 mb-4">
            {error || 'Order not found'}
          </h1>
          <Link href="/orders" className="btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    )
  }

  const shippingAddress = JSON.parse(order.shippingAddress)
  const statusInfo = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen pt-24 bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-secondary-500 mb-2">
                <Hash className="w-4 h-4" />
                <span className="font-mono">{order.orderNumber}</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-secondary-900">
                Order Details
              </h1>
              <div className="flex items-center gap-2 mt-2 text-secondary-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{statusInfo.label}</span>
            </div>
          </div>

          {/* Order Progress */}
          {order.status !== 'CANCELLED' && (
            <div className="mt-8 pt-6 border-t border-secondary-100">
              <div className="flex items-center justify-between">
                {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, index) => {
                  const stepConfig = statusConfig[step]
                  const StepIcon = stepConfig.icon
                  const isActive = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= index
                  const isCurrent = order.status === step

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? `bg-${stepConfig.color}-100 text-${stepConfig.color}-600` : 'bg-secondary-100 text-secondary-400'
                      } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 ${isActive ? 'text-secondary-900 font-medium' : 'text-secondary-400'}`}>
                        {stepConfig.label}
                      </span>
                      {index < 4 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${isActive ? 'bg-primary-300' : 'bg-secondary-200'}`} style={{ transform: 'translateX(50%)' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 md:col-span-2"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Order Items ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => {
                const images = JSON.parse(item.product.images)
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-secondary-50 rounded-xl">
                    <Link href={`/products/${item.product.slug}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <Image
                        src={images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                        {item.product.name}
                      </Link>
                      {(item.size || item.color) && (
                        <p className="text-sm text-secondary-500 mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <p className="text-sm text-secondary-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-secondary-900">
                      PKR {(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t border-secondary-200 space-y-3">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal</span>
                <span>PKR {order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? <span className="text-green-600">Free</span> : `PKR ${order.shippingFee.toFixed(0)}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-secondary-900 pt-3 border-t border-secondary-200">
                <span>Total</span>
                <span>PKR {order.total.toFixed(0)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Shipping Address
            </h2>
            <div className="space-y-2">
              <p className="font-semibold text-secondary-900 flex items-center gap-2">
                <User className="w-4 h-4 text-secondary-400" />
                {shippingAddress.name}
              </p>
              <p className="text-primary-600 font-medium text-lg flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {shippingAddress.phone}
              </p>
              <p className="text-secondary-600 mt-3">
                {shippingAddress.address}
                {shippingAddress.city && `, ${shippingAddress.city}`}
                {shippingAddress.state && `, ${shippingAddress.state}`}
                {shippingAddress.postalCode && ` ${shippingAddress.postalCode}`}
              </p>
              <p className="text-secondary-600">{shippingAddress.country}</p>
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary-600" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Method</span>
                <span className="font-medium text-secondary-900">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Status</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <p className="text-sm text-secondary-600 font-medium mb-2">Delivery Notes:</p>
                <p className="text-secondary-700 bg-secondary-50 rounded-lg p-3">{order.notes}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-primary-50 rounded-2xl p-6 mt-6 text-center"
        >
          <h3 className="font-semibold text-secondary-900 mb-2">Need Help?</h3>
          <p className="text-secondary-600 mb-4">
            If you have any questions about your order, please contact our support team.
          </p>
          <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
