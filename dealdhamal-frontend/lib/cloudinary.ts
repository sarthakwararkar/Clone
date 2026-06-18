export const uploadToCloudinary = async (
  file: File,
  folder: 'stores' | 'banners' | 'avatars'
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', `coupondunia/${folder}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json() as { secure_url: string }
  return data.secure_url
}
