import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/**
 * Upload a file to Cloudinary from a base64 data URL
 * @param dataUrl - Base64 encoded image data URL
 * @param folder - The folder in Cloudinary (e.g., 'products', 'testimonials')
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(dataUrl: string, folder: string = 'products'): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `doctorplanet/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto quality
        { fetch_format: 'auto' }, // Auto format (WebP when supported)
      ],
    })
    return result.secure_url
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(error.message || 'Failed to upload image to Cloudinary')
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
  }
}
