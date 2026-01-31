'use client'

import { forwardRef } from 'react'

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

interface OrderItem {
  productName: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface OrderData {
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  shippingAddress: ShippingAddress
  user: { name: string | null; email: string | null; phone: string | null }
  notes?: string | null
  createdAt: string
}

interface PrintableOrderBillProps {
  order: OrderData
  settings: BillSettings
}

const PrintableOrderBill = forwardRef<HTMLDivElement, PrintableOrderBillProps>(
  ({ order, settings }, ref) => {
    const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`
    
    const fontSizeClass = 
      settings.fontSize === 'small' ? 'text-[10px]' : 
      settings.fontSize === 'large' ? 'text-sm' : 'text-xs'

    const paperWidthStyle = 
      settings.paperWidth === '58mm' ? { width: '58mm', minWidth: '58mm' } :
      settings.paperWidth === '80mm' ? { width: '80mm', minWidth: '80mm' } :
      { width: '100%', maxWidth: '210mm' }

    return (
      <div 
        ref={ref}
        className={`bg-white p-4 font-mono ${fontSizeClass} print:p-2`}
        style={paperWidthStyle}
      >
        {/* Store Header */}
        <div className="text-center border-b border-dashed border-black pb-3 mb-3">
          {settings.showLogo && settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-10 mx-auto mb-2 print:h-8"
            />
          )}
          <h1 className="font-bold text-base print:text-sm">{settings.storeName}</h1>
          {settings.showStoreAddress && settings.storeAddress && (
            <p className="text-gray-600">{settings.storeAddress}</p>
          )}
          {settings.showStorePhone && settings.storePhone && (
            <p className="text-gray-600">Tel: {settings.storePhone}</p>
          )}
          {settings.headerText && (
            <p className="mt-1 font-medium">{settings.headerText}</p>
          )}
        </div>

        {/* Order Type Badge */}
        <div className="text-center mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            ONLINE ORDER
          </span>
        </div>

        {/* Order Info */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-bold">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span>{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-b border-dashed border-black pb-3 mb-3">
          <p className="font-bold mb-1">Customer:</p>
          <p>{order.user.name || order.shippingAddress.name}</p>
          {order.user.phone && <p>Tel: {order.user.phone}</p>}
          {order.user.email && <p className="text-[9px]">{order.user.email}</p>}
        </div>

        {/* Shipping Address */}
        <div className="border-b border-dashed border-black pb-3 mb-3">
          <p className="font-bold mb-1">Ship To:</p>
          <p>{order.shippingAddress.name}</p>
          <p>Tel: {order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
          <p>{order.shippingAddress.country}</p>
        </div>

        {/* Items Header */}
        <div className="border-b border-black pb-1 mb-2">
          <div className="flex justify-between font-bold">
            <span className="flex-1">Item</span>
            <span className="w-10 text-center">Qty</span>
            <span className="w-20 text-right">Amount</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-2">
          {order.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span className="flex-1 truncate pr-2">{item.productName}</span>
                <span className="w-10 text-center">{item.quantity}</span>
                <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </div>
              {(item.color || item.size) && (
                <div className="text-gray-500 text-[9px] pl-2">
                  {item.color}{item.color && item.size && ' / '}{item.size}
                  {' @ '}{formatCurrency(item.price)} each
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="border-b border-dashed border-black pb-3 mb-3">
            <p className="font-bold mb-1">Notes:</p>
            <p className="text-[9px]">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          {settings.footerText && (
            <p className="font-medium">{settings.footerText}</p>
          )}
          {settings.showReturnPolicy && settings.returnPolicy && (
            <p className="text-[9px] text-gray-500">{settings.returnPolicy}</p>
          )}
          {settings.showBarcode && (
            <div className="mt-3">
              <div className="h-8 bg-gray-200 flex items-center justify-center text-[8px]">
                ||| {order.orderNumber} |||
              </div>
            </div>
          )}
          <p className="text-[8px] text-gray-400 mt-2">
            Powered by Doctor Planet
          </p>
        </div>
      </div>
    )
  }
)

PrintableOrderBill.displayName = 'PrintableOrderBill'

export default PrintableOrderBill
