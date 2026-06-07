/**
 * Upload a file to Cloudinary via the server API
 * @param file - The file to upload
 * @param folder - The folder path (e.g., 'products', 'testimonials')
 * @returns The URL of the uploaded file
 */
export async function uploadToFirebase(file: File, folder: string = 'products'): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.')
  }

  // Create form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  // Upload via server API
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload image')
  }

  const data = await response.json()
  return data.url
}

/**
 * Upload multiple files
 * @param files - Array of files to upload
 * @param folder - The folder path
 * @returns Array of URLs
 */
export async function uploadMultipleToFirebase(files: File[], folder: string = 'products'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToFirebase(file, folder))
  return Promise.all(uploadPromises)
}

// Alias for clarity
export const uploadImage = uploadToFirebase
export const uploadMultipleImages = uploadMultipleToFirebase
