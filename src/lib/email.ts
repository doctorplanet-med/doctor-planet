import nodemailer from 'nodemailer'

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Use 587 instead of 465 to avoid firewall issues
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (for development)
    },
  })
}

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
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🏥 Doctor Planet</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Status Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background: #3B82F6; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0;">✓ Order Confirmed</div>
                        </td>
                      </tr>
                    </table>
                    
                    <h2 style="text-align: center; color: #333;">Great news, ${data.customerName}!</h2>
                    <p style="text-align: center;">Your order <strong>#${data.orderNumber}</strong> has been confirmed and is being prepared.</p>
                    
                    <!-- Progress Steps -->
                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <!-- Step 1: Placed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Placed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 2: Confirmed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #3B82F6; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666; font-weight: bold;">Confirmed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 3: Processing -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">3</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Processing</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 4: Shipped -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">4</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Shipped</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 5: Delivered -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">5</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Delivered</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="text-align: center; font-size: 18px;"><strong>Order Total: PKR ${data.total.toFixed(0)} (COD)</strong></p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📦 Doctor Planet</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Status Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background: #6366F1; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0;">📦 Processing</div>
                        </td>
                      </tr>
                    </table>
                    
                    <h2 style="text-align: center; color: #333;">Your order is being prepared!</h2>
                    <p style="text-align: center;">Hi ${data.customerName}, we're packing your order <strong>#${data.orderNumber}</strong> with care.</p>
                    
                    <!-- Progress Steps -->
                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <!-- Step 1: Placed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Placed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 2: Confirmed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Confirmed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 3: Processing -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #6366F1; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">📦</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666; font-weight: bold;">Processing</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 4: Shipped -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">4</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Shipped</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 5: Delivered -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">5</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Delivered</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="text-align: center;">Your items are being carefully packed. We'll ship soon!</p>
                    <p style="text-align: center; font-size: 18px;"><strong>Order Total: PKR ${data.total.toFixed(0)} (COD)</strong></p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🚚 Doctor Planet</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Status Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background: #8B5CF6; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; font-size: 18px;">🚚 On the Way!</div>
                        </td>
                      </tr>
                    </table>
                    
                    <h2 style="text-align: center; color: #333;">Your order has been shipped!</h2>
                    <p style="text-align: center;">Hi ${data.customerName}, great news! Your order <strong>#${data.orderNumber}</strong> is on its way to you.</p>
                    
                    <!-- Progress Steps -->
                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <!-- Step 1: Placed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Placed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 2: Confirmed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Confirmed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 3: Processing -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Processing</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 4: Shipped -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #8B5CF6; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">🚚</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666; font-weight: bold;">Shipped</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 5: Delivered -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; color: #999; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; margin-bottom: 8px;">5</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Delivered</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Delivery Address -->
                    <table width="100%" cellpadding="20" cellspacing="0" style="background: #f0f0f0; border-radius: 10px; margin: 20px 0;">
                      <tr>
                        <td>
                          <h3 style="margin-top: 0; color: #333;">📍 Delivering to:</h3>
                          <p style="margin: 0;">
                            <strong>${data.shippingAddress.name}</strong><br>
                            📞 ${data.shippingAddress.phone}<br>
                            ${data.shippingAddress.address}<br>
                            ${data.shippingAddress.city}${data.shippingAddress.state ? `, ${data.shippingAddress.state}` : ''} ${data.shippingAddress.postalCode}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- COD Reminder -->
                    <table width="100%" cellpadding="15" cellspacing="0" style="background: #FEF3C7; border-radius: 10px; margin: 20px 0;">
                      <tr>
                        <td align="center">
                          💵 <strong>Please keep PKR ${data.total.toFixed(0)} ready for Cash on Delivery</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Doctor Planet</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Status Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background: #10B981; color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; font-size: 20px;">✓ Delivered!</div>
                        </td>
                      </tr>
                    </table>
                    
                    <h2 style="text-align: center; color: #333;">Your order has been delivered!</h2>
                    <p style="text-align: center;">Hi ${data.customerName}, your order <strong>#${data.orderNumber}</strong> has been successfully delivered.</p>
                    
                    <!-- Progress Steps - All Complete -->
                    <table width="100%" cellpadding="10" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <!-- Step 1: Placed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Placed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 2: Confirmed -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Confirmed</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 3: Processing -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Processing</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 4: Shipped -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666;">Shipped</td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Step 5: Delivered -->
                        <td width="20%" align="center" style="padding: 5px;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="center">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #10B981; color: white; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; font-size: 18px; margin-bottom: 8px;">✓</div>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 12px; color: #666; font-weight: bold;">Delivered</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Thank You Section -->
                    <table width="100%" cellpadding="30" cellspacing="0" style="background: #ECFDF5; border-radius: 10px; margin: 20px 0;">
                      <tr>
                        <td align="center">
                          <h3 style="margin: 0 0 10px; color: #059669;">Thank you for shopping with us! 🙏</h3>
                          <p style="margin: 0; color: #666;">We hope you love your new medical apparel!</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Shop Again Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" style="display: inline-block; background: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Again</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                    <p style="margin: 5px 0;">Questions? Contact us anytime.</p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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

// Send order status email using Nodemailer (Gmail)
export async function sendOrderStatusEmail(
  status: string,
  data: OrderEmailData
): Promise<boolean> {
  // Skip if Gmail credentials are not configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Gmail credentials not configured, skipping email for status:', status)
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
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Doctor Planet" <${process.env.GMAIL_USER}>`,
      to: data.customerEmail,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully for order ${data.orderNumber} - Status: ${status}`, result.messageId)
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

// Send verification code email for password reset
export async function sendVerificationCodeEmail(
  email: string,
  name: string,
  code: string
): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Gmail credentials not configured, skipping verification code email')
    return false
  }

  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"Doctor Planet" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Doctor Planet',
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
            .code-box { background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8B0000; font-family: monospace; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .warning { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Doctor Planet</h1>
            </div>
            <div class="content">
              <h2 style="text-align: center; color: #333;">Password Reset Code</h2>
              
              <p style="text-align: center;">Hi ${name || 'there'},</p>
              
              <p style="text-align: center;">Use the following verification code to reset your password:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                ⏰ <strong>This code will expire in 2 minutes.</strong><br>
                If you didn't request this, you can safely ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Verification code email sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send verification code email:', error)
    return false
  }
}

// Send welcome email to new salesman with credentials
export async function sendSalesmanWelcomeEmail(
  email: string,
  name: string,
  password: string
): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Gmail credentials not configured, skipping salesman welcome email')
    return false
  }

  try {
    const transporter = createTransporter()
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`

    const mailOptions = {
      from: `"Doctor Planet" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Doctor Planet - Your Salesman Account',
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
            .welcome-badge { background: #10B981; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .credentials { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .credential-row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; display: flex; }
            .credential-row:last-child { border-bottom: none; }
            .credential-label { font-weight: bold; color: #666; width: 100px; }
            .credential-value { color: #333; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 4px; flex: 1; }
            .btn { display: inline-block; background: #8B0000; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .warning { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
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
                <div class="welcome-badge">🎉 Welcome to the Team!</div>
              </div>
              
              <h2>Hello ${name}!</h2>
              <p>You have been added as a <strong>Salesman</strong> at Doctor Planet. Below are your login credentials:</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #8B0000;">Your Login Credentials</h3>
                <div class="credential-row">
                  <span class="credential-label">Name:</span>
                  <span class="credential-value">${name}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">${email}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                🔐 <strong>Important:</strong> Please change your password after your first login for security.
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="btn">Login Now</a>
              </div>
              
              <p style="text-align: center; color: #666;">
                If you have any questions, contact your administrator.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Salesman welcome email sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send salesman welcome email:', error)
    return false
  }
}

// Admin emails to notify for new orders
const ADMIN_EMAILS = [
  'doctorplanet.dawood@gmail.com',
  'doctorplanet.usama@gmail.com',
  'doctorplanet.huzaifa@gmail.com',
]

// Send new order notification to all admins
export async function sendAdminOrderNotification(data: OrderEmailData): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Gmail credentials not configured, skipping admin notification')
    return false
  }

  try {
    const transporter = createTransporter()
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders`

    const mailOptions = {
      from: `"Doctor Planet" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAILS.join(', '),
      subject: `🔔 New Order #${data.orderNumber} - PKR ${data.total.toFixed(0)}`,
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
            .badge { background: #10B981; color: white; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .item { padding: 15px 0; border-bottom: 1px solid #e0e0e0; }
            .item:last-child { border-bottom: none; }
            .btn { display: inline-block; background: #8B0000; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 10px 10px; }
            .total-box { background: #FEF3C7; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .total-amount { font-size: 32px; font-weight: bold; color: #8B0000; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Doctor Planet</h1>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <div class="badge">🔔 New Order Received!</div>
              </div>
              
              <h2 style="text-align: center; color: #333;">Order #${data.orderNumber}</h2>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #8B0000;">Customer Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${data.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${data.customerEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${data.shippingAddress.phone}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">
                    ${data.shippingAddress.address}, ${data.shippingAddress.city}${data.shippingAddress.state ? `, ${data.shippingAddress.state}` : ''} ${data.shippingAddress.postalCode}
                  </span>
                </div>
              </div>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #8B0000;">Order Items (${data.items.length})</h3>
                ${data.items.map(item => `
                  <div class="item">
                    <div style="font-weight: bold;">${item.product.name}</div>
                    ${item.size || item.color ? `<div style="color: #666; font-size: 14px;">${item.size ? `Size: ${item.size}` : ''} ${item.color ? `| Color: ${item.color}` : ''}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                      <span style="color: #666;">Qty: ${item.quantity}</span>
                      <span style="font-weight: bold; color: #8B0000;">PKR ${(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total-box">
                <div style="color: #666; margin-bottom: 10px;">Order Total</div>
                <div class="total-amount">PKR ${data.total.toFixed(0)}</div>
                <div style="color: #666; margin-top: 10px; font-size: 14px;">💵 Payment: Cash on Delivery (COD)</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${adminUrl}" class="btn">View in Admin Panel</a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification sent to all administrators.</p>
              <p>© ${new Date().getFullYear()} Doctor Planet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`Admin notification sent for order ${data.orderNumber} to: ${ADMIN_EMAILS.join(', ')}`, result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    return false
  }
}
