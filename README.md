# Doctor Planet - Medical Boutique E-Commerce

A professional, responsive e-commerce website for a medical boutique built with Next.js 14, featuring medical clothes, shoes, and equipment.

![Doctor Planet Logo](./public/logos/Full%20Logo.png)

## Features

- **Professional UI/UX**: Modern, responsive design with smooth animations
- **Product Categories**: Medical Clothes, Medical Shoes, Medical Equipment
- **User Authentication**: 
  - Email/Password registration for customers (no setup required!)
  - GitHub OAuth (optional, free)
  - Credentials-based login for Admin
- **Shopping Cart**: Persistent cart with local storage
- **Admin Dashboard**: Stock management, order tracking, analytics
- **Checkout System**: Full checkout flow with order management

## Color Palette

- **Maroon/Primary**: #A52A2A (from logo)
- **Red Accent**: #C41E3A
- **Black**: #1a1a1a
- **White**: #ffffff

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   
   # GitHub OAuth (Optional - Free, no card required)
   # GITHUB_CLIENT_ID="your-github-client-id"
   # GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Admin Credentials
   ADMIN_EMAIL="admin@doctorplanet.com"
   ADMIN_PASSWORD="Admin@123"
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database** (creates admin user and sample products):
   ```bash
   npm run db:seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

### Admin Login
- **Email**: admin@doctorplanet.com
- **Password**: Admin@123

### Customer Login
- Use Google OAuth (requires setting up Google credentials)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── checkout/          # Checkout page
│   ├── login/             # Authentication page
│   ├── orders/            # User orders page
│   ├── products/          # Products listing & detail
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── cart/             # Cart components
│   ├── home/             # Home page sections
│   ├── layout/           # Navbar, Footer
│   ├── orders/           # Order components
│   ├── products/         # Product components
│   └── providers/        # Context providers
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── store/                 # Zustand stores
│   └── cart-store.ts     # Cart state management
└── types/                 # TypeScript types
```

## Admin Features

1. **Dashboard**: Overview of store statistics
2. **Products Management**: Add, edit, delete products, update stock
3. **Orders Management**: View and process customer orders
4. **Categories**: Manage product categories
5. **Analytics**: View sales and traffic data

## Setting Up GitHub OAuth (Optional - 100% Free)

If you want social login, GitHub OAuth is completely free with no card required:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Doctor Planet
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy Client ID and generate a Client Secret
6. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

**Note**: Email/Password registration works without any OAuth setup!

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

For production, switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` to your PostgreSQL connection string

## License

MIT License

---

Built with ❤️ for healthcare professionals
