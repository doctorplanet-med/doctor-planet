'use client'

import { forwardRef, Fragment } from 'react'

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
          {settings.taxEnabled && settings.taxNumber && (
            <p className="text-black font-semibold text-[9px]">{settings.taxName || 'Tax'} #: {settings.taxNumber}</p>
          )}
          {settings.headerText && (
            <p className="mt-1 font-bold">{settings.headerText}</p>
          )}
        </div>

        {/* Receipt Info */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>Receipt #:</span>
            <span className="font-black">{sale.receiptNumber}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Date:</span>
            <span>{new Date(sale.createdAt).toLocaleString()}</span>
          </div>
          {sale.salesman && (
            <div className="flex justify-between font-semibold">
              <span>Cashier:</span>
              <span>{sale.salesman.name}</span>
            </div>
          )}
          {sale.customerName && (
            <div className="flex justify-between font-semibold">
              <span>Customer:</span>
              <span>{sale.customerName}</span>
            </div>
          )}
          {sale.customerPhone && (
            <div className="flex justify-between font-semibold">
              <span>Phone:</span>
              <span>{sale.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Items - fixed column areas so long names don't overlap Qty/Amount */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 overflow-hidden">
          <table className="w-full table-fixed border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '55%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left font-black py-1 pr-1" style={{ fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis' }}>Item</th>
                <th className="text-center font-black py-1" style={{ fontWeight: '900' }}>Qty</th>
                <th className="text-right font-black py-1" style={{ fontWeight: '900' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <Fragment key={index}>
                  <tr>
                    <td className="font-bold py-0.5 pr-1 align-top overflow-hidden text-ellipsis whitespace-nowrap" title={item.productName}>
                      {item.productName}
                    </td>
                    <td className="text-center font-bold py-0.5 align-top">{item.quantity}</td>
                    <td className="text-right font-bold py-0.5 align-top">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                  {(item.color || item.size) && (
                    <tr>
                      <td colSpan={3} className="text-black font-medium text-[9px] pl-0 pb-1">
                        {item.color}{item.color && item.size && ' / '}{item.size}
                        {' @ '}{formatCurrency(item.price)} each
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between font-bold text-black">
              <span>Discount{sale.discountType === 'PERCENTAGE' ? ' (%)' : ''}:</span>
              <span>-{formatCurrency(sale.discount)}</span>
            </div>
          )}
          {/* Tax Display */}
          {settings.taxEnabled && settings.showTaxBreakdown && (
            <div className="flex justify-between font-bold">
              <span>{settings.taxName || 'Tax'} ({settings.taxRate || 0}%):</span>
              <span>{formatCurrency(sale.taxAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-base pt-1 border-t-2 border-black" style={{ fontWeight: '900', fontSize: '1.1rem' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-b-2 border-dashed border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between font-bold">
            <span>Payment Method:</span>
            <span className="font-black">{sale.paymentMethod}</span>
          </div>
          {sale.amountReceived && (
            <>
              <div className="flex justify-between font-bold">
                <span>Amount Received:</span>
                <span>{formatCurrency(sale.amountReceived)}</span>
              </div>
              <div className="flex justify-between font-black" style={{ fontWeight: '900' }}>
                <span>Change:</span>
                <span>{formatCurrency(sale.changeGiven || 0)}</span>
              </div>
            </>
          )}
        </div>

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
                ||| {sale.receiptNumber} |||
              </div>
            </div>
          )}
          <p className="text-[8px] text-black font-medium mt-2">
            Powered by Doctor Planet POS
          </p>
        </div>
      </div>
    )
  }
)

PrintableBill.displayName = 'PrintableBill'

export default PrintableBill
