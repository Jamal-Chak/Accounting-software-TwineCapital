'use client'

import { useState, useCallback } from 'react'
import { processDocumentOCR, getConfidenceLevel, type ExtractedData } from '@/lib/ocr'

interface DocumentUploaderProps {
    onExtracted?: (data: ExtractedData) => void
}

export default function DocumentUploader({ onExtracted }: DocumentUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [preview, setPreview] = useState<string | null>(null)
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isCreatingExpense, setIsCreatingExpense] = useState(false)
    const [expenseCreated, setExpenseCreated] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            await processFile(files[0])
        }
    }, [])

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            await processFile(files[0])
        }
    }, [])

    const processFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG or PNG)')
            return
        }

        // Reset state
        setError(null)
        setPreview(null)
        setExtractedData(null)
        setProgress(0)
        setIsProcessing(true)

        try {
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            // Process with OCR
            const result = await processDocumentOCR(file, (p) => {
                setProgress(Math.round(p * 100))
            })

            if (result.success && result.data) {
                setExtractedData(result.data)
                if (onExtracted) {
                    onExtracted(result.data)
                }
            } else {
                setError(result.error || 'Failed to process document')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsProcessing(false)
            setProgress(0)
        }
    }

    const createExpense = async () => {
        if (!extractedData) return
        setIsCreatingExpense(true)
        setError(null)
        try {
            const response = await fetch('/api/documents/create-expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extractedData, documentUrl: preview, fileName: 'scanned_receipt.jpg' })
            })
            const result = await response.json()
            if (result.success) {
                setExpenseCreated(true)
                setTimeout(() => { setPreview(null); setExtractedData(null); setExpenseCreated(false) }, 3000)
            } else {
                setError(result.error || 'Failed to create expense')
            }
        } catch (err) {
            setError('Network error: Could not create expense')
        } finally {
            setIsCreatingExpense(false)
        }
    }

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'Not found'
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const confidenceLevel = extractedData ? getConfidenceLevel(extractedData.confidence) : null
    const confidenceColor = {
        high: 'text-green-600 bg-green-50',
        medium: 'text-orange-600 bg-orange-50',
        low: 'text-red-600 bg-red-50'
    }[confidenceLevel || 'low']

    return (
        <div className="max-w-4xl mx-auto">
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                />

                <div className="flex flex-col items-center gap-4">
                    <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    <div>
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Click to upload
                        </label>
                        <span className="text-gray-600"> or drag and drop</span>
                    </div>

                    <p className="text-sm text-gray-500">
                        JPG or PNG up to 10MB
                    </p>
                </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <p className="font-medium text-gray-900">Processing document...</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Results */}
            {extractedData && preview && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Document Preview</h3>
                        <img
                            src={preview}
                            alt="Document preview"
                            className="w-full h-auto rounded border border-gray-200"
                        />
                    </div>

                    {/* Extracted Data */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Extracted Data</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
                                {Math.round(extractedData.confidence * 100)}% Confidence
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                                <input
                                    type="text"
                                    value={extractedData.vendor || ''}
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50"
                                    placeholder="Not detected"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={extractedData.date || ''}
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                    <input
                                        type="text"
                                        value={formatCurrency(extractedData.amount)}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">VAT Amount</label>
                                    <input
                                        type="text"
                                        value={formatCurrency(extractedData.taxAmount)}
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={extractedData.category || 'Uncategorized'}
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50"
                                />
                            </div>

                            {extractedData.items.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {extractedData.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                                <span className="text-gray-900">{item.description}</span>
                                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {expenseCreated ? (
                            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <p className="text-green-800 font-medium">✅ Expense created successfully!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex gap-3">
                                <button onClick={createExpense} disabled={isCreatingExpense} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isCreatingExpense ? 'Creating...' : 'Create Expense'}
                                </button>
                                <button onClick={() => { setPreview(null); setExtractedData(null) }} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
