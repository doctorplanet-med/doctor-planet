# Doctor Planet - Vercel Deployment Guide (with Turso)

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Resend account (free at resend.com)
- **Turso account (free at turso.tech) - 9GB storage!**

---

## Step 1: Set Up Turso Database (FREE - 9GB!)

### 1.1 Create Turso Account
1. Go to [turso.tech](https://turso.tech)
2. Click **"Get Started"** and sign up with GitHub

### 1.2 Install Turso CLI (Optional but recommended)
```bash
# Windows (PowerShell as Admin)
irm https://get.turso.tech/install.ps1 | iex

# Or use npx (no install needed)
npx turso
```

### 1.3 Create Database
**Option A: Using Turso Dashboard (Easiest)**
1. Go to [turso.tech/app](https://turso.tech/app)
2. Click **"Create Database"**
3. Name: `doctor-planet`
4. Region: Choose closest to your users
5. Click **Create**

**Option B: Using CLI**
```bash
turso auth login
turso db create doctor-planet
```

### 1.4 Get Connection Details
**From Dashboard:**
1. Click on your database
2. Go to **"Connect"** tab
3. Copy:
   - **Database URL:** `libsql://doctor-planet-yourusername.turso.io`
   - **Auth Token:** Click "Create Token" → Copy the token

**From CLI:**
```bash
turso db show doctor-planet --url
turso db tokens create doctor-planet
```

---

## Step 2: Set Up Email (Resend - FREE)

### 2.1 Get API Key
1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)

### 2.2 Verify Your Domain (Important!)
1. Go to **Domains** → **Add Domain**
2. Add your domain (e.g., `doctorplanet.com`)
3. Add the DNS records to your domain registrar
4. Wait for verification

### 2.3 Email Settings
- **With verified domain:** `Doctor Planet <orders@yourdomain.com>`
- **Without domain (testing):** `Doctor Planet <onboarding@resend.dev>` (limited)

---

## Step 3: Push Code to GitHub

### 3.1 Create Repository
1. Go to [github.com](https://github.com) → **New Repository**
2. Name: `doctor-planet`
3. Make it **Private**

### 3.2 Push Code
```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/doctor-planet.git

# Push
git branch -M main
git push -u origin main
```

### 3.3 Important: Check .gitignore
Make sure these are in `.gitignore`:
```
node_modules
.env
.env.local
prisma/dev.db
prisma/dev.db-journal
.next
```

---

## Step 4: Deploy to Vercel

### 4.1 Connect Repository
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import `doctor-planet` repository

### 4.2 Add Environment Variables
In Vercel → Project Settings → **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `file:./dev.db` | Required but ignored in production |
| `TURSO_DATABASE_URL` | `libsql://doctor-planet-xxx.turso.io` | Your Turso URL |
| `TURSO_AUTH_TOKEN` | `eyJhbG...` | Your Turso token |
| `NEXTAUTH_SECRET` | `your-32-char-secret` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Same as above |
| `RESEND_API_KEY` | `re_...` | Your Resend key |
| `RESEND_FROM_EMAIL` | `Doctor Planet <orders@yourdomain.com>` | After domain verification |
| `ADMIN_EMAIL` | `admin@doctorplanet.com` | Admin login |
| `ADMIN_PASSWORD` | `YourSecurePassword!` | **Change this!** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Your Firebase key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `doctor-planet.firebaseapp.com` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `doctor-planet` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `doctor-planet.firebasestorage.app` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `988678982146` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:988678982146:web:...` | |

### 4.3 Deploy
Click **Deploy** and wait!

---

## Step 5: Initialize Production Database

After deployment, push your schema to Turso:

### 5.1 Push Schema
Run this locally:
```bash
# Install Turso CLI if not installed
irm https://get.turso.tech/install.ps1 | iex

# Login to Turso
turso auth login

# Push local database to Turso
turso db shell doctor-planet < prisma/dev.db.sql
```

**Or export and import manually:**
```bash
# Export local SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Import to Turso (in dashboard or CLI)
turso db shell doctor-planet < backup.sql
```

### 5.2 Alternative: Start Fresh
If you want to start with empty database, the schema will be created automatically when Prisma runs.

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel
1. Project Settings → **Domains**
2. Add: `doctorplanet.com` and `www.doctorplanet.com`

### 6.2 DNS Records
Add at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 6.3 Update Environment Variables
- `NEXTAUTH_URL` = `https://doctorplanet.com`
- `NEXT_PUBLIC_APP_URL` = `https://doctorplanet.com`

---

## Local Development

Your local setup continues to work with SQLite:

```bash
# Local dev - uses SQLite (prisma/dev.db)
npm run dev
```

No changes needed for local development!

---

## Quick Reference

### Turso Dashboard
- Database URL: `libsql://doctor-planet-username.turso.io`
- Create tokens: Database → Connect → Create Token

### Useful Commands
```bash
# Generate secret key
openssl rand -base64 32

# Push Prisma schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# View Turso database
turso db shell doctor-planet

# Check Turso databases
turso db list
```

---

## Troubleshooting

### "Connection refused" error
- Check TURSO_DATABASE_URL is correct
- Check TURSO_AUTH_TOKEN is valid
- Make sure database region matches

### Emails not sending
- Check RESEND_API_KEY
- Remove RESEND_TEST_EMAIL in production
- Verify domain in Resend dashboard

### Authentication issues
- NEXTAUTH_URL must match your domain exactly
- NEXTAUTH_SECRET must be at least 32 characters
- Clear cookies and try again

### Build fails
- Make sure all env vars are set in Vercel
- Check `npm run build` works locally
- Look at Vercel build logs

---

## Security Checklist

- [ ] Changed ADMIN_PASSWORD
- [ ] Generated secure NEXTAUTH_SECRET  
- [ ] Removed RESEND_TEST_EMAIL
- [ ] Made GitHub repo private
- [ ] Verified email domain in Resend

---

## Free Tier Limits

| Service | Free Limit |
|---------|------------|
| **Turso** | 9 GB storage, 500 databases |
| **Vercel** | 100 GB bandwidth/month |
| **Resend** | 100 emails/day, 3000/month |
| **Firebase** | 5 GB storage |

More than enough for a small-medium e-commerce store!
