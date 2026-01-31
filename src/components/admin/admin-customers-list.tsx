'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ChevronDown,
  Eye,
  X,
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string | null
  image: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  profession: string | null
  isProfileComplete: boolean
  createdAt: Date
  _count: { orders: number }
  orders: { total: number }[]
}

interface AdminCustomersListProps {
  customers: Customer[]
}

export default function AdminCustomersList({ customers }: AdminCustomersListProps) {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(search)
    )
  })

  const getTotalSpent = (customer: Customer) => {
    return customer.orders.reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Customers</h1>
          <p className="text-secondary-600 mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="input-field pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Profession</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Orders</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Total Spent</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-secondary-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-secondary-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {customer.image ? (
                        <Image
                          src={customer.image}
                          alt={customer.name || 'Customer'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                          {customer.name?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-secondary-900">{customer.name || 'No name'}</p>
                        <p className="text-sm text-secondary-500">
                          Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-secondary-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="text-sm text-secondary-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary-600">{customer.profession || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-secondary-900 font-medium">
                      <ShoppingBag className="w-4 h-4 text-secondary-400" />
                      {customer._count.orders}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-secondary-900">
                      PKR {getTotalSpent(customer).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.isProfileComplete 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {customer.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-secondary-100">
              <h3 className="text-xl font-heading font-semibold text-secondary-900">
                Customer Details
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selectedCustomer.image ? (
                  <Image
                    src={selectedCustomer.image}
                    alt={selectedCustomer.name || 'Customer'}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                    {selectedCustomer.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-secondary-900">
                    {selectedCustomer.name || 'No name'}
                  </h4>
                  <p className="text-secondary-500">{selectedCustomer.profession || 'No profession'}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h5 className="font-medium text-secondary-900">Contact Information</h5>
                <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
                  <p className="flex items-center gap-2 text-secondary-600">
                    <Mail className="w-4 h-4" />
                    {selectedCustomer.email}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="flex items-center gap-2 text-secondary-600">
                      <Phone className="w-4 h-4" />
                      {selectedCustomer.phone}
                    </p>
                  )}
                  {selectedCustomer.address && (
                    <p className="flex items-center gap-2 text-secondary-600">
                      <MapPin className="w-4 h-4" />
                      {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">{selectedCustomer._count.orders}</p>
                  <p className="text-sm text-secondary-600">Total Orders</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">PKR {getTotalSpent(selectedCustomer).toFixed(0)}</p>
                  <p className="text-sm text-secondary-600">Total Spent</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
