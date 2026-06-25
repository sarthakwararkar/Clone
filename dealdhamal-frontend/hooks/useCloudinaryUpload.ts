'use client'
import { useState, useCallback } from 'react'

interface UseCloudinaryUploadReturn {
  upload: (file: File, folder: 'stores' | 'banners' | 'avatars') => Promise<string>
  uploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(
    (file: File, folder: 'stores' | 'banners' | 'avatars'): Promise<string> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'coupondunia_unsigned')
        formData.append('folder', `coupondunia/${folder}`)

        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
          }
        })

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText) as { secure_url: string }
              setUploading(false)
              resolve(data.secure_url)
            } else {
              const err = 'Upload failed. Try again.'
              setError(err)
              setUploading(false)
              reject(new Error(err))
            }
          }
        }

        xhr.addEventListener('error', () => {
          const err = 'Upload failed. Try again.'
          setError(err)
          setUploading(false)
          reject(new Error(err))
        })

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmodstdsx'
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
        setUploading(true)
        setProgress(0)
        setError(null)
        xhr.send(formData)
      })
    },
    []
  )

  return { upload, uploading, progress, error, reset }
}
