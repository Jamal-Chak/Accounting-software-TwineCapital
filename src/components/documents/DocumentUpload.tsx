'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument } from '@/lib/database'

interface DocumentUploadProps {
    folder?: string
    entityType?: string
    entityId?: string
    onUploadComplete: () => void
}

export function DocumentUpload({
    folder = 'General',
    entityType,
    entityId,
    onUploadComplete
}: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleUpload(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleUpload(e.target.files[0])
        }
    }

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        setError(null)

        try {
            const result = await uploadDocument(file, folder, entityType, entityId)

            if (result.success) {
                onUploadComplete()
            } else {
                setError(result.error || 'Failed to upload file')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    )}

                    <div className="text-sm text-gray-600">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Click to upload
                        </button>
                        {' '}or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOCX up to 10MB
                    </p>
                </div>

                {error && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-red-50 text-red-600 text-xs rounded-b-lg flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
