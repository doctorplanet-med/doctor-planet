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
        className={`bg-white p-4 ${fontSizeClass} print:p-2 font-semibold`}
        style={{ 
          ...paperWidthStyle, 
          fontFamily: 'Arial, sans-serif',
          fontWeight: '600',
          color: '#000',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}
      >
        {/* Store Header */}
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
          {settings.showLogo && settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-10 mx-auto mb-2 print:h-8"
            />
          )}
          <h1 className="font-black text-base print:text-sm" style={{ fontWeight: '900' }}>{settings.storeName}</h1>
          {settings.showStoreAddress && settings.storeAddress && (
            <p className="text-black font-semibold">{settings.storeAddress}</p>
          )}
          {settings.showStorePhone && settings.storePhone && (
            <p className="text-black font-semibold">Tel: {settings.storePhone}</p>
          )}
          {settings.headerText && (
            <p className="mt-1 font-bold">{settings.headerText}</p>
          )}
        </div>

        {/* Order Type Badge */}
        <div className="text-center mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-xs font-black rounded-full" style={{ fontWeight: '900' }}>
            ONLINE ORDER
          </span>
        </div>

        {/* Order Info */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>Order #:</span>
            <span className="font-black">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Status:</span>
            <span className="font-black">{order.status}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Payment:</span>
            <span>{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3">
          <p className="font-black mb-1" style={{ fontWeight: '900' }}>Customer:</p>
          <p className="font-bold">{order.user.name || order.shippingAddress.name}</p>
          {order.user.phone && <p className="font-semibold">Tel: {order.user.phone}</p>}
          {order.user.email && <p className="text-[9px] font-semibold">{order.user.email}</p>}
        </div>

        {/* Shipping Address */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3">
          <p className="font-black mb-1" style={{ fontWeight: '900' }}>Ship To:</p>
          <p className="font-bold">{order.shippingAddress.name}</p>
          <p className="font-semibold">Tel: {order.shippingAddress.phone}</p>
          <p className="font-semibold">{order.shippingAddress.address}</p>
          <p className="font-semibold">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
          <p className="font-semibold">{order.shippingAddress.country}</p>
        </div>

        {/* Items Header */}
        <div className="border-b-2 border-black pb-1 mb-2">
          <div className="flex justify-between font-black" style={{ fontWeight: '900' }}>
            <span className="flex-1">Item</span>
            <span className="w-10 text-center">Qty</span>
            <span className="w-20 text-right">Amount</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-2">
          {order.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between font-bold">
                <span className="flex-1 truncate pr-2">{item.productName}</span>
                <span className="w-10 text-center">{item.quantity}</span>
                <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </div>
              {(item.color || item.size) && (
                <div className="text-black font-medium text-[9px] pl-2">
                  {item.color}{item.color && item.size && ' / '}{item.size}
                  {' @ '}{formatCurrency(item.price)} each
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Shipping:</span>
            <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-black text-base pt-1 border-t-2 border-black" style={{ fontWeight: '900', fontSize: '1.1rem' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="border-b-2 border-dashed border-black pb-3 mb-3">
            <p className="font-black mb-1" style={{ fontWeight: '900' }}>Notes:</p>
            <p className="text-[9px] font-semibold">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          {settings.footerText && (
            <p className="font-bold">{settings.footerText}</p>
          )}
          {settings.showReturnPolicy && settings.returnPolicy && (
            <p className="text-[9px] text-black font-semibold">{settings.returnPolicy}</p>
          )}
          {settings.showBarcode && (
            <div className="mt-3">
              <div className="h-8 bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                ||| {order.orderNumber} |||
              </div>
            </div>
          )}
          <p className="text-[8px] text-black font-medium mt-2">
            Powered by Doctor Planet
          </p>
        </div>
      </div>
    )
  }
)

PrintableOrderBill.displayName = 'PrintableOrderBill'

export default PrintableOrderBill
