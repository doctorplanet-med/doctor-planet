'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    weekly: number
  }
  orders: {
    total: number
    monthly: number
    byStatus: { status: string; _count: { status: number } }[]
  }
  customers: {
    total: number
    new: number
  }
  topProducts: {
    productId: string
    _sum: { quantity: number | null }
    _count: { productId: number }
    product?: { id: string; name: string; price: number; images: string }
  }[]
  recentOrders: {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: Date
    user: { name: string | null; email: string | null }
  }[]
  categoryStats: {
    name: string
    productCount: number
    totalSold: number
  }[]
}

interface AdminAnalyticsProps {
  data: AnalyticsData
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminAnalytics({ data }: AdminAnalyticsProps) {
  const { revenue, orders, customers, topProducts, recentOrders, categoryStats } = data

  const stats = [
    {
      title: 'Total Revenue',
      value: `PKR ${revenue.total.toFixed(0)}`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Revenue',
      value: `PKR ${revenue.monthly.toFixed(0)}`,
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: orders.total.toString(),
      change: `${orders.monthly} this month`,
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Customers',
      value: customers.total.toString(),
      change: `+${customers.new} new`,
      isPositive: true,
      icon: Users,
      color: 'bg-primary-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900">Analytics</h1>
        <p className="text-secondary-600 mt-1">Track your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-secondary-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stat.isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={stat.isPositive ? 'text-green-500' : 'text-red-500'}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
            Orders by Status
          </h2>
          <div className="space-y-4">
            {orders.byStatus.map((item) => {
              const percentage = orders.total > 0 
                ? (item._count.status / orders.total * 100).toFixed(1) 
                : 0
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-secondary-600">
                      {item._count.status} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {orders.byStatus.length === 0 && (
              <p className="text-secondary-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
            Top Selling Products
          </h2>
          <div className="space-y-4">
            {topProducts.map((item, index) => {
              const product = item.product
              if (!product) return null
              const images = JSON.parse(product.images)
              return (
                <div key={item.productId} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary-100">
                    <Image
                      src={images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{product.name}</p>
                    <p className="text-sm text-secondary-500">PKR {product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary-900">{item._sum.quantity || 0}</p>
                    <p className="text-xs text-secondary-500">sold</p>
                  </div>
                </div>
              )
            })}
            {topProducts.length === 0 && (
              <p className="text-secondary-500 text-center py-4">No sales data yet</p>
            )}
          </div>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
            Category Performance
          </h2>
          <div className="space-y-4">
            {categoryStats.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">{category.name}</p>
                  <p className="text-sm text-secondary-500">{category.productCount} products</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{category.totalSold}</p>
                  <p className="text-xs text-secondary-500">items sold</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-lg font-heading font-semibold text-secondary-900 mb-6">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div>
                  <p className="font-medium text-secondary-900">
                    {order.user.name || order.user.email}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-secondary-900">PKR {order.total.toFixed(0)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-secondary-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
