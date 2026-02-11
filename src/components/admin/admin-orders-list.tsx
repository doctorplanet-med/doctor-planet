'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  Eye,
  X,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Printer,
  Receipt,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PrintableOrderBill from '@/components/pos/printable-order-bill'

interface OrderItem {
  id: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  product: { name: string; images: string }
}

interface Order {
  id: string
  orderNumber: string
  total: number
  subtotal: number
  shippingFee: number
  status: string
  paymentStatus: string
  paymentMethod: string
  shippingAddress: string
  notes: string | null
  createdAt: Date
  user: { name: string | null; email: string | null; phone: string | null }
  items: OrderItem[]
}

interface AdminOrdersListProps {
  orders: Order[]
}

interface BillSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  headerText: string
  logoUrl: string
  footerText: string
  returnPolicy: string
  showLogo: boolean
  showStoreAddress: boolean
  showStorePhone: boolean
  showReturnPolicy: boolean
  showBarcode: boolean
  paperWidth: string
  fontSize: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersList({ orders: initialOrders }: AdminOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showBill, setShowBill] = useState(false)
  const [billSettings, setBillSettings] = useState<BillSettings | null>(null)
  const billRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBillSettings()
  }, [])

  const fetchBillSettings = async () => {
    try {
      const res = await fetch('/api/admin/bill-settings')
      if (res.ok) {
        const data = await res.json()
        setBillSettings(data)
      }
    } catch (error) {
      console.error('Failed to load bill settings')
    }
  }

  const handlePrintBill = (order: Order) => {
    if (!billSettings) {
      toast.error('Bill settings not loaded')
      return
    }

    const shippingAddress = JSON.parse(order.shippingAddress)
    const orderData = {
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      shippingAddress,
      user: order.user,
      notes: order.notes,
      createdAt: order.createdAt.toString(),
    }

    // Open print window
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for printing')
      return
    }

    const fontSizeMap: Record<string, string> = {
      small: '10px',
      normal: '12px',
      large: '14px',
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10px;
              font-size: ${fontSizeMap[billSettings.fontSize] || '12px'};
            }
            .bill-container { 
              width: ${billSettings.paperWidth === '58mm' ? '58mm' : billSettings.paperWidth === '80mm' ? '80mm' : '100%'};
              max-width: ${billSettings.paperWidth === 'A4' ? '210mm' : billSettings.paperWidth};
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-dashed { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .border-solid { border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
            .flex { display: flex; justify-content: space-between; }
            .text-green { color: green; }
            .text-gray { color: #666; }
            .text-sm { font-size: 10px; }
            .text-xs { font-size: 9px; }
            .mt-2 { margin-top: 8px; }
            .mb-2 { margin-bottom: 8px; }
            .pt-2 { padding-top: 8px; }
            .space-y > * + * { margin-top: 4px; }
            img { max-height: 40px; margin: 0 auto 8px; display: block; }
            .badge { display: inline-block; padding: 2px 8px; background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: bold; border-radius: 9999px; }
            @media print {
              body { padding: 0; }
              @page { margin: 5mm; }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="text-center border-dashed">
              ${billSettings.showLogo && billSettings.logoUrl ? `<img src="${billSettings.logoUrl}" alt="Logo" />` : ''}
              <div class="font-bold" style="font-size: 14px;">${billSettings.storeName}</div>
              ${billSettings.showStoreAddress ? `<div class="text-gray">${billSettings.storeAddress}</div>` : ''}
              ${billSettings.showStorePhone ? `<div class="text-gray">Tel: ${billSettings.storePhone}</div>` : ''}
              ${billSettings.headerText ? `<div class="mt-2">${billSettings.headerText}</div>` : ''}
            </div>
            
            <div class="text-center mb-2">
              <span class="badge">ONLINE ORDER</span>
            </div>
            
            <div class="border-dashed space-y">
              <div class="flex"><span>Order #:</span><span class="font-bold">${orderData.orderNumber}</span></div>
              <div class="flex"><span>Date:</span><span>${new Date(orderData.createdAt).toLocaleString()}</span></div>
              <div class="flex"><span>Status:</span><span class="font-bold">${orderData.status}</span></div>
              <div class="flex"><span>Payment:</span><span>${orderData.paymentMethod} (${orderData.paymentStatus})</span></div>
            </div>
            
            <div class="border-dashed">
              <div class="font-bold mb-2">Customer:</div>
              <div>${orderData.user.name || orderData.shippingAddress.name}</div>
              ${orderData.user.phone ? `<div>Tel: ${orderData.user.phone}</div>` : ''}
              ${orderData.user.email ? `<div class="text-xs">${orderData.user.email}</div>` : ''}
            </div>
            
            <div class="border-dashed">
              <div class="font-bold mb-2">Ship To:</div>
              <div>${orderData.shippingAddress.name}</div>
              <div>Tel: ${orderData.shippingAddress.phone}</div>
              <div>${orderData.shippingAddress.address}</div>
              <div>${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}</div>
              <div>${orderData.shippingAddress.country}</div>
            </div>
            
            <div class="border-solid">
              <div class="flex font-bold"><span>Item</span><span>Qty</span><span>Amount</span></div>
            </div>
            
            <div class="border-dashed space-y">
              ${orderData.items.map(item => `
                <div>
                  <div class="flex">
                    <span style="flex:1">${item.productName}</span>
                    <span style="width:30px;text-align:center">${item.quantity}</span>
                    <span style="width:80px;text-align:right">PKR ${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  ${item.color || item.size ? `<div class="text-xs text-gray" style="padding-left:8px">${item.color || ''}${item.color && item.size ? ' / ' : ''}${item.size || ''} @ PKR ${item.price.toLocaleString()} each</div>` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="border-dashed space-y">
              <div class="flex"><span>Subtotal:</span><span>PKR ${orderData.subtotal.toLocaleString()}</span></div>
              <div class="flex"><span>Shipping:</span><span>${orderData.shippingFee === 0 ? 'FREE' : `PKR ${orderData.shippingFee.toLocaleString()}`}</span></div>
              <div class="flex font-bold pt-2" style="border-top: 1px solid #ccc; font-size: 14px;">
                <span>TOTAL:</span><span>PKR ${orderData.total.toLocaleString()}</span>
              </div>
            </div>
            
            ${orderData.notes ? `<div class="border-dashed"><div class="font-bold">Notes:</div><div class="text-xs">${orderData.notes}</div></div>` : ''}
            
            <div class="text-center">
              ${billSettings.footerText ? `<div class="font-bold">${billSettings.footerText}</div>` : ''}
              ${billSettings.showReturnPolicy ? `<div class="text-xs text-gray mt-2">${billSettings.returnPolicy}</div>` : ''}
              ${billSettings.showBarcode ? `<div class="mt-2" style="height:30px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:8px;">||| ${orderData.orderNumber} |||</div>` : ''}
              <div class="text-xs text-gray mt-2">Powered by Doctor Planet</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.user.phone?.includes(search)
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Order status updated!')
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />
      case 'PROCESSING': return <Package className="w-4 h-4" />
      case 'SHIPPED': return <Truck className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-secondary-900">Orders</h1>
        <p className="text-secondary-600 mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, name, phone, or email..."
              className="input-field pl-12"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field appearance-none pr-10 min-w-[180px]"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-secondary-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-secondary-900">#{order.orderNumber}</p>
                    <p className="text-xs text-secondary-500">{order.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-secondary-900">{order.user.name || 'No name'}</p>
                    {order.user.phone && (
                      <p className="text-sm text-primary-600 font-medium">{order.user.phone}</p>
                    )}
                    <p className="text-xs text-secondary-500">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary-600">{order.items.length} items</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-secondary-900">PKR {order.total.toFixed(0)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-secondary-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Order"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="p-2 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Print Bill"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-secondary-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-secondary-500">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusColors[selectedOrder.status]}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className="input-field w-auto"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Info */}
                <div className="bg-secondary-50 rounded-xl p-4">
                  <h4 className="font-medium text-secondary-900 mb-2">Customer</h4>
                  <p className="font-semibold text-secondary-900">{selectedOrder.user.name}</p>
                  {selectedOrder.user.phone && (
                    <p className="text-primary-600 font-medium text-lg">{selectedOrder.user.phone}</p>
                  )}
                  <p className="text-secondary-500 text-sm">{selectedOrder.user.email}</p>
                </div>

                {/* Shipping Address */}
                <div className="bg-secondary-50 rounded-xl p-4">
                  <h4 className="font-medium text-secondary-900 mb-2">Shipping Address</h4>
                  {(() => {
                    const address = JSON.parse(selectedOrder.shippingAddress)
                    return (
                      <div className="space-y-1">
                        <p className="font-semibold text-secondary-900">{address.name}</p>
                        <p className="text-primary-600 font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {address.phone}
                        </p>
                        <p className="text-secondary-600">{address.address}</p>
                        <p className="text-secondary-600">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-secondary-600">{address.country}</p>
                      </div>
                    )
                  })()}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const images = JSON.parse(item.product.images)
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary-50 rounded-xl">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-secondary-900">{item.product.name}</p>
                            {(item.size || item.color) && (
                              <p className="text-sm text-secondary-500">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' | '}
                                {item.color && `Color: ${item.color}`}
                              </p>
                            )}
                            <p className="text-sm text-secondary-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-secondary-900">
                            PKR {(item.price * item.quantity).toFixed(0)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-medium text-amber-800 mb-2">Delivery Notes</h4>
                    <p className="text-amber-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t border-secondary-200 pt-4 space-y-2">
                  <div className="flex justify-between text-secondary-600">
                    <span>Subtotal</span>
                    <span>PKR {selectedOrder.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-secondary-600">
                    <span>Shipping</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'Free' : `PKR ${selectedOrder.shippingFee.toFixed(0)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-secondary-900">
                    <span>Total</span>
                    <span>PKR {selectedOrder.total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Print Bill Button */}
                <div className="pt-4">
                  <button
                    onClick={() => handlePrintBill(selectedOrder)}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    Print Invoice / Bill
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
