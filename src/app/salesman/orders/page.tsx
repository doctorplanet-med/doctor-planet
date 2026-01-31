'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Package, Truck, CheckCircle, XCircle,
  Search, Eye, X, MapPin, Phone, User, Calendar, Clock
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    images: string
  }
  quantity: number
  price: number
  size: string | null
  color: string | null
}

interface Order {
  id: string
  orderNumber: string
  user: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  status: string
  shippingAddress: string
  paymentMethod: string
  paymentStatus: string
  notes: string | null
  createdAt: string
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Package },
  SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
}

export default function SalesmanOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.phone?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const processingOrders = orders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length
  const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length
  const todayOrders = orders.filter(o => 
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Online Orders</h1>
        <p className="text-secondary-600">View online orders from the website</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{pendingOrders}</p>
              <p className="text-xs text-secondary-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{processingOrders}</p>
              <p className="text-xs text-secondary-500">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{shippedOrders}</p>
              <p className="text-xs text-secondary-500">Shipped</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-900">{todayOrders}</p>
              <p className="text-xs text-secondary-500">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order #, name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
          <ShoppingBag className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No orders found</h3>
          <p className="text-secondary-600">Orders from the website will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Order</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredOrders.map((order, index) => {
                const StatusIcon = statusColors[order.status]?.icon || Clock
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-secondary-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-primary-600">
                        #{order.orderNumber.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{order.user.name}</p>
                        <p className="text-xs text-secondary-500">{order.user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-secondary-900">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-secondary-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        statusColors[order.status]?.bg || 'bg-secondary-100'
                      } ${statusColors[order.status]?.text || 'text-secondary-700'}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-secondary-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">Order Details</h2>
                  <p className="text-sm text-primary-600 font-mono">
                    #{selectedOrder.orderNumber.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    statusColors[selectedOrder.status]?.bg
                  } ${statusColors[selectedOrder.status]?.text}`}>
                    {(() => {
                      const StatusIcon = statusColors[selectedOrder.status]?.icon || Clock
                      return <StatusIcon className="w-4 h-4" />
                    })()}
                    {selectedOrder.status}
                  </span>
                  <span className="text-secondary-500 text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Customer & Shipping */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-secondary-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" /> Customer
                    </h3>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                    <p className="text-sm text-secondary-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {selectedOrder.user.phone}
                    </p>
                  </div>
                  <div className="bg-secondary-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping Address
                    </h3>
                    {(() => {
                      const addr = JSON.parse(selectedOrder.shippingAddress)
                      return (
                        <p className="text-sm text-secondary-600">
                          {addr.address}, {addr.city}<br />
                          {addr.state} {addr.postalCode}
                        </p>
                      )
                    })()}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const images = JSON.parse(item.product.images)
                      return (
                        <div key={item.id} className="flex gap-4 p-3 bg-secondary-50 rounded-lg">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                            <Image
                              src={images[0] || '/placeholder.png'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-secondary-900">{item.product.name}</p>
                            <p className="text-xs text-secondary-500">
                              {item.color && `${item.color}`}
                              {item.size && ` / ${item.size}`}
                              {' × '}{item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-secondary-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Shipping</span>
                    <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-secondary-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-secondary-50 p-4 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Payment Method</span>
                    <span className="font-medium">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-secondary-600">Payment Status</span>
                    <span className={`font-medium ${
                      selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
