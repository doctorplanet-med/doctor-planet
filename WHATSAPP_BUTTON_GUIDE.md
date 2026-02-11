# WhatsApp Floating Button - Setup Guide

## ✅ Feature Overview

A beautiful floating WhatsApp button has been added to your website. It appears on all customer-facing pages (not in admin/salesman areas) and allows visitors to instantly chat with you on WhatsApp.

## 🎨 Features

- **Floating button** - Fixed position in bottom-right corner
- **Smooth animations** - Scale and pulse effects with Framer Motion
- **Hover tooltip** - "Chat with us on WhatsApp" message
- **Smart visibility** - Only shows when WhatsApp number is configured
- **Responsive** - Works perfectly on mobile and desktop
- **Professional design** - Uses official WhatsApp green color (#25D366)

## 📱 How to Configure

### Step 1: Add Your WhatsApp Number

1. Go to **Admin Panel** → **Settings**
2. Scroll to the **"Contact Information"** section
3. Find the **"WhatsApp Number"** field
4. Enter your WhatsApp number in international format **without** the `+` sign
   
   **Examples:**
   - Pakistan: `923001234567` (not +92 300 1234567)
   - USA: `14155551234` (not +1 415 555 1234)
   - UK: `447123456789` (not +44 7123 456789)

5. Click **"Save Changes"**

### Step 2: Test It

1. Visit your website homepage
2. Look for the green floating button in the bottom-right corner
3. Click it to open WhatsApp chat
4. Hover over it to see the tooltip

## 🔧 Technical Details

### Files Created/Modified

```
src/components/layout/whatsapp-float.tsx       (NEW) - Floating button component
src/components/layout/layout-wrapper.tsx       (UPDATED) - Added WhatsApp float
```

### How It Works

1. Component fetches WhatsApp number from `/api/settings`
2. If number exists, button appears with animation
3. Click opens WhatsApp Web/App with pre-filled message
4. Default message: "Hello! I need assistance with Doctor Planet products."

### API Integration

- **Endpoint**: `GET /api/settings`
- **Field**: `whatsappNumber`
- **Database**: `SiteSettings.whatsappNumber`

## 🎨 Customization

### Change Default Message

Edit `src/components/layout/whatsapp-float.tsx`:

```typescript
const message = 'Your custom message here'
```

### Change Position

Modify the button classes:

```typescript
// Current: bottom-6 right-6
// Left side: bottom-6 left-6
// Top right: top-20 right-6
className="fixed bottom-6 right-6 z-50 ..."
```

### Change Colors

```typescript
// Change green color
bg-[#25D366] hover:bg-[#20BD5A]  // Current WhatsApp green

// Alternative colors:
bg-blue-500 hover:bg-blue-600    // Blue
bg-purple-500 hover:bg-purple-600 // Purple
```

### Change Icon Size

```typescript
<MessageCircle className="w-7 h-7" /> // Current size
<MessageCircle className="w-8 h-8" /> // Larger
<MessageCircle className="w-6 h-6" /> // Smaller
```

### Disable Tooltip

Remove this section:

```typescript
<span className="absolute right-full mr-3 ...">
  Chat with us on WhatsApp
</span>
```

### Disable Pulse Animation

Remove this section:

```typescript
<span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
```

## 📱 Mobile Responsiveness

The button automatically adjusts for mobile devices:
- Opens WhatsApp app on mobile
- Opens WhatsApp Web on desktop
- Touch-friendly size (64px × 64px)
- Safe positioning away from browser controls

## 🔒 Privacy & Security

- No tracking or analytics
- Direct link to WhatsApp (no intermediary)
- Only shows when admin configures it
- No data stored or logged

## 🐛 Troubleshooting

### Button Not Showing

1. Check if WhatsApp number is set in Admin → Settings
2. Verify number format (no +, no spaces, no dashes)
3. Check browser console for errors
4. Clear browser cache and reload

### WhatsApp Not Opening

1. Verify WhatsApp number is correct
2. Test the number manually: `https://wa.me/YOUR_NUMBER`
3. Ensure WhatsApp is installed (on mobile)
4. Check if browser is blocking popups

### Button Overlapping Content

Adjust the `z-index` in the component:

```typescript
className="... z-50 ..." // Increase if needed (e.g., z-[60])
```

## 💡 Tips

1. **Test thoroughly** - Send a test message to yourself first
2. **Update regularly** - Change the number if you switch phones
3. **Monitor** - Check if customers are using it (WhatsApp will show messages)
4. **Business account** - Consider WhatsApp Business for better features
5. **Response time** - Reply quickly to maintain customer satisfaction

## 🌍 International Format Reference

| Country | Format | Example |
|---------|--------|---------|
| Pakistan | 92XXXXXXXXXX | 923001234567 |
| India | 91XXXXXXXXXX | 919876543210 |
| USA | 1XXXXXXXXXX | 14155551234 |
| UK | 44XXXXXXXXXX | 447123456789 |
| UAE | 971XXXXXXXXX | 971501234567 |
| Saudi Arabia | 966XXXXXXXXX | 966501234567 |

## ✅ Next Steps

1. Add your WhatsApp number in Admin Settings
2. Test the button on your live site
3. Share your website with customers
4. Monitor and respond to WhatsApp messages

---

**Note**: The button only appears on customer-facing pages (home, products, checkout, etc.) and is hidden in admin/salesman areas for a cleaner dashboard experience.
