'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { validateFileUpload } from '@/lib/validation'

interface PhotoUploadProps {
  ticketId: string
  type: 'before' | 'after'
  onUploadSuccess?: (url: string) => void
  existingUrl?: string
  disabled?: boolean
}

export default function PhotoUpload({ 
  ticketId, 
  type, 
  onUploadSuccess, 
  existingUrl,
  disabled = false 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setError(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ticketId', ticketId)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPreview(data.url)
        onUploadSuccess?.(data.url)
      } else {
        const error = await response.json()
        setError(error.error || 'Upload failed')
        setPreview(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 capitalize">
              {type} Photo
            </h4>
            {preview && !disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt={`${type} photo`}
                className="w-full h-48 object-cover rounded-lg border"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
              {!isUploading && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={handleClick}
              className={`
                w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
                ${disabled 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-primary-yellow hover:bg-yellow-50'
                }
              `}
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {isUploading ? 'Uploading...' : `Click to upload ${type} photo`}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!preview && !disabled && (
            <Button
              variant="outline"
              onClick={handleClick}
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : `Upload ${type} Photo`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

