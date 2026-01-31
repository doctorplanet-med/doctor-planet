'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

export default function CartSidebar() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotal } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
          />

          {/* Sidebar - Adjusted for mobile to show navbar and bottom bar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-14 sm:top-0 bottom-14 sm:bottom-0 w-full sm:w-[450px] sm:h-full bg-white shadow-2xl z-[45] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-100">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                <h2 className="font-heading font-semibold text-lg sm:text-xl">Your Cart</h2>
                <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-secondary-400" />
                  </motion.div>
                  <h3 className="font-heading font-semibold text-base sm:text-lg text-secondary-700 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-secondary-500 text-sm mb-6">
                    Looks like you haven't added anything yet.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setCartOpen(false)}
                    className="btn-primary text-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 sm:gap-4 bg-secondary-50 rounded-xl p-3 sm:p-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 text-sm sm:text-base truncate">
                          {item.name}
                        </h4>
                        {(item.size || item.color) && (
                          <p className="text-xs sm:text-sm text-secondary-500 mt-0.5">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' | '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {item.salePrice ? (
                              <>
                                <span className="font-semibold text-primary-600 text-sm sm:text-base">
                                  PKR {item.salePrice.toFixed(0)}
                                </span>
                                <span className="text-xs text-secondary-400 line-through">
                                  PKR {item.price.toFixed(0)}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-secondary-900 text-sm sm:text-base">
                                PKR {item.price.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center border border-secondary-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 sm:p-2 hover:bg-secondary-100 transition-colors rounded-l-lg"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-600" />
                            </button>
                            <span className="px-3 sm:px-4 py-1 font-medium text-secondary-900 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 sm:p-2 hover:bg-secondary-100 transition-colors rounded-r-lg"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-600" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-secondary-100 p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Subtotal</span>
                  <span className="font-semibold text-base sm:text-lg text-secondary-900">
                    PKR {getTotal().toFixed(0)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-secondary-500">
                  Shipping calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary w-full text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => setCartOpen(false)}
                  className="btn-ghost w-full text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
