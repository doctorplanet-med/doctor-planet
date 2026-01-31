import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  product: { name: string }
  quantity: number
  price: number
  size?: string | null
  color?: string | null
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  status: string
  trackingUrl?: string
}

// Email templates for different order statuses
const emailTemplates = {
  ORDER_PLACED: (data: OrderEmailData) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .success-badge { background: #10B981; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .item { padding: 15px 0; border-bottom: 1px solid #e0e0e0; }
          .item:last-child { border-bottom: none; }
          .item-name { font-weight: bold; color: #333; }
          .item-details { color: #666; font-size: 14px; }
          .item-price { font-weight: bold; color: #8B0000; }
          .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #8B0000; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 20px; font-weight: bold; color: #8B0000; }
          .address-box { background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Doctor Planet</h1>
            <p>Professional Medical Boutique</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="success-badge">✓ Order Confirmed</div>
            </div>
            
            <h2>Thank you for your order, ${data.customerName}!</h2>
            <p>We've received your order and will begin processing it shortly. You'll receive another email when your order ships.</p>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #8B0000;">Order #${data.orderNumber}</h3>
              ${data.items.map(item => `
                <div class="item">
                  <div class="item-name">${item.product.name}</div>
                  ${item.size || item.color ? `<div class="item-details">${item.size ? `Size: ${item.size}` : ''} ${item.color ? `| Color: ${item.color}` : ''}</div>` : ''}
                  <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span class="item-details">Qty: ${item.quantity}</span>
                    <span class="item-price">PKR ${(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                </div>
              `).join('')}
              
              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>PKR ${data.subtotal.toFixed(0)}</span>
                </div>
                <div class="total-row">
                  <span>Shipping</span>
                  <span>${data.shippingFee === 0 ? 'FREE' : `PKR ${data.shippingFee.toFixed(0)}`}</span>
                </div>
                <div class="total-row grand-total">
                  <span>Total (COD)</span>
                  <span>PKR ${data.total.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            <div class="address-box">
              <h3 style="margin-top: 0;">📍 Delivery Address</h3>
              <p style="margin: 0;">
                <strong>${data.shippingAddress.name}</strong><br>
                📞 ${data.shippingAddress.phone}<br>
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.city}${data.shippingAddress.state ? `, ${data.shippingAddress.state}` : ''} ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </p>
            </div>
            
            <div style="text-align: center; background: #FEF3C7; padding: 15px; border-radius: 10px;">
              <strong>💵 Payment Method:</strong> Cash on Delivery (COD)<br>
              <small style="color: #666;">Please have PKR ${data.total.toFixed(0)} ready at delivery</small>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email or contact us.</p>
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  CONFIRMED: (data: OrderEmailData) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .status-badge { background: #3B82F6; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .progress { display: flex; justify-content: space-between; margin: 30px 0; padding: 0 10px; }
          .step { text-align: center; flex: 1; }
          .step-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; }
          .step-circle.done { background: #10B981; color: white; }
          .step-circle.current { background: #3B82F6; color: white; }
          .step-circle.pending { background: #e0e0e0; color: #999; }
          .step-label { font-size: 12px; color: #666; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Doctor Planet</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">✓ Order Confirmed</div>
            </div>
            
            <h2 style="text-align: center;">Great news, ${data.customerName}!</h2>
            <p style="text-align: center;">Your order <strong>#${data.orderNumber}</strong> has been confirmed and is being prepared.</p>
            
            <div class="progress">
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Placed</div></div>
              <div class="step"><div class="step-circle current">2</div><div class="step-label">Confirmed</div></div>
              <div class="step"><div class="step-circle pending">3</div><div class="step-label">Processing</div></div>
              <div class="step"><div class="step-circle pending">4</div><div class="step-label">Shipped</div></div>
              <div class="step"><div class="step-circle pending">5</div><div class="step-label">Delivered</div></div>
            </div>
            
            <p style="text-align: center; font-size: 18px;"><strong>Order Total: PKR ${data.total.toFixed(0)} (COD)</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  PROCESSING: (data: OrderEmailData) => ({
    subject: `Your Order is Being Prepared - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .status-badge { background: #6366F1; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .progress { display: flex; justify-content: space-between; margin: 30px 0; padding: 0 10px; }
          .step { text-align: center; flex: 1; }
          .step-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; }
          .step-circle.done { background: #10B981; color: white; }
          .step-circle.current { background: #6366F1; color: white; }
          .step-circle.pending { background: #e0e0e0; color: #999; }
          .step-label { font-size: 12px; color: #666; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Doctor Planet</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">📦 Processing</div>
            </div>
            
            <h2 style="text-align: center;">Your order is being prepared!</h2>
            <p style="text-align: center;">Hi ${data.customerName}, we're packing your order <strong>#${data.orderNumber}</strong> with care.</p>
            
            <div class="progress">
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Placed</div></div>
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Confirmed</div></div>
              <div class="step"><div class="step-circle current">📦</div><div class="step-label">Processing</div></div>
              <div class="step"><div class="step-circle pending">4</div><div class="step-label">Shipped</div></div>
              <div class="step"><div class="step-circle pending">5</div><div class="step-label">Delivered</div></div>
            </div>
            
            <p style="text-align: center;">Your items are being carefully packed. We'll ship soon!</p>
            <p style="text-align: center; font-size: 18px;"><strong>Order Total: PKR ${data.total.toFixed(0)} (COD)</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  SHIPPED: (data: OrderEmailData) => ({
    subject: `Your Order is On the Way! - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .status-badge { background: #8B5CF6; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; font-size: 18px; }
          .progress { display: flex; justify-content: space-between; margin: 30px 0; padding: 0 10px; }
          .step { text-align: center; flex: 1; }
          .step-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; }
          .step-circle.done { background: #10B981; color: white; }
          .step-circle.current { background: #8B5CF6; color: white; }
          .step-circle.pending { background: #e0e0e0; color: #999; }
          .step-label { font-size: 12px; color: #666; }
          .address-box { background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .cod-reminder { background: #FEF3C7; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Doctor Planet</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">🚚 On the Way!</div>
            </div>
            
            <h2 style="text-align: center;">Your order has been shipped!</h2>
            <p style="text-align: center;">Hi ${data.customerName}, great news! Your order <strong>#${data.orderNumber}</strong> is on its way to you.</p>
            
            <div class="progress">
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Placed</div></div>
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Confirmed</div></div>
              <div class="step"><div class="step-circle done">✓</div><div class="step-label">Processing</div></div>
              <div class="step"><div class="step-circle current">🚚</div><div class="step-label">Shipped</div></div>
              <div class="step"><div class="step-circle pending">5</div><div class="step-label">Delivered</div></div>
            </div>
            
            <div class="address-box">
              <h3 style="margin-top: 0;">📍 Delivering to:</h3>
              <p style="margin: 0;">
                <strong>${data.shippingAddress.name}</strong><br>
                📞 ${data.shippingAddress.phone}<br>
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.city}${data.shippingAddress.state ? `, ${data.shippingAddress.state}` : ''} ${data.shippingAddress.postalCode}
              </p>
            </div>
            
            <div class="cod-reminder">
              💵 <strong>Please keep PKR ${data.total.toFixed(0)} ready for Cash on Delivery</strong>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  DELIVERED: (data: OrderEmailData) => ({
    subject: `Order Delivered! - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .status-badge { background: #10B981; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; font-size: 20px; }
          .progress { display: flex; justify-content: space-between; margin: 30px 0; padding: 0 10px; }
          .step { text-align: center; flex: 1; }
          .step-circle { width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; }
          .step-label { font-size: 12px; color: #666; }
          .thank-you { text-align: center; padding: 30px; background: #ECFDF5; border-radius: 10px; margin: 20px 0; }
          .btn { display: inline-block; background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Doctor Planet</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">✓ Delivered!</div>
            </div>
            
            <h2 style="text-align: center;">Your order has been delivered!</h2>
            <p style="text-align: center;">Hi ${data.customerName}, your order <strong>#${data.orderNumber}</strong> has been successfully delivered.</p>
            
            <div class="progress">
              <div class="step"><div class="step-circle">✓</div><div class="step-label">Placed</div></div>
              <div class="step"><div class="step-circle">✓</div><div class="step-label">Confirmed</div></div>
              <div class="step"><div class="step-circle">✓</div><div class="step-label">Processing</div></div>
              <div class="step"><div class="step-circle">✓</div><div class="step-label">Shipped</div></div>
              <div class="step"><div class="step-circle">✓</div><div class="step-label">Delivered</div></div>
            </div>
            
            <div class="thank-you">
              <h3 style="margin: 0 0 10px; color: #059669;">Thank you for shopping with us! 🙏</h3>
              <p style="margin: 0; color: #666;">We hope you love your new medical apparel!</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="btn">Shop Again</a>
            </p>
          </div>
          <div class="footer">
            <p>Questions? Contact us anytime.</p>
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  CANCELLED: (data: OrderEmailData) => ({
    subject: `Order Cancelled - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .status-badge { background: #EF4444; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .btn { display: inline-block; background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Doctor Planet</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">✕ Order Cancelled</div>
            </div>
            
            <h2 style="text-align: center;">Your order has been cancelled</h2>
            <p style="text-align: center;">Hi ${data.customerName}, we're sorry to inform you that your order <strong>#${data.orderNumber}</strong> has been cancelled.</p>
            
            <p style="text-align: center;">If you didn't request this cancellation or have any questions, please contact our support team.</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="btn">Continue Shopping</a>
            </p>
          </div>
          <div class="footer">
            <p>Questions? Contact us anytime.</p>
            <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

// Send order status email using Resend
export async function sendOrderStatusEmail(
  status: string,
  data: OrderEmailData
): Promise<boolean> {
  // Skip if Resend API key is not configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email for status:', status)
    return false
  }

  try {
    const templateKey = status === 'PENDING' ? 'ORDER_PLACED' : status
    const template = emailTemplates[templateKey as keyof typeof emailTemplates]
    
    if (!template) {
      console.log('No email template for status:', status)
      return false
    }

    const { subject, html } = template(data)

    // Use your verified domain email, or fallback to onboarding@resend.dev for testing
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Doctor Planet <onboarding@resend.dev>'
    
    // In development/testing mode without verified domain, send to test email
    const testEmail = process.env.RESEND_TEST_EMAIL
    const toEmail = testEmail || data.customerEmail
    
    if (testEmail) {
      console.log(`[TEST MODE] Email redirected from ${data.customerEmail} to ${testEmail}`)
    }
    
    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: testEmail ? `[TEST] ${subject}` : subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    console.log(`Email sent successfully for order ${data.orderNumber} - Status: ${status}`, result)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send order confirmation email (when order is first placed)
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  return sendOrderStatusEmail('ORDER_PLACED', data)
}
