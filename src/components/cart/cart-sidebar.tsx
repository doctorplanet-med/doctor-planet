'use client'

import { Fragment, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2, Package, Tag } from 'lucide-react'
import { useCartStore, CartItem } from '@/store/cart-store'
import toast from 'react-hot-toast'

// Group items by dealId
interface GroupedItems {
  deals: { dealId: string; dealName: string; items: CartItem[] }[]
  regularItems: CartItem[]
}

export default function CartSidebar() {
  const { items, isOpen, setCartOpen, removeItem, removeDeal, updateQuantity, getTotal } = useCartStore()

  // Group items: deals together, regular items separate
  const groupedItems = useMemo<GroupedItems>(() => {
    const dealMap = new Map<string, { dealName: string; items: CartItem[] }>()
    const regularItems: CartItem[] = []

    items.forEach((item) => {
      if (item.dealId) {
        if (!dealMap.has(item.dealId)) {
          dealMap.set(item.dealId, { dealName: item.dealName || 'Deal', items: [] })
        }
        dealMap.get(item.dealId)!.items.push(item)
      } else {
        regularItems.push(item)
      }
    })

    return {
      deals: Array.from(dealMap.entries()).map(([dealId, data]) => ({
        dealId,
        dealName: data.dealName,
        items: data.items,
      })),
      regularItems,
    }
  }, [items])

  const handleRemoveDealItem = (item: CartItem) => {
    if (item.dealId) {
      // Show confirmation toast
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm">Remove entire deal?</p>
          <p className="text-xs text-gray-500">Removing this item will remove all products from this deal.</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                removeDeal(item.dealId!)
                toast.dismiss(t.id)
                toast.success('Deal removed from cart')
              }}
              className="flex-1 bg-red-500 text-white text-xs py-1.5 px-3 rounded font-medium"
            >
              Remove Deal
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 px-3 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 5000 })
    } else {
      removeItem(item.id)
    }
  }

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
                <div className="space-y-4">
                  {/* Deal Bundles */}
                  {groupedItems.deals.map((deal) => (
                    <motion.div
                      key={deal.dealId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-primary-200 rounded-xl overflow-hidden bg-primary-50/30"
                    >
                      {/* Deal Header */}
                      <div className="bg-primary-100 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-sm text-primary-700">{deal.dealName}</span>
                          <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {deal.items.length} items
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            toast((t) => (
                              <div className="flex flex-col gap-2">
                                <p className="font-medium text-sm">Remove entire deal?</p>
                                <p className="text-xs text-gray-500">This will remove all {deal.items.length} products from this deal.</p>
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() => {
                                      removeDeal(deal.dealId)
                                      toast.dismiss(t.id)
                                      toast.success('Deal removed from cart')
                                    }}
                                    className="flex-1 bg-red-500 text-white text-xs py-1.5 px-3 rounded font-medium"
                                  >
                                    Remove
                                  </button>
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 px-3 rounded font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ), { duration: 5000 })
                          }}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Deal Items */}
                      <div className="p-2 space-y-2">
                        {deal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-2 bg-white rounded-lg p-2"
                          >
                            <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-secondary-900 text-xs truncate">
                                {item.name.replace(` (${deal.dealName})`, '')}
                              </h4>
                              {(item.size || item.color) && (
                                <p className="text-[10px] text-secondary-500">
                                  {item.size && `${item.size}`}
                                  {item.size && item.color && ' / '}
                                  {item.color && `${item.color}`}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <span className="font-semibold text-primary-600 text-xs">
                                  PKR {(item.salePrice || item.price).toFixed(0)}
                                </span>
                                {item.salePrice && (
                                  <span className="text-[10px] text-secondary-400 line-through">
                                    {item.price.toFixed(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Deal Total */}
                      <div className="bg-primary-100/50 px-3 py-2 flex items-center justify-between border-t border-primary-200">
                        <span className="text-xs text-primary-700">Deal Total:</span>
                        <span className="font-bold text-primary-700">
                          PKR {deal.items.reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0).toFixed(0)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Regular Items */}
                  <AnimatePresence mode="popLayout">
                    {groupedItems.regularItems.map((item) => (
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
                              onClick={() => handleRemoveDealItem(item)}
                              className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
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
