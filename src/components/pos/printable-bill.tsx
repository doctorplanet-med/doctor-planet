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
  // Tax Settings
  taxEnabled?: boolean
  taxName?: string
  taxRate?: number
  taxIncludedInPrice?: boolean
  showTaxBreakdown?: boolean
  taxNumber?: string
}

interface SaleItem {
  productName: string
  quantity: number
  price: number
  size?: string | null
  color?: string | null
}

interface SaleData {
  receiptNumber: string
  items: SaleItem[]
  subtotal: number
  discount: number
  discountType?: string | null
  taxAmount?: number
  total: number
  paymentMethod: string
  amountReceived?: number | null
  changeGiven?: number | null
  customerName?: string | null
  customerPhone?: string | null
  salesman?: { name: string }
  createdAt: string
}

interface PrintableBillProps {
  sale: SaleData
  settings: BillSettings
}

const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>(
  ({ sale, settings }, ref) => {
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
          {settings.taxEnabled && settings.taxNumber && (
            <p className="text-gray-600 text-[9px]">{settings.taxName || 'Tax'} #: {settings.taxNumber}</p>
          )}
          {settings.headerText && (
            <p className="mt-1 font-medium">{settings.headerText}</p>
          )}
        </div>

        {/* Receipt Info */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span className="font-bold">{sale.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(sale.createdAt).toLocaleString()}</span>
          </div>
          {sale.salesman && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.salesman.name}</span>
            </div>
          )}
          {sale.customerName && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName}</span>
            </div>
          )}
          {sale.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{sale.customerPhone}</span>
            </div>
          )}
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
          {sale.items.map((item, index) => (
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
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount{sale.discountType === 'PERCENTAGE' ? ' (%)' : ''}:</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          )}
          {/* Tax Display */}
          {settings.taxEnabled && settings.showTaxBreakdown && (
            <div className="flex justify-between">
              <span>{settings.taxName || 'Tax'} ({settings.taxRate || 0}%):</span>
              <span>{formatCurrency(sale.taxAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
            <span>TOTAL:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-b border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-medium">{sale.paymentMethod}</span>
          </div>
          {sale.amountReceived && (
            <>
              <div className="flex justify-between">
                <span>Amount Received:</span>
                <span>{formatCurrency(sale.amountReceived)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span>{formatCurrency(sale.changeGiven || 0)}</span>
              </div>
            </>
          )}
        </div>

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
                ||| {sale.receiptNumber} |||
              </div>
            </div>
          )}
          <p className="text-[8px] text-gray-400 mt-2">
            Powered by Doctor Planet POS
          </p>
        </div>
      </div>
    )
  }
)

PrintableBill.displayName = 'PrintableBill'

export default PrintableBill
