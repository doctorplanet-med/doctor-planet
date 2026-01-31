'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Store,
  Globe,
  Calendar,
} from 'lucide-react'

interface DashboardData {
  stats: {
    totalProducts: number
    totalOrders: number
    totalPOSSales: number
    totalCustomers: number
    webRevenue: number
    posRevenue: number
    totalRevenue: number
    todayWeb: { revenue: number; count: number }
    todayPOS: { revenue: number; count: number }
    monthWeb: { revenue: number; count: number }
    monthPOS: { revenue: number; count: number }
  }
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    category: { name: string }
  }>
  recentOrders: Array<{
    id: string
    total: number
    status: string
    createdAt: Date
    user: { name: string | null; email: string | null; phone: string | null }
  }>
  recentPOSSales: Array<{
    id: string
    receiptNumber: string
    total: number
    createdAt: Date
    salesman: { name: string | null }
    items: Array<{ quantity: number }>
  }>
}

interface AdminDashboardProps {
  data: DashboardData
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const { stats, lowStockProducts, recentOrders, recentPOSSales } = data

  const todayTotal = stats.todayWeb.revenue + stats.todayPOS.revenue
  const monthTotal = stats.monthWeb.revenue + stats.monthPOS.revenue

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Combined Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-white/80 text-sm font-medium">All Time</span>
          </div>
          <p className="text-white/80 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-xs">Web Orders</p>
              <p className="font-semibold">{formatCurrency(stats.webRevenue)}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">POS Sales</p>
              <p className="font-semibold">{formatCurrency(stats.posRevenue)}</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-secondary-500 text-sm font-medium">Today</span>
          </div>
          <p className="text-secondary-500 text-sm">Today's Revenue</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{formatCurrency(todayTotal)}</p>
          <div className="mt-4 pt-4 border-t border-secondary-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-secondary-500 text-xs">Web ({stats.todayWeb.count})</p>
                <p className="font-semibold text-sm">{formatCurrency(stats.todayWeb.revenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-secondary-500 text-xs">POS ({stats.todayPOS.count})</p>
                <p className="font-semibold text-sm">{formatCurrency(stats.todayPOS.revenue)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* This Month's Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-secondary-500 text-sm font-medium">This Month</span>
          </div>
          <p className="text-secondary-500 text-sm">Monthly Revenue</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{formatCurrency(monthTotal)}</p>
          <div className="mt-4 pt-4 border-t border-secondary-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-secondary-500 text-xs">Web ({stats.monthWeb.count})</p>
                <p className="font-semibold text-sm">{formatCurrency(stats.monthWeb.revenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-secondary-500 text-xs">POS ({stats.monthPOS.count})</p>
                <p className="font-semibold text-sm">{formatCurrency(stats.monthPOS.revenue)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-secondary-500 text-xs">Products</p>
            <p className="text-xl font-bold text-secondary-900">{stats.totalProducts}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-secondary-500 text-xs">Web Orders</p>
            <p className="text-xl font-bold text-secondary-900">{stats.totalOrders}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-purple-100 rounded-lg">
            <Store className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-secondary-500 text-xs">POS Sales</p>
            <p className="text-xl font-bold text-secondary-900">{stats.totalPOSSales}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-orange-100 rounded-lg">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-secondary-500 text-xs">Customers</p>
            <p className="text-xl font-bold text-secondary-900">{stats.totalCustomers}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm"
        >
          <div className="p-6 border-b border-secondary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-heading font-semibold text-secondary-900">
                  Low Stock Alert
                </h2>
              </div>
              <Link href="/admin/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">All products are well stocked!</p>
            ) : (
              <ul className="space-y-4">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <div>
                      <p className="font-medium text-secondary-900">{product.name}</p>
                      <p className="text-sm text-secondary-500">{product.category.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock === 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* Recent Web Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm"
        >
          <div className="p-6 border-b border-secondary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-heading font-semibold text-secondary-900">
                  Recent Web Orders
                </h2>
              </div>
              <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">No orders yet!</p>
            ) : (
              <ul className="space-y-4">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <div>
                      <p className="font-medium text-secondary-900">
                        {order.user.name || order.user.email}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {order.user.phone && <span className="mr-2">{order.user.phone}</span>}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent POS Sales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl shadow-sm"
      >
        <div className="p-6 border-b border-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-secondary-900">
                Recent POS Sales
              </h2>
            </div>
            <Link href="/admin/pos" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentPOSSales.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No POS sales yet!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-secondary-500 uppercase tracking-wide">
                    <th className="pb-3 font-medium">Receipt #</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Cashier</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {recentPOSSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-secondary-50">
                      <td className="py-3">
                        <span className="font-mono text-sm font-medium text-secondary-900">
                          {sale.receiptNumber}
                        </span>
                      </td>
                      <td className="py-3 text-secondary-600">
                        {sale.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </td>
                      <td className="py-3 text-secondary-600">
                        {sale.salesman?.name || 'Unknown'}
                      </td>
                      <td className="py-3 text-secondary-500 text-sm">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-semibold text-secondary-900">
                          {formatCurrency(sale.total)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-heading font-bold">Quick Actions</h3>
            <p className="text-white/80 mt-1">Manage your store efficiently</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/products/new" className="btn-secondary bg-white text-primary-600 hover:bg-secondary-100">
              Add New Product
            </Link>
            <Link href="/admin/orders" className="btn-secondary bg-white/20 text-white hover:bg-white/30">
              Process Orders
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
