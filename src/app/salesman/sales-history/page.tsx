'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  History, Calendar, DollarSign, Receipt, Search, 
  ChevronLeft, ChevronRight, Eye, X, TrendingUp,
  Filter, Printer
} from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function SalesmanSalesHistoryPage() {
  const [sales, setSales] = useState<POSSale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<POSSale | null>(null)
  const [billSettings, setBillSettings] = useState<BillSettings | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    fetchSales()
    fetchBillSettings()
  }, [])

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/pos/sales?limit=1000')
      if (res.ok) {
        const data = await res.json()
        setSales(data.sales || [])
      }
    } catch (error) {
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

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

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  // Filter sales based on criteria
  const filteredSales = useMemo(() => {
    let result = [...sales]
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(sale => 
        sale.receiptNumber.toLowerCase().includes(term) ||
        sale.customerName?.toLowerCase().includes(term) ||
        sale.customerPhone?.includes(term)
      )
    }

    // Date filter
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateFilter) {
      case 'today':
        result = result.filter(sale => new Date(sale.createdAt) >= today)
        break
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        result = result.filter(sale => new Date(sale.createdAt) >= weekAgo)
        break
      case 'month':
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-').map(Number)
          const monthStart = new Date(year, month - 1, 1)
          const monthEnd = new Date(year, month, 0, 23, 59, 59)
          result = result.filter(sale => {
            const saleDate = new Date(sale.createdAt)
            return saleDate >= monthStart && saleDate <= monthEnd
          })
        } else {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          result = result.filter(sale => new Date(sale.createdAt) >= monthStart)
        }
        break
      case 'custom':
        if (customStartDate) {
          const start = new Date(customStartDate)
          result = result.filter(sale => new Date(sale.createdAt) >= start)
        }
        if (customEndDate) {
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59)
          result = result.filter(sale => new Date(sale.createdAt) <= end)
        }
        break
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [sales, searchTerm, dateFilter, customStartDate, customEndDate, selectedMonth])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0)
    const totalTransactions = filteredSales.length
    const totalItems = filteredSales.reduce((sum, s) => 
      sum + s.items.reduce((i, item) => i + item.quantity, 0), 0
    )
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const totalDiscount = filteredSales.reduce((sum, s) => sum + s.discount, 0)

    return { totalRevenue, totalTransactions, totalItems, avgTransaction, totalDiscount }
  }, [filteredSales])

  // Get available months for dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    sales.forEach(sale => {
      const date = new Date(sale.createdAt)
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(months).sort().reverse()
  }, [sales])

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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.receiptNumber}</title>
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
            .badge { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: bold; border-radius: 9999px; background: #f3e8ff; color: #7c3aed; }
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
              ${billSettings.headerText ? `<div style="margin-top:8px">${billSettings.headerText}</div>` : ''}
            </div>
            
            <div class="text-center mb-2">
              <span class="badge">POS SALE</span>
            </div>
            
            <div class="border-dashed space-y">
              <div class="flex"><span>Receipt #:</span><span class="font-bold">${sale.receiptNumber}</span></div>
              <div class="flex"><span>Date:</span><span>${new Date(sale.createdAt).toLocaleString()}</span></div>
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
                    <span style="width:80px;text-align:right">PKR ${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  ${item.color || item.size ? `<div class="text-xs text-gray" style="padding-left:8px">${item.color || ''}${item.color && item.size ? ' / ' : ''}${item.size || ''}</div>` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="border-dashed space-y">
              <div class="flex"><span>Subtotal:</span><span>PKR ${sale.subtotal.toLocaleString()}</span></div>
              ${sale.discount > 0 ? `<div class="flex text-green"><span>Discount:</span><span>-PKR ${sale.discount.toLocaleString()}</span></div>` : ''}
              <div class="flex font-bold pt-2" style="border-top: 1px solid #ccc; font-size: 14px;">
                <span>TOTAL:</span><span>PKR ${sale.total.toLocaleString()}</span>
              </div>
              ${sale.amountReceived ? `
                <div class="flex"><span>Cash:</span><span>PKR ${sale.amountReceived.toLocaleString()}</span></div>
                <div class="flex font-bold"><span>Change:</span><span>PKR ${(sale.changeGiven || 0).toLocaleString()}</span></div>
              ` : ''}
            </div>
            
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
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <History className="w-7 h-7 text-primary-600" />
          Sales History
        </h1>
        <p className="text-secondary-600">View your POS sales history and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-600 to-primary-700 p-5 rounded-xl text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-secondary-600">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalTransactions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-secondary-600">Avg. Sale</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.avgTransaction)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-secondary-600">Items Sold</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalItems}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-secondary-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-secondary-600">Total Discounts</span>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.totalDiscount)}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 space-y-4">
        <div className="flex items-center gap-2 text-secondary-700 font-medium">
          <Filter className="w-5 h-5" />
          Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt #, customer..."
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Select Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Month Selector (when month filter is selected) */}
          {dateFilter === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Current Month</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          )}

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="End Date"
              />
            </>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Receipt #</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Payment</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Date & Time</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-secondary-50"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-primary-600">
                      {sale.receiptNumber}
                    </span>
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
                          -{formatCurrency(sale.discount)} off
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
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No sales found for the selected filters</p>
          </div>
        )}

        {/* Summary Footer */}
        {filteredSales.length > 0 && (
          <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
            <div className="flex flex-wrap gap-6 justify-end text-sm">
              <div>
                <span className="text-secondary-600">Total Sales: </span>
                <span className="font-bold text-secondary-900">{filteredSales.length}</span>
              </div>
              <div>
                <span className="text-secondary-600">Total Revenue: </span>
                <span className="font-bold text-primary-600">{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedSale(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
                  <p className="text-secondary-500">Payment Method</p>
                  <p className="font-medium">{selectedSale.paymentMethod}</p>
                </div>
                {selectedSale.customerPhone && (
                  <div>
                    <p className="text-secondary-500">Phone</p>
                    <p className="font-medium">{selectedSale.customerPhone}</p>
                  </div>
                )}
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
                          {' × '}{item.quantity} @ {formatCurrency(item.price)}
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
        </div>
      )}
    </div>
  )
}
