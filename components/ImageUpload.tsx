'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onUpload: (url: string) => void
  label?: string
  className?: string
  type?: 'logo' | 'photo' | 'gallery'
  compact?: boolean
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImageUpload({
  currentImageUrl,
  onUpload,
  label = 'Upload Image',
  className = '',
  type = 'logo',
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl || currentImageUrl

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 5MB.'
    }
    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsUploading(true)

    // Create local preview
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUpload(data.url)
      setPreviewUrl(data.url)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Clean up local preview URL
      URL.revokeObjectURL(localPreview)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Compact mode for gallery uploads
  if (compact) {
    return (
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50 bg-[var(--bg-hover)]'
        } ${className}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        {isUploading ? (
          <svg
            className="animate-spin h-6 w-6 text-[var(--color-primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            <svg className="w-8 h-8 text-[var(--text-muted)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-[var(--text-muted)]">Add photo</span>
          </>
        )}
        {error && <p className="text-xs text-[var(--error)] mt-1 text-center px-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer ${
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg
              className="animate-spin h-10 w-10 text-[var(--color-primary)] mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
          </div>
        ) : displayUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--bg-hover)] flex-shrink-0">
              <Image
                src={displayUrl}
                alt="Uploaded image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] font-medium truncate">
                Image uploaded
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Click to replace or drag a new image
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="text-xs text-[var(--error)] hover:underline mt-2"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <svg
              className="w-12 h-12 text-[var(--text-muted)] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-[var(--text-primary)] font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              PNG, JPG, WebP, or GIF (max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--error)] mt-2">{error}</p>
      )}
    </div>
  )
}
