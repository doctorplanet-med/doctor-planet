'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, Receipt,
  DollarSign, Percent, User, Phone, CreditCard, Banknote,
  X, Check, Printer, Package, AlertCircle, Barcode, Tag
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import PrintableBill from '@/components/pos/printable-bill'

interface Product {
  id: string
  name: string
  barcode: string | null
  sku: string | null
  company: string | null
  costPrice: number
  price: number
  salePrice: number | null
  images: string
  stock: number
  sizes: string | null
  colors: string | null
  colorSizeStock: string | null
  category?: { name: string }
}

interface CartItem {
  productId: string
  product: Product
  quantity: number
  size: string | null
  color: string | null
  price: number
  costPrice: number
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

export default function SalesmanPOSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [billSettings, setBillSettings] = useState<BillSettings | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const billRef = useRef<HTMLDivElement>(null)

  // Checkout form
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountReceived, setAmountReceived] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  // Variant selection
  const [selectingVariant, setSelectingVariant] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchBillSettings()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/pos/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

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

  const handlePrintBill = () => {
    const printContent = billRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      toast.error('Please allow popups for printing')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${lastSale?.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10px;
              font-size: ${billSettings?.fontSize === 'small' ? '10px' : billSettings?.fontSize === 'large' ? '14px' : '12px'};
            }
            .bill-container { 
              width: ${billSettings?.paperWidth === '58mm' ? '58mm' : billSettings?.paperWidth === '80mm' ? '80mm' : '100%'};
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-dashed { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .flex { display: flex; justify-content: space-between; }
            .text-green { color: green; }
            .text-gray { color: #666; }
            .text-sm { font-size: 10px; }
            .mt-2 { margin-top: 8px; }
            .mb-2 { margin-bottom: 8px; }
            img { max-height: 40px; margin: 0 auto 8px; display: block; }
            @media print {
              body { padding: 0; }
              @page { margin: 5mm; }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            ${printContent.innerHTML}
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

  // Search for product by barcode
  const searchByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/pos/products/barcode/${encodeURIComponent(barcode)}`)
      if (res.ok) {
        return await res.json()
      }
      return null
    } catch {
      return null
    }
  }

  // Check if input looks like a barcode (alphanumeric, typically 6+ chars)
  const looksLikeBarcode = (input: string): boolean => {
    const trimmed = input.trim().toUpperCase()
    // Barcode pattern: starts with DP (our prefix) or is all alphanumeric 6+ chars
    return /^DP[A-Z0-9]+$/.test(trimmed) || /^[A-Z0-9]{6,}$/.test(trimmed)
  }

  // Search suggestions with smart matching (including barcode)
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    const term = searchTerm.toLowerCase()
    const upperTerm = searchTerm.toUpperCase()
    
    return products
      .filter(p => {
        const nameMatch = p.name.toLowerCase().includes(term)
        const categoryMatch = p.category?.name?.toLowerCase().includes(term)
        const barcodeMatch = p.barcode?.toUpperCase().includes(upperTerm)
        const skuMatch = p.sku?.toUpperCase().includes(upperTerm)
        const companyMatch = p.company?.toLowerCase().includes(term)
        return nameMatch || categoryMatch || barcodeMatch || skuMatch || companyMatch
      })
      .slice(0, 8) // Limit to 8 suggestions
  }, [products, searchTerm])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = discountType === 'PERCENTAGE' 
    ? (subtotal * discount) / 100 
    : discount
  const total = Math.max(0, subtotal - discountAmount)
  const change = typeof amountReceived === 'number' ? amountReceived - total : 0

  const handleSearchKeyDown = async (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (!showSuggestions || suggestions.length === 0) return
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        if (!showSuggestions || suggestions.length === 0) return
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        
        // If there are suggestions and one is selected, use that
        if (showSuggestions && suggestions.length > 0 && suggestions[selectedSuggestionIndex]) {
          addToCart(suggestions[selectedSuggestionIndex])
          setSearchTerm('')
          setShowSuggestions(false)
          return
        }
        
        // Check if it looks like a barcode scan
        const input = searchTerm.trim()
        if (input && looksLikeBarcode(input)) {
          toast.loading('Scanning barcode...', { id: 'barcode-scan' })
          const product = await searchByBarcode(input)
          toast.dismiss('barcode-scan')
          
          if (product) {
            toast.success(`Found: ${product.name}`, { duration: 1500 })
            addToCart(product)
            setSearchTerm('')
            setShowSuggestions(false)
          } else {
            toast.error('Product not found for this barcode')
          }
        } else if (suggestions.length === 1) {
          // Auto-select if only one suggestion
          addToCart(suggestions[0])
          setSearchTerm('')
          setShowSuggestions(false)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }

    const sizes = product.sizes ? JSON.parse(product.sizes) : []
    const colors = product.colors ? JSON.parse(product.colors) : []

    if (sizes.length > 0 || colors.length > 0) {
      setSelectingVariant(product)
      setSelectedSize(sizes[0] || null)
      setSelectedColor(colors[0] || null)
    } else {
      addItemToCart(product, null, null)
    }
    
    setSearchTerm('')
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const addItemToCart = (product: Product, size: string | null, color: string | null) => {
    const price = product.salePrice || product.price
    const costPrice = product.costPrice || 0
    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.size === size && item.color === color
    )

    // Check available stock for this variant
    let availableStock = product.stock
    if (color && size && product.colorSizeStock) {
      const colorSizeStock = JSON.parse(product.colorSizeStock)
      availableStock = colorSizeStock[color]?.[size] || 0
    }

    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity
      if (currentQty >= availableStock) {
        toast.error(`Only ${availableStock} in stock`)
        return
      }
      updateQuantity(existingIndex, currentQty + 1)
    } else {
      if (availableStock <= 0) {
        toast.error('This variant is out of stock')
        return
      }
      setCart([...cart, {
        productId: product.id,
        product,
        quantity: 1,
        size,
        color,
        price,
        costPrice,
      }])
      toast.success(`Added ${product.name}`)
    }

    setSelectingVariant(null)
    setSelectedSize(null)
    setSelectedColor(null)
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }

    const item = cart[index]
    let maxStock = item.product.stock
    if (item.color && item.size && item.product.colorSizeStock) {
      const colorSizeStock = JSON.parse(item.product.colorSizeStock)
      maxStock = colorSizeStock[item.color]?.[item.size] || 0
    }

    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} in stock`)
      return
    }

    const newCart = [...cart]
    newCart[index].quantity = quantity
    setCart(newCart)
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    if (cart.length === 0) return
    if (confirm('Clear all items from cart?')) {
      setCart([])
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          discount: discount,
          discountType: discount > 0 ? discountType : null,
          paymentMethod,
          amountReceived: typeof amountReceived === 'number' ? amountReceived : null,
          notes: notes || null,
        }),
      })

      if (res.ok) {
        const sale = await res.json()
        setLastSale(sale)
        setShowCheckout(false)
        setShowReceipt(true)
        
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setDiscount(0)
        setAmountReceived('')
        setNotes('')
        
        fetchProducts()
        toast.success('Sale completed!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to process sale')
      }
    } catch (error) {
      toast.error('Failed to process sale')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' }
    if (stock <= 5) return { text: `Low: ${stock}`, color: 'text-orange-600 bg-orange-50' }
    return { text: `${stock} in stock`, color: 'text-green-600 bg-green-50' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Professional Search Bar */}
        <div className="bg-white rounded-xl border border-secondary-200 mb-4 shadow-sm">
          <div className="p-4 relative">
            {/* Search and Barcode Scanner */}
            <div className="flex gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary-600" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSuggestions(true)
                    setSelectedSuggestionIndex(0)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products or scan barcode..."
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setShowSuggestions(false)
                      searchInputRef.current?.focus()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Barcode Scan Button */}
              <button
                onClick={async () => {
                  const barcode = prompt('Enter or scan barcode:')
                  if (barcode && barcode.trim()) {
                    toast.loading('Searching...', { id: 'barcode-scan' })
                    const product = await searchByBarcode(barcode.trim())
                    toast.dismiss('barcode-scan')
                    
                    if (product) {
                      addToCart(product)
                      toast.success(`Added: ${product.name}`)
                    } else {
                      toast.error('Product not found')
                    }
                  }
                }}
                className="flex items-center gap-2 px-5 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
              >
                <Barcode className="w-5 h-5" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>

            {/* Barcode Hint */}
            <div className="mt-2 flex items-center gap-2 text-xs text-secondary-500">
              <Barcode className="w-3 h-3" />
              <span>Tip: Use a barcode scanner directly in the search box, or click "Scan" to enter manually</span>
            </div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-secondary-200 shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-2 bg-secondary-50 border-b border-secondary-200">
                      <p className="text-xs text-secondary-500 flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        {suggestions.length} products found • Use ↑↓ to navigate, Enter to select
                      </p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {suggestions.map((product, index) => {
                        const images = JSON.parse(product.images)
                        const price = product.salePrice || product.price
                        const stockStatus = getStockStatus(product.stock)
                        const isSelected = index === selectedSuggestionIndex

                        return (
                          <motion.button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={`w-full flex items-center gap-4 p-4 text-left transition-colors border-b border-secondary-100 last:border-0 ${
                              isSelected ? 'bg-primary-50' : 'hover:bg-secondary-50'
                            } ${product.stock <= 0 ? 'opacity-50' : ''}`}
                          >
                            {/* Product Image */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
                              <Image
                                src={images[0] || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-secondary-900 line-clamp-1">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {product.category && (
                                      <span className="text-xs text-secondary-500">
                                        {product.category.name}
                                      </span>
                                    )}
                                    {product.company && (
                                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                        {product.company}
                                      </span>
                                    )}
                                  </div>
                                  {product.barcode && (
                                    <p className="text-[10px] text-secondary-400 font-mono mt-0.5 flex items-center gap-1">
                                      <Barcode className="w-3 h-3" />
                                      {product.barcode}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-primary-600 text-lg">
                                    {formatCurrency(price)}
                                  </p>
                                  {product.costPrice > 0 && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-secondary-500 bg-secondary-100 px-1.5 py-0.5 rounded">
                                        Cost: {formatCurrency(product.costPrice)}
                                      </span>
                                      <span className="text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-semibold">
                                        +{formatCurrency(price - product.costPrice)} ({Math.round(((price - product.costPrice) / product.costPrice) * 100)}%)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Stock & Variants */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                  <Package className="w-3 h-3 inline mr-1" />
                                  {stockStatus.text}
                                </span>
                                {product.sizes && (
                                  <span className="px-2 py-0.5 text-xs bg-secondary-100 text-secondary-600 rounded-full">
                                    {JSON.parse(product.sizes).length} sizes
                                  </span>
                                )}
                                {product.colors && (
                                  <span className="px-2 py-0.5 text-xs bg-secondary-100 text-secondary-600 rounded-full">
                                    {JSON.parse(product.colors).length} colors
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Add Button */}
                            {product.stock > 0 && (
                              <div className={`p-3 rounded-xl transition-colors ${
                                isSelected ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
                              }`}>
                                <Plus className="w-5 h-5" />
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results */}
              <AnimatePresence>
                {showSuggestions && searchTerm && suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-secondary-200 shadow-xl z-50 p-8 text-center"
                  >
                    {looksLikeBarcode(searchTerm) ? (
                      <>
                        <Barcode className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                        <p className="text-secondary-600 font-medium">Barcode detected</p>
                        <p className="text-secondary-400 text-sm mt-1">Press Enter to scan "{searchTerm.toUpperCase()}"</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                        <p className="text-secondary-600 font-medium">No products found</p>
                        <p className="text-secondary-400 text-sm mt-1">Try a different search term or scan barcode</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Quick Stats */}
          <div className="px-4 pb-4 flex gap-4">
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <Package className="w-4 h-4" />
              <span>{products.length} Products</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <Tag className="w-4 h-4" />
              <span>{products.filter(p => p.salePrice).length} On Sale</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span>{products.filter(p => p.stock <= 5 && p.stock > 0).length} Low Stock</span>
            </div>
          </div>
        </div>

        {/* Recent/Popular Products Grid */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-secondary-200 p-4">
          <h3 className="text-sm font-medium text-secondary-500 mb-4">Quick Add - All Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.filter(p => p.stock > 0).slice(0, 20).map((product) => {
              const images = JSON.parse(product.images)
              const price = product.salePrice || product.price
              const stockStatus = getStockStatus(product.stock)
              
              return (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="bg-secondary-50 rounded-xl p-3 text-left hover:bg-secondary-100 transition-colors relative group"
                >
                  <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={images[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.salePrice && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                        SALE
                      </span>
                    )}
                    {/* Profit Badge */}
                    {product.costPrice > 0 && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded">
                        +{Math.round(((price - product.costPrice) / product.costPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-secondary-900 text-xs line-clamp-2 mb-1 h-8">
                    {product.name}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary-600 text-sm">{formatCurrency(price)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${stockStatus.color}`}>
                        {product.stock}
                      </span>
                    </div>
                    {product.costPrice > 0 && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-secondary-400">C: {formatCurrency(product.costPrice)}</span>
                        <span className="text-green-600 font-semibold">+{formatCurrency(price - product.costPrice)}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col bg-white rounded-xl border border-secondary-200 shadow-sm">
        {/* Cart Header */}
        <div className="p-4 border-b border-secondary-200 bg-secondary-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-secondary-900">Current Sale</h2>
                <p className="text-xs text-secondary-500">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-secondary-300" />
              </div>
              <p className="text-secondary-500 font-medium">No items in cart</p>
              <p className="text-sm text-secondary-400 mt-1">Search or click products to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => {
                const images = JSON.parse(item.product.images)
                return (
                  <motion.div 
                    key={`${item.productId}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 bg-secondary-50 p-3 rounded-xl"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <Image
                        src={images[0] || '/placeholder.png'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 text-sm line-clamp-1">
                        {item.product.name}
                      </p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-secondary-500">
                          {item.color}{item.color && item.size && ' / '}{item.size}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-bold text-primary-600 text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.costPrice > 0 && (
                          <p className="text-xs text-green-600">
                            (+{formatCurrency((item.price - item.costPrice) * item.quantity)})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1 bg-white rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-secondary-200 bg-secondary-50 rounded-b-xl space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {cart.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Est. Profit</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(cart.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.quantity), 0))}
                </span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-600/30"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Variant Selection Modal */}
      <AnimatePresence>
        {selectingVariant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectingVariant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Header */}
              <div className="p-6 bg-gradient-to-r from-primary-50 to-white border-b border-secondary-100">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white">
                    <Image
                      src={JSON.parse(selectingVariant.images)[0] || '/placeholder.png'}
                      alt={selectingVariant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary-900">{selectingVariant.name}</h3>
                    <p className="text-2xl font-bold text-primary-600 mt-1">
                      {formatCurrency(selectingVariant.salePrice || selectingVariant.price)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {selectingVariant.colors && (
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-3">Select Color</label>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectingVariant.colors).map((color: string) => {
                        // Get stock for this color
                        let colorStock = 0
                        if (selectingVariant.colorSizeStock) {
                          const stock = JSON.parse(selectingVariant.colorSizeStock)
                          if (stock[color]) {
                            colorStock = Object.values(stock[color] as Record<string, number>).reduce((a, b) => a + b, 0)
                          }
                        }
                        
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedColor === color
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-secondary-200 hover:border-secondary-300'
                            }`}
                          >
                            <span className="font-medium">{color}</span>
                            {colorStock > 0 && (
                              <span className="ml-2 text-xs text-secondary-500">({colorStock})</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectingVariant.sizes && (
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-3">Select Size</label>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectingVariant.sizes).map((size: string) => {
                        // Get stock for this size
                        let sizeStock = 0
                        if (selectingVariant.colorSizeStock && selectedColor) {
                          const stock = JSON.parse(selectingVariant.colorSizeStock)
                          sizeStock = stock[selectedColor]?.[size] || 0
                        }
                        
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            disabled={sizeStock === 0 && selectingVariant.colorSizeStock !== null}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedSize === size
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : sizeStock === 0 && selectingVariant.colorSizeStock
                                ? 'border-secondary-100 bg-secondary-50 text-secondary-300 cursor-not-allowed'
                                : 'border-secondary-200 hover:border-secondary-300'
                            }`}
                          >
                            <span className="font-medium">{size}</span>
                            {selectingVariant.colorSizeStock && selectedColor && (
                              <span className={`ml-2 text-xs ${sizeStock > 0 ? 'text-secondary-500' : 'text-red-400'}`}>
                                ({sizeStock})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-secondary-50 flex gap-3">
                <button
                  onClick={() => setSelectingVariant(null)}
                  className="flex-1 py-3 border border-secondary-300 rounded-xl font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addItemToCart(selectingVariant, selectedSize, selectedColor)}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold">Checkout</h2>
                  <p className="text-primary-100 text-sm">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Customer (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer name"
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Discount</h3>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      {discountType === 'PERCENTAGE' ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      )}
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        min={0}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-secondary-200">
                      <button
                        onClick={() => setDiscountType('FIXED')}
                        className={`px-4 py-3 font-medium transition-colors ${discountType === 'FIXED' ? 'bg-primary-600 text-white' : 'bg-white hover:bg-secondary-50'}`}
                      >
                        PKR
                      </button>
                      <button
                        onClick={() => setDiscountType('PERCENTAGE')}
                        className={`px-4 py-3 font-medium transition-colors ${discountType === 'PERCENTAGE' ? 'bg-primary-600 text-white' : 'bg-white hover:bg-secondary-50'}`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Payment Method</h3>
                  <div className="flex gap-3">
                    {[
                      { value: 'CASH', label: 'Cash', icon: Banknote },
                      { value: 'CARD', label: 'Card', icon: CreditCard },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${
                          paymentMethod === method.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}
                      >
                        <method.icon className="w-6 h-6" />
                        <span className="font-semibold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Received */}
                {paymentMethod === 'CASH' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-secondary-900">Cash Received</h3>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="number"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value ? Number(e.target.value) : '')}
                        placeholder={formatCurrency(total)}
                        className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-lg"
                      />
                    </div>
                    {typeof amountReceived === 'number' && amountReceived >= total && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-700 font-bold text-lg">
                          Change: {formatCurrency(change)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    rows={2}
                  />
                </div>

                {/* Totals */}
                <div className="bg-secondary-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold pt-3 border-t border-secondary-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-secondary-200 bg-secondary-50 rounded-b-2xl">
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-4 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 disabled:bg-secondary-300 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" />
                      Complete Sale - {formatCurrency(total)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal with Printable Bill */}
      <AnimatePresence>
        {showReceipt && lastSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-white border-b border-secondary-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                  >
                    <Check className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">Sale Complete!</h2>
                    <p className="text-secondary-500 font-mono">{lastSale.receiptNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Two Columns */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-secondary-200">
                  {/* Sale Summary */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary-600" />
                      Sale Summary
                    </h3>
                    
                    {/* Items */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {lastSale.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm bg-secondary-50 p-2 rounded-lg">
                          <div>
                            <p className="font-medium text-secondary-900">{item.productName}</p>
                            <p className="text-xs text-secondary-500">
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
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Subtotal</span>
                        <span>{formatCurrency(lastSale.subtotal)}</span>
                      </div>
                      {lastSale.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-{formatCurrency(lastSale.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold pt-2 border-t border-secondary-200">
                        <span>Total</span>
                        <span className="text-primary-600">{formatCurrency(lastSale.total)}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    {lastSale.amountReceived && (
                      <div className="bg-green-50 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary-600">Cash Received</span>
                          <span className="font-medium">{formatCurrency(lastSale.amountReceived)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-700 text-lg">
                          <span>Change Due</span>
                          <span>{formatCurrency(lastSale.changeGiven || 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Customer Info */}
                    {(lastSale.customerName || lastSale.customerPhone) && (
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <p className="text-xs text-secondary-500 mb-1">Customer</p>
                        {lastSale.customerName && <p className="font-medium">{lastSale.customerName}</p>}
                        {lastSale.customerPhone && <p className="text-sm text-secondary-600">{lastSale.customerPhone}</p>}
                      </div>
                    )}
                  </div>

                  {/* Bill Preview */}
                  <div className="p-6 bg-secondary-50">
                    <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                      <Printer className="w-5 h-5 text-primary-600" />
                      Bill Preview
                    </h3>
                    <div className="bg-white rounded-xl shadow-inner p-4 max-h-96 overflow-y-auto">
                      {billSettings && (
                        <div ref={billRef}>
                          <PrintableBill sale={lastSale} settings={billSettings} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-secondary-50 border-t border-secondary-200 flex gap-3">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-4 border border-secondary-300 rounded-xl font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Sale
                </button>
                <button
                  onClick={handlePrintBill}
                  className="flex-1 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30"
                >
                  <Printer className="w-5 h-5" />
                  Print Bill
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
