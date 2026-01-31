'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Store, DollarSign, ShoppingBag, TrendingUp, 
  Calendar, Receipt, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  todaySales: number
  todayTransactions: number
  weekSales: number
  weekTransactions: number
  monthSales: number
  monthTransactions: number
  recentSales: any[]
}

export default function SalesmanDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/pos/sales?limit=5')
      if (res.ok) {
        const data = await res.json()
        
        const now = new Date()
        const today = new Date(now.setHours(0, 0, 0, 0))
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const todaySalesData = data.sales.filter((s: any) => new Date(s.createdAt) >= today)
        const weekSalesData = data.sales.filter((s: any) => new Date(s.createdAt) >= weekAgo)
        const monthSalesData = data.sales.filter((s: any) => new Date(s.createdAt) >= monthAgo)

        setStats({
          todaySales: todaySalesData.reduce((sum: number, s: any) => sum + s.total, 0),
          todayTransactions: todaySalesData.length,
          weekSales: weekSalesData.reduce((sum: number, s: any) => sum + s.total, 0),
          weekTransactions: weekSalesData.length,
          monthSales: monthSalesData.reduce((sum: number, s: any) => sum + s.total, 0),
          monthTransactions: monthSalesData.length,
          recentSales: data.sales.slice(0, 5),
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {session?.user?.name}!</h1>
        <p className="text-primary-100 mb-6">Ready to make some sales today?</p>
        <Link
          href="/salesman/pos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
        >
          <Store className="w-5 h-5" />
          Open POS
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-secondary-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(stats?.todaySales || 0)}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            {stats?.todayTransactions || 0} transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-secondary-600">This Week</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(stats?.weekSales || 0)}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            {stats?.weekTransactions || 0} transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-secondary-600">This Month</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(stats?.monthSales || 0)}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            {stats?.monthTransactions || 0} transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-secondary-600">Avg. Transaction</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(stats?.monthTransactions ? stats.monthSales / stats.monthTransactions : 0)}
          </p>
          <p className="text-xs text-secondary-500 mt-1">This month</p>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Sales */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-lg font-bold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/salesman/pos"
              className="flex flex-col items-center p-6 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
            >
              <Store className="w-10 h-10 text-primary-600 mb-2" />
              <span className="font-medium text-secondary-900">New Sale</span>
            </Link>
            <Link
              href="/salesman/orders"
              className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-10 h-10 text-blue-600 mb-2" />
              <span className="font-medium text-secondary-900">Online Orders</span>
            </Link>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-secondary-900">Recent Sales</h2>
            <Link href="/salesman/pos" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          {stats?.recentSales && stats.recentSales.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <Receipt className="w-4 h-4 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{sale.receiptNumber}</p>
                      <p className="text-xs text-secondary-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-secondary-900">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-500">No sales yet today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
