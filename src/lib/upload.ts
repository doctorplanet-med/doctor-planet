import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param folder - The folder path in storage (e.g., 'products', 'testimonials')
 * @returns The download URL of the uploaded file
 */
export async function uploadToFirebase(file: File, folder: string = 'products'): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split('.').pop()
  const filename = `${folder}/${timestamp}-${randomString}.${extension}`

  // Create storage reference
  const storageRef = ref(storage, filename)

  // Upload file
  const snapshot = await uploadBytes(storageRef, file)

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref)

  return downloadURL
}

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param folder - The folder path in storage
 * @returns Array of download URLs
 */
export async function uploadMultipleToFirebase(files: File[], folder: string = 'products'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToFirebase(file, folder))
  return Promise.all(uploadPromises)
}
