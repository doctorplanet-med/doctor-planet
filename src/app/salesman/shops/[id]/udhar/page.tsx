'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Receipt, DollarSign, Calendar, FileText, CheckCircle, AlertCircle, Clock, XCircle, Trash2, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Shop {
  id: string
  name: string
  ownerName: string | null
  phone: string | null
  address: string | null
}

interface UdharTransaction {
  id: string
  items: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  dueDate: string | null
  notes: string | null
  createdAt: string
  payments: UdharPayment[]
}

interface UdharPayment {
  id: string
  amount: number
  paymentMethod: string
  notes: string | null
  createdAt: string
}

export default function ShopUdharPage() {
  const params = useParams()
  const shopId = params.id as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [transactions, setTransactions] = useState<UdharTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<UdharTransaction | null>(null)
  
  const [formData, setFormData] = useState({
    items: [{ description: '', quantity: 1, price: 0 }],
    dueDate: '',
    notes: ''
  })

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: ''
  })

  useEffect(() => {
    if (shopId) {
      fetchShop()
      fetchTransactions()
    }
  }, [shopId])

  const fetchShop = async () => {
    try {
      const res = await fetch(`/api/shops/${shopId}`)
      if (res.ok) {
        const data = await res.json()
        setShop(data)
      }
    } catch (error) {
      toast.error('Failed to load shop')
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/udhar?shopId=${shopId}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
    })
  }

  const removeItemRow = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const totalAmount = calculateTotal()

    if (totalAmount <= 0) {
      toast.error('Total amount must be greater than 0')
      return
    }

    try {
      const res = await fetch('/api/udhar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          items: formData.items,
          totalAmount,
          dueDate: formData.dueDate || null,
          notes: formData.notes || null
        })
      })

      if (res.ok) {
        toast.success('Udhar transaction added!')
        setShowAddModal(false)
        setFormData({
          items: [{ description: '', quantity: 1, price: 0 }],
          dueDate: '',
          notes: ''
        })
        fetchTransactions()
      } else {
        toast.error('Failed to add transaction')
      }
    } catch (error) {
      toast.error('Failed to add transaction')
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTransaction) return

    const amount = parseFloat(paymentData.amount)
    if (amount <= 0 || amount > selectedTransaction.remainingAmount) {
      toast.error('Invalid payment amount')
      return
    }

    try {
      const res = await fetch(`/api/udhar/${selectedTransaction.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes || null
        })
      })

      if (res.ok) {
        toast.success('Payment recorded!')
        setShowPaymentModal(false)
        setPaymentData({ amount: '', paymentMethod: 'CASH', notes: '' })
        fetchTransactions()
      } else {
        toast.error('Failed to add payment')
      }
    } catch (error) {
      toast.error('Failed to add payment')
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Delete this Udhar transaction? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/udhar/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Transaction deleted')
        fetchTransactions()
      } else {
        toast.error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      PAID: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
      PARTIAL: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Partial' },
      UNPAID: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Unpaid' },
      OVERDUE: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Overdue' }
    }
    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.UNPAID
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    )
  }

  const totalUdhar = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalPaid = transactions.reduce((sum, t) => sum + t.paidAmount, 0)
  const totalRemaining = transactions.reduce((sum, t) => sum + t.remainingAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!shop) {
    return <div className="text-center py-12">Shop not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/salesman/shops"
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Udhar Account</h1>
            <p className="text-secondary-600 mt-1">
              {shop.name} {shop.ownerName && `(${shop.ownerName})`}
            </p>
            {shop.phone && <p className="text-sm text-secondary-500">{shop.phone}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Udhar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <p className="text-orange-600 text-sm font-medium mb-1">Total Udhar</p>
          <p className="text-3xl font-bold text-orange-700">PKR {totalUdhar.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <p className="text-green-600 text-sm font-medium mb-1">Total Paid</p>
          <p className="text-3xl font-bold text-green-700">PKR {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <p className="text-red-600 text-sm font-medium mb-1">Remaining Balance</p>
          <p className="text-3xl font-bold text-red-700">PKR {totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-secondary-200">
        <div className="p-4 border-b border-secondary-200">
          <h2 className="font-bold text-secondary-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-500 font-medium">No transactions yet</p>
            <p className="text-sm text-secondary-400 mt-1">Add your first Udhar transaction</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {transactions.map((transaction) => {
              const items = JSON.parse(transaction.items)
              return (
                <div key={transaction.id} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(transaction.status)}
                        <span className="text-xs text-secondary-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-600 space-y-1">
                        <p className="font-medium text-secondary-900">
                          {items.length} item{items.length !== 1 ? 's' : ''} - PKR {transaction.totalAmount.toLocaleString()}
                        </p>
                        {transaction.paidAmount > 0 && (
                          <p className="text-green-600">
                            Paid: PKR {transaction.paidAmount.toLocaleString()}
                          </p>
                        )}
                        {transaction.remainingAmount > 0 && (
                          <p className="text-orange-600 font-medium">
                            Remaining: PKR {transaction.remainingAmount.toLocaleString()}
                          </p>
                        )}
                        {transaction.dueDate && (
                          <p className="text-xs text-secondary-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(transaction.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setShowDetailsModal(true)
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transaction.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction)
                            setShowPaymentModal(true)
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Add Payment
                        </button>
                      )}
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Udhar Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-900">Add Udhar Transaction</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-secondary-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-secondary-700">Items</label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                          className="flex-1 px-3 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                          min="1"
                          required
                          className="w-20 px-3 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          required
                          className="w-28 px-3 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm font-medium text-primary-700">
                      Total: PKR {calculateTotal().toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-secondary-200">
                <h2 className="text-xl font-bold text-secondary-900">Add Payment</h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Remaining: PKR {selectedTransaction.remainingAmount.toLocaleString()}
                </p>
              </div>

              <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    placeholder="Enter amount"
                    max={selectedTransaction.remainingAmount}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Notes</label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setPaymentData({ amount: '', paymentMethod: 'CASH', notes: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-secondary-900">Transaction Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedTransaction(null)
                  }}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedTransaction.status)}
                  <span className="text-sm text-secondary-500">
                    {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-medium text-secondary-900 mb-2">Items</h3>
                  <div className="bg-secondary-50 rounded-lg p-4 space-y-2">
                    {JSON.parse(selectedTransaction.items).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description} (x{item.quantity})</span>
                        <span className="font-medium">PKR {(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Total Amount:</span>
                    <span className="font-bold text-secondary-900">PKR {selectedTransaction.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Paid Amount:</span>
                    <span className="font-medium text-green-600">PKR {selectedTransaction.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-secondary-200">
                    <span className="text-secondary-600">Remaining:</span>
                    <span className="font-bold text-orange-600">PKR {selectedTransaction.remainingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment History */}
                {selectedTransaction.payments.length > 0 && (
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-2">Payment History</h3>
                    <div className="space-y-2">
                      {selectedTransaction.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-green-700">PKR {payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-green-600">{payment.paymentMethod}</p>
                            {payment.notes && <p className="text-xs text-secondary-500 mt-1">{payment.notes}</p>}
                          </div>
                          <span className="text-xs text-secondary-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-2">Notes</h3>
                    <p className="text-sm text-secondary-600 bg-secondary-50 rounded-lg p-3">
                      {selectedTransaction.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
