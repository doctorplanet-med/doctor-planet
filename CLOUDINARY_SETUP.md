# Cloudinary Setup for Image Uploads

## Problem
Vercel has a read-only filesystem, so we cannot save uploaded images to `/public/uploads`. We need to use cloud storage.

## Solution
Using **Cloudinary** for image storage (already installed in package.json).

## Setup Steps

### 1. Create Cloudinary Account (if you don't have one)
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. After login, go to Dashboard

### 2. Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Add Environment Variables

#### Local Development (`.env.local`):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Vercel Production:
1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME` = your_cloud_name
   - `CLOUDINARY_API_KEY` = your_api_key
   - `CLOUDINARY_API_SECRET` = your_api_secret
5. Click **Save**
6. Redeploy your project

## How It Works

### Before (Local Filesystem - ❌ Fails on Vercel):
```
User uploads → Saves to /public/uploads → Returns /uploads/filename.jpg
```

### After (Cloudinary - ✅ Works on Vercel):
```
User uploads → Uploads to Cloudinary → Returns Cloudinary URL
```

## Features

- ✅ Works on Vercel (no filesystem needed)
- ✅ Automatic image optimization
- ✅ CDN delivery (fast worldwide)
- ✅ Automatic backups
- ✅ Image transformations available
- ✅ Free tier: 25 GB storage, 25 GB bandwidth/month

## Upload API

**Endpoint:** `POST /api/upload`

**Request:**
- FormData with `file` field
- Requires ADMIN authentication

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/doctor-planet/image.jpg",
  "publicId": "doctor-planet/image"
}
```

## Migration Notes

- All new uploads will go to Cloudinary
- Old images in `/public/uploads` will still work locally
- You may want to upload existing images to Cloudinary and update database URLs
- Images are stored in `doctor-planet` folder in Cloudinary

## Testing

1. After adding env variables, test locally:
   ```bash
   npm run dev
   ```
2. Go to admin panel and try uploading an image
3. Verify the returned URL is a Cloudinary URL (starts with `https://res.cloudinary.com`)
4. Push to GitHub and let Vercel auto-deploy
5. Test on production after deployment

## Troubleshooting

### Error: "Upload error: Missing required configuration"
- Make sure all three env variables are set in Vercel
- Redeploy after adding env variables

### Error: "Invalid credentials"
- Double-check your Cloudinary API credentials
- Make sure there are no extra spaces in the env values

### Images not showing
- Check if the URL is accessible (paste in browser)
- Verify the image was uploaded to Cloudinary dashboard
- Check browser console for CORS errors
