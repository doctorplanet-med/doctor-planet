'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Store, Receipt, User, Calendar, DollarSign, 
  Search, X, Eye, Trash2, ChevronLeft, ChevronRight,
  ShoppingBag, Printer
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

interface POSSaleItem {
  id: string
  productName: string
  quantity: number
  price: number
  size: string | null
  color: string | null
}

interface POSSale {
  id: string
  receiptNumber: string
  salesman: { name: string; email: string }
  items: POSSaleItem[]
  subtotal: number
  discount: number
  discountType: string | null
  total: number
  paymentMethod: string
  amountReceived: number | null
  changeGiven: number | null
  customerName: string | null
  customerPhone: string | null
  notes: string | null
  createdAt: string
}

export default function AdminPOSSalesPage() {
  const [sales, setSales] = useState<POSSale[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSale, setSelectedSale] = useState<POSSale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [billSettings, setBillSettings] = useState<BillSettings | null>(null)

  useEffect(() => {
    fetchSales()
    fetchBillSettings()
  }, [page])

  const fetchBillSettings = async () => {
    try {
      const res = await fetch('/api/admin/bill-settings')
      if (res.ok) {
        setBillSettings(await res.json())
      }
    } catch (error) {
      console.error('Failed to load bill settings')
    }
  }

  const handlePrintBill = (sale: POSSale) => {
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

    const logoHtml = billSettings.showLogo && billSettings.logoUrl ? '<img src="' + billSettings.logoUrl + '" alt="Logo" />' : ''
    const addressHtml = billSettings.showStoreAddress ? '<div class="text-gray">' + billSettings.storeAddress + '</div>' : ''
    const phoneHtml = billSettings.showStorePhone ? '<div class="text-gray">Tel: ' + billSettings.storePhone + '</div>' : ''
    const headerHtml = billSettings.headerText ? '<div style="margin-top:8px">' + billSettings.headerText + '</div>' : ''
    const customerNameHtml = sale.customerName ? '<div class="flex"><span>Customer:</span><span>' + sale.customerName + '</span></div>' : ''
    const customerPhoneHtml = sale.customerPhone ? '<div class="flex"><span>Phone:</span><span>' + sale.customerPhone + '</span></div>' : ''
    
    const itemsHtml = sale.items.map(item => {
      const variantHtml = (item.color || item.size) 
        ? '<div class="text-xs text-gray" style="padding-left:8px">' + (item.color || '') + (item.color && item.size ? ' / ' : '') + (item.size || '') + '</div>' 
        : ''
      return '<div><div class="flex"><span style="flex:1">' + item.productName + '</span><span style="width:30px;text-align:center">' + item.quantity + '</span><span style="width:80px;text-align:right">PKR ' + (item.price * item.quantity).toLocaleString() + '</span></div>' + variantHtml + '</div>'
    }).join('')

    const discountHtml = sale.discount > 0 ? '<div class="flex text-green"><span>Discount:</span><span>-PKR ' + sale.discount.toLocaleString() + '</span></div>' : ''
    const cashHtml = sale.amountReceived ? '<div class="flex"><span>Cash:</span><span>PKR ' + sale.amountReceived.toLocaleString() + '</span></div><div class="flex font-bold"><span>Change:</span><span>PKR ' + (sale.changeGiven || 0).toLocaleString() + '</span></div>' : ''
    const footerHtml = billSettings.footerText ? '<div class="font-bold">' + billSettings.footerText + '</div>' : ''
    const returnPolicyHtml = billSettings.showReturnPolicy ? '<div class="text-xs text-gray" style="margin-top:8px">' + billSettings.returnPolicy + '</div>' : ''
    const barcodeHtml = billSettings.showBarcode ? '<div style="margin-top:8px;height:30px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:8px;">||| ' + sale.receiptNumber + ' |||</div>' : ''

    printWindow.document.write('<!DOCTYPE html><html><head><title>Receipt - ' + sale.receiptNumber + '</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: "Courier New", monospace; padding: 10px; font-size: ' + (fontSizeMap[billSettings.fontSize] || '12px') + '; } .bill-container { width: ' + (billSettings.paperWidth === '58mm' ? '58mm' : billSettings.paperWidth === '80mm' ? '80mm' : '100%') + '; max-width: ' + (billSettings.paperWidth === 'A4' ? '210mm' : billSettings.paperWidth) + '; margin: 0 auto; } .text-center { text-align: center; } .font-bold { font-weight: bold; } .border-dashed { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; } .border-solid { border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 8px; } .flex { display: flex; justify-content: space-between; } .text-green { color: green; } .text-gray { color: #666; } .text-xs { font-size: 9px; } .mb-2 { margin-bottom: 8px; } .pt-2 { padding-top: 8px; } .space-y > * + * { margin-top: 4px; } img { max-height: 40px; margin: 0 auto 8px; display: block; } .badge { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: bold; border-radius: 9999px; background: #f3e8ff; color: #7c3aed; } @media print { body { padding: 0; } @page { margin: 5mm; } }</style></head><body><div class="bill-container"><div class="text-center border-dashed">' + logoHtml + '<div class="font-bold" style="font-size: 14px;">' + billSettings.storeName + '</div>' + addressHtml + phoneHtml + headerHtml + '</div><div class="text-center mb-2"><span class="badge">POS SALE</span></div><div class="border-dashed space-y"><div class="flex"><span>Receipt #:</span><span class="font-bold">' + sale.receiptNumber + '</span></div><div class="flex"><span>Date:</span><span>' + new Date(sale.createdAt).toLocaleString() + '</span></div><div class="flex"><span>Cashier:</span><span>' + sale.salesman.name + '</span></div>' + customerNameHtml + customerPhoneHtml + '</div><div class="border-solid"><div class="flex font-bold"><span>Item</span><span>Qty</span><span>Amount</span></div></div><div class="border-dashed space-y">' + itemsHtml + '</div><div class="border-dashed space-y"><div class="flex"><span>Subtotal:</span><span>PKR ' + sale.subtotal.toLocaleString() + '</span></div>' + discountHtml + '<div class="flex font-bold pt-2" style="border-top: 1px solid #ccc; font-size: 14px;"><span>TOTAL:</span><span>PKR ' + sale.total.toLocaleString() + '</span></div>' + cashHtml + '</div><div class="text-center">' + footerHtml + returnPolicyHtml + barcodeHtml + '<div class="text-xs text-gray" style="margin-top:8px">Powered by Doctor Planet</div></div></div><script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script></body></html>')
    printWindow.document.close()
  }

  const fetchSales = async () => {
    try {
      const res = await fetch(`/api/pos/sales?page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setSales(data.sales)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale? Stock will be restored.')) return

    try {
      const res = await fetch(`/api/pos/sales/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Sale deleted and stock restored')
        fetchSales()
      } else {
        toast.error('Failed to delete sale')
      }
    } catch (error) {
      toast.error('Failed to delete sale')
    }
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`
  }

  const filteredSales = sales.filter(sale => 
    sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.salesman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerPhone?.includes(searchTerm)
  )

  // Calculate stats
  const todaySales = sales.filter(s => 
    new Date(s.createdAt).toDateString() === new Date().toDateString()
  )
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0)
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">POS Sales</h1>
          <p className="text-secondary-600">View and manage in-store point of sale transactions</p>
        </div>
        <a
          href="/salesman/pos"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Store className="w-5 h-5" />
          Open POS
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-secondary-600">Today's Sales</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(todayTotal)}</p>
          <p className="text-xs text-secondary-500">{todaySales.length} transactions</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-secondary-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-secondary-500">{sales.length} total sales</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-secondary-600">Avg. Transaction</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(sales.length > 0 ? totalRevenue / sales.length : 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-secondary-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Store className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-secondary-600">Items Sold Today</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {todaySales.reduce((sum, s) => sum + s.items.reduce((i, item) => i + item.quantity, 0), 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt #, salesman, or customer..."
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Sales Table */}
      {filteredSales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
          <Receipt className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No POS sales yet</h3>
          <p className="text-secondary-600">Sales made through the POS will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Receipt #</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Salesman</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Payment</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-secondary-600">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-primary-600">
                      {sale.receiptNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm text-secondary-900">{sale.salesman.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {sale.customerName ? (
                      <div>
                        <p className="text-sm text-secondary-900">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-xs text-secondary-500">{sale.customerPhone}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-secondary-400">Walk-in</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-secondary-900">
                      {sale.items.reduce((sum, i) => sum + i.quantity, 0)} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-secondary-900">{formatCurrency(sale.total)}</p>
                      {sale.discount > 0 && (
                        <p className="text-xs text-green-600">
                          -{formatCurrency(sale.discount)} discount
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' :
                      sale.paymentMethod === 'CARD' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-secondary-900">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handlePrintBill(sale)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Print Bill"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200">
              <p className="text-sm text-secondary-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-secondary-300 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-secondary-300 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedSale(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">Sale Details</h2>
                  <p className="text-sm text-primary-600 font-mono">{selectedSale.receiptNumber}</p>
                </div>
                <button onClick={() => setSelectedSale(null)} className="text-secondary-400 hover:text-secondary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-500">Salesman</p>
                    <p className="font-medium">{selectedSale.salesman.name}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(selectedSale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Customer</p>
                    <p className="font-medium">{selectedSale.customerName || 'Walk-in'}</p>
                  </div>
                  <div>
                    <p className="text-secondary-500">Payment</p>
                    <p className="font-medium">{selectedSale.paymentMethod}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedSale.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-secondary-100">
                        <div>
                          <p className="font-medium text-secondary-900">{item.productName}</p>
                          <p className="text-xs text-secondary-500">
                            {item.color && `${item.color}`}
                            {item.size && ` / ${item.size}`}
                            {' × '}{item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-secondary-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span>{formatCurrency(selectedSale.subtotal)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-secondary-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(selectedSale.total)}</span>
                  </div>
                  {selectedSale.amountReceived && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Cash Received</span>
                        <span>{formatCurrency(selectedSale.amountReceived)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Change</span>
                        <span>{formatCurrency(selectedSale.changeGiven || 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                {selectedSale.notes && (
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <p className="text-sm text-secondary-600">Notes: {selectedSale.notes}</p>
                  </div>
                )}

                {/* Print Button */}
                <button
                  onClick={() => handlePrintBill(selectedSale)}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
