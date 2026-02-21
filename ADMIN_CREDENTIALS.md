# Admin Panel Access - Credentials

## Admin Accounts Created

All admin accounts have been created with the following credentials:

### Admin 1: Dawood
- **Email:** `doctorplanet.dawood@gmail.com`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Access:** Full admin panel access

### Admin 2: Usama
- **Email:** `doctorplanet.usama@gmail.com`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Access:** Full admin panel access

### Admin 3: Huzaifa
- **Email:** `doctorplanet.huzaifa@gmail.com`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Access:** Full admin panel access

### Original Admin (Existing)
- **Email:** `admin@doctorplanet.com`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Access:** Full admin panel access

## Login Instructions

1. Go to: [https://www.doctorplanet.pk/login](https://www.doctorplanet.pk/login)
   - Or for local: [http://localhost:3000/login](http://localhost:3000/login)

2. Enter your email and password

3. After login, you'll be redirected to the admin dashboard

## Admin Panel URL
- **Production:** https://www.doctorplanet.pk/admin
- **Local:** http://localhost:3000/admin

## Features Available

As an admin, you have access to:
- ✅ **Dashboard** - Overview of sales, orders, and revenue
- ✅ **Products Management** - Add, edit, delete products
- ✅ **Orders Management** - View and manage customer orders
- ✅ **POS Sales** - View all POS transactions
- ✅ **Shops Management** - Manage shop accounts and credit
- ✅ **Udhar Accounts** - Track credit transactions and payments
- ✅ **Users Management** - Manage customers and salesmen
- ✅ **Categories** - Manage product categories
- ✅ **Site Settings** - Configure website settings
- ✅ **Content Management** - Manage banners, testimonials, team members

## Email Notifications

All three admin emails will receive:
- 🔔 **New Order Notifications** - Instant email when a customer places an order
- 📧 **Complete order details** including customer info, items, and delivery address
- 🔗 **Direct link** to view/manage the order in admin panel

## Security Recommendations

⚠️ **IMPORTANT: Please change your password after first login**

To change password:
1. Login to admin panel
2. Click on your profile (top right)
3. Go to Settings or Profile
4. Change password to something secure and unique

### Password Requirements:
- At least 8 characters
- Include uppercase and lowercase letters
- Include numbers
- Include special characters (recommended)

## Database Location

### Production (Turso)
- Admin accounts are stored in: `libsql://doctor-planet-doctorplanet-med.aws-ap-south-1.turso.io`
- Region: AWS Mumbai (ap-south-1)

### Local Development
- Admin accounts are stored in: `prisma/dev.db` (SQLite)

## Support

If you have any issues logging in:
1. Verify you're using the correct email
2. Password is case-sensitive: `Admin@123`
3. Clear browser cache and cookies
4. Try a different browser
5. Contact the technical team if issues persist

## Status: ✅ COMPLETE

All four admin accounts are now active and can access the admin panel at www.doctorplanet.pk/admin
