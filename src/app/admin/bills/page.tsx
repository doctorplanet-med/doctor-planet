'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Receipt, Store, Globe, Search, Calendar, Printer,
  Eye, ChevronLeft, ChevronRight, Filter, X
} from 'lucide-react'
import toast from 'react-hot-toast'

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

interface WebOrder {
  type: 'web'
  id: string
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  user: { name: string | null; email: string | null; phone: string | null }
  items: Array<{
    productName: string
    quantity: number
    price: number
    size: string | null
    color: string | null
  }>
  subtotal: number
  shippingFee: number
  shippingAddress: string
  notes: string | null
}

interface POSSale {
  type: 'pos'
  id: string
  receiptNumber: string
  total: number
  createdAt: string
  salesman: { name: string }
  items: Array<{
    productName: string
    quantity: number
    price: number
    size: string | null
    color: string | null
  }>
  subtotal: number
  discount: number
  discountType: string | null
  paymentMethod: string
  amountReceived: number | null
  changeGiven: number | null
  customerName: string | null
  customerPhone: string | null
}

type Bill = (WebOrder | POSSale) & { sortDate: Date }

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [billSettings, setBillSettings] = useState<BillSettings | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'web' | 'pos'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, posRes, settingsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/pos/sales?limit=1000'),
        fetch('/api/admin/bill-settings'),
      ])

      if (ordersRes.ok && posRes.ok) {
        const ordersData = await ordersRes.json()
        const posData = await posRes.json()

        // Transform web orders
        const webOrders: Bill[] = ordersData.map((order: any) => ({
          type: 'web' as const,
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          user: order.user,
          items: order.items.map((item: any) => ({
            productName: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          shippingAddress: order.shippingAddress,
          notes: order.notes,
          sortDate: new Date(order.createdAt),
        }))

        // Transform POS sales
        const posSales: Bill[] = (posData.sales || []).map((sale: any) => ({
          type: 'pos' as const,
          id: sale.id,
          receiptNumber: sale.receiptNumber,
          total: sale.total,
          createdAt: sale.createdAt,
          salesman: sale.salesman,
          items: sale.items,
          subtotal: sale.subtotal,
          discount: sale.discount,
          discountType: sale.discountType,
          paymentMethod: sale.paymentMethod,
          amountReceived: sale.amountReceived,
          changeGiven: sale.changeGiven,
          customerName: sale.customerName,
          customerPhone: sale.customerPhone,
          sortDate: new Date(sale.createdAt),
        }))

        // Combine and sort by date (newest first)
        const allBills = [...webOrders, ...posSales].sort(
          (a, b) => b.sortDate.getTime() - a.sortDate.getTime()
        )
        setBills(allBills)
      }

      if (settingsRes.ok) {
        setBillSettings(await settingsRes.json())
      }
    } catch (error) {
      toast.error('Failed to fetch bills')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const filteredBills = bills.filter(bill => {
    // Type filter
    if (typeFilter !== 'all' && bill.type !== typeFilter) return false

    // Date filter
    if (dateFilter) {
      const billDate = new Date(bill.createdAt).toISOString().split('T')[0]
      if (billDate !== dateFilter) return false
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (bill.type === 'web') {
        const webBill = bill as WebOrder
        return (
          webBill.orderNumber.toLowerCase().includes(term) ||
          webBill.user.name?.toLowerCase().includes(term) ||
          webBill.user.phone?.includes(term)
        )
      } else {
        const posBill = bill as POSSale
        return (
          posBill.receiptNumber.toLowerCase().includes(term) ||
          posBill.customerName?.toLowerCase().includes(term) ||
          posBill.customerPhone?.includes(term) ||
          posBill.salesman.name.toLowerCase().includes(term)
        )
      }
    }

    return true
  })

  const handlePrintBill = (bill: Bill) => {
    if (!billSettings) {
      toast.error('Bill settings not loaded')
      return
    }

    const fontSizeMap: Record<string, string> = {
      small: '10px',
      normal: '12px',
      large: '14px',
    }

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for printing')
      return
    }

    let billContent = ''

    if (bill.type === 'web') {
      const order = bill as WebOrder
      const shippingAddress = JSON.parse(order.shippingAddress)
      
      billContent = `
        <div class="text-center mb-2">
          <span class="badge" style="background:#dbeafe;color:#1d4ed8;">ONLINE ORDER</span>
        </div>
        
        <div class="border-dashed space-y">
          <div class="flex"><span>Order #:</span><span class="font-bold">${order.orderNumber}</span></div>
          <div class="flex"><span>Date:</span><span>${new Date(order.createdAt).toLocaleString()}</span></div>
          <div class="flex"><span>Status:</span><span class="font-bold">${order.status}</span></div>
          <div class="flex"><span>Payment:</span><span>${order.paymentMethod} (${order.paymentStatus})</span></div>
        </div>
        
        <div class="border-dashed">
          <div class="font-bold mb-2">Customer:</div>
          <div>${order.user.name || shippingAddress.name}</div>
          ${order.user.phone ? `<div>Tel: ${order.user.phone}</div>` : ''}
        </div>
        
        <div class="border-dashed">
          <div class="font-bold mb-2">Ship To:</div>
          <div>${shippingAddress.name}</div>
          <div>Tel: ${shippingAddress.phone}</div>
          <div>${shippingAddress.address}</div>
          <div>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</div>
        </div>
        
        <div class="border-solid">
          <div class="flex font-bold"><span>Item</span><span>Qty</span><span>Amount</span></div>
        </div>
        
        <div class="border-dashed space-y">
          ${order.items.map(item => `
            <div>
              <div class="flex">
                <span style="flex:1">${item.productName}</span>
                <span style="width:30px;text-align:center">${item.quantity}</span>
                <span style="width:80px;text-align:right">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="border-dashed space-y">
          <div class="flex"><span>Subtotal:</span><span>${formatCurrency(order.subtotal)}</span></div>
          <div class="flex"><span>Shipping:</span><span>${order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span></div>
          <div class="flex font-bold pt-2" style="border-top: 1px solid #ccc; font-size: 14px;">
            <span>TOTAL:</span><span>${formatCurrency(order.total)}</span>
          </div>
        </div>
      `
    } else {
      const sale = bill as POSSale
      
      billContent = `
        <div class="text-center mb-2">
          <span class="badge" style="background:#f3e8ff;color:#7c3aed;">POS SALE</span>
        </div>
        
        <div class="border-dashed space-y">
          <div class="flex"><span>Receipt #:</span><span class="font-bold">${sale.receiptNumber}</span></div>
          <div class="flex"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
          <div class="flex"><span>Cashier:</span><span>${sale.salesman.name}</span></div>
          ${sale.customerName ? `<div class="flex"><span>Customer:</span><span>${sale.customerName}</span></div>` : ''}
          ${sale.customerPhone ? `<div class="flex"><span>Phone:</span><span>${sale.customerPhone}</span></div>` : ''}
        </div>
        
        <div class="border-solid">
          <div class="flex font-bold"><span>Item</span><span>Qty</span><span>Amount</span></div>
        </div>
        
        <div class="border-dashed space-y">
          ${sale.items.map(item => `
            <div>
              <div class="flex">
                <span style="flex:1">${item.productName}</span>
                <span style="width:30px;text-align:center">${item.quantity}</span>
                <span style="width:80px;text-align:right">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="border-dashed space-y">
          <div class="flex"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
          ${sale.discount > 0 ? `<div class="flex text-green"><span>Discount:</span><span>-${formatCurrency(sale.discount)}</span></div>` : ''}
          <div class="flex font-bold pt-2" style="border-top: 1px solid #ccc; font-size: 14px;">
            <span>TOTAL:</span><span>${formatCurrency(sale.total)}</span>
          </div>
          ${sale.amountReceived ? `
            <div class="flex"><span>Cash:</span><span>${formatCurrency(sale.amountReceived)}</span></div>
            <div class="flex font-bold"><span>Change:</span><span>${formatCurrency(sale.changeGiven || 0)}</span></div>
          ` : ''}
        </div>
      `
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${bill.type === 'web' ? (bill as WebOrder).orderNumber : (bill as POSSale).receiptNumber}</title>
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
            .text-xs { font-size: 9px; }
            .mb-2 { margin-bottom: 8px; }
            .pt-2 { padding-top: 8px; }
            .space-y > * + * { margin-top: 4px; }
            img { max-height: 40px; margin: 0 auto 8px; display: block; }
            .badge { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: bold; border-radius: 9999px; }
            @media print { body { padding: 0; } @page { margin: 5mm; } }
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
            
            ${billContent}
            
            <div class="text-center">
              ${billSettings.footerText ? `<div class="font-bold">${billSettings.footerText}</div>` : ''}
              ${billSettings.showReturnPolicy ? `<div class="text-xs text-gray" style="margin-top:8px">${billSettings.returnPolicy}</div>` : ''}
              <div class="text-xs text-gray" style="margin-top:8px">Powered by Doctor Planet</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Stats
  const webBills = bills.filter(b => b.type === 'web')
  const posBills = bills.filter(b => b.type === 'pos')
  const webTotal = webBills.reduce((sum, b) => sum + b.total, 0)
  const posTotal = posBills.reduce((sum, b) => sum + b.total, 0)

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
        <h1 className="text-2xl font-bold text-secondary-900">All Bills</h1>
        <p className="text-secondary-600">View and print bills for all orders and POS sales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Receipt className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-secondary-600">Total Bills</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{bills.length}</p>
          <p className="text-sm text-secondary-500">{formatCurrency(webTotal + posTotal)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-secondary-600">Web Orders</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{webBills.length}</p>
          <p className="text-sm text-secondary-500">{formatCurrency(webTotal)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-secondary-600">POS Sales</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{posBills.length}</p>
          <p className="text-sm text-secondary-500">{formatCurrency(posTotal)}</p>
        </div>
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-5 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-sm text-white/80">Combined Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(webTotal + posTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order #, receipt #, customer..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'web' | 'pos')}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="web">Web Orders</option>
              <option value="pos">POS Sales</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {(searchTerm || typeFilter !== 'all' || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('all')
                  setDateFilter('')
                }}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Bill #</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredBills.map((bill, index) => (
                <motion.tr
                  key={bill.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4">
                    {bill.type === 'web' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Globe className="w-3 h-3" />
                        Web
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <Store className="w-3 h-3" />
                        POS
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono font-medium text-secondary-900">
                      {bill.type === 'web' ? (bill as WebOrder).orderNumber : (bill as POSSale).receiptNumber}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {bill.type === 'web' ? (
                      <div>
                        <p className="font-medium text-secondary-900">{(bill as WebOrder).user.name || 'N/A'}</p>
                        <p className="text-sm text-secondary-500">{(bill as WebOrder).user.phone}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-secondary-900">{(bill as POSSale).customerName || 'Walk-in'}</p>
                        <p className="text-sm text-secondary-500">{(bill as POSSale).customerPhone || '-'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {bill.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-secondary-900">{formatCurrency(bill.total)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-secondary-600">{new Date(bill.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-secondary-500">{new Date(bill.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrintBill(bill)}
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

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No bills found</p>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBill(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectedBill.type === 'web' ? (
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Store className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-secondary-900">
                    {selectedBill.type === 'web' ? 'Web Order' : 'POS Sale'}
                  </h3>
                  <p className="text-sm text-secondary-500 font-mono">
                    {selectedBill.type === 'web' 
                      ? (selectedBill as WebOrder).orderNumber 
                      : (selectedBill as POSSale).receiptNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {selectedBill.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="font-medium text-secondary-900">{item.productName}</p>
                      <p className="text-sm text-secondary-500">
                        {item.color}{item.color && item.size && ' / '}{item.size}
                        {' × '}{item.quantity} @ {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-secondary-200 pt-4 space-y-2">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedBill.subtotal)}</span>
                </div>
                {selectedBill.type === 'web' && (
                  <div className="flex justify-between text-secondary-600">
                    <span>Shipping</span>
                    <span>{(selectedBill as WebOrder).shippingFee === 0 ? 'FREE' : formatCurrency((selectedBill as WebOrder).shippingFee)}</span>
                  </div>
                )}
                {selectedBill.type === 'pos' && (selectedBill as POSSale).discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency((selectedBill as POSSale).discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-secondary-200">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(selectedBill.total)}</span>
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={() => handlePrintBill(selectedBill)}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Bill
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
