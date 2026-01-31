'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ShoppingBag, ChevronRight } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  product: {
    name: string
    images: string
    slug: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  paymentStatus: string
  createdAt: Date
  items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-24 bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-secondary-400" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-4">
            No orders yet
          </h1>
          <p className="text-secondary-600 mb-8">
            When you place your first order, it will appear here.
          </p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
            My Orders
          </h1>
          <p className="text-secondary-600 mb-8">
            Track and manage your orders
          </p>
        </motion.div>

        <div className="space-y-6">
          {orders.map((order, index) => {
            const images = order.items.slice(0, 3).map(
              (item) => JSON.parse(item.product.images)[0]
            )

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-secondary-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-secondary-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="font-semibold text-lg text-secondary-900">
                        PKR {order.total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {images.map((image, i) => (
                        <div
                          key={i}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-white"
                        >
                          <Image
                            src={image}
                            alt="Product"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-14 h-14 rounded-lg bg-secondary-100 border-2 border-white flex items-center justify-center">
                          <span className="text-sm font-medium text-secondary-600">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {order.items.map((item) => item.product.name).join(', ').slice(0, 50)}
                        {order.items.map((item) => item.product.name).join(', ').length > 50 && '...'}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn-ghost text-primary-600 hover:text-primary-700"
                    >
                      View Details
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Order Progress (for shipped/processing) */}
                {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary-600" />
                      <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{
                            width: order.status === 'PROCESSING' ? '50%' : '75%',
                          }}
                        />
                      </div>
                      <span className="text-sm text-secondary-600">
                        {order.status === 'PROCESSING' ? 'Processing' : 'On the way'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
