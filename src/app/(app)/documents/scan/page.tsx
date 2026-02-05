'use client'

import Link from 'next/link'
import DocumentUploader from '@/components/documents/DocumentUploader'
import type { ExtractedData } from '@/lib/ocr'
import { createExpense } from '@/app/actions/expenses'
import { useState } from 'react'

export default function DocumentScannerPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleExtracted = async (data: ExtractedData) => {
        setIsSubmitting(true)
        try {
            // Convert string amount to number if needed or ensure types match
            const result = await createExpense({
                description: data.vendor || 'Unknown Vendor',
                amount: typeof data.amount === 'string' ? parseFloat(data.amount) : (data.amount || 0),
                category: data.category || 'Uncategorized',
                date: data.date || new Date().toISOString().split('T')[0],
                vendor: data.vendor || null,
                tax_rate: 0, // Default or extract if possible
                tax_amount: typeof data.taxAmount === 'string' ? parseFloat(data.taxAmount) : (data.taxAmount || 0),
                total_amount: typeof data.amount === 'string' ? parseFloat(data.amount) : (data.amount || 0),
                status: 'pending'
            })

            if (result.success) {
                alert('Expense created successfully!')
            } else {
                alert(`Failed to create expense: ${result.error}`)
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">TwineCapital</h1>
                    <p className="text-gray-600">Accounting, Intelligently Engineered</p>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="px-8 py-3 flex space-x-6">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                    <Link href="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                    <Link href="/invoices" className="text-gray-600 hover:text-gray-900">Invoices</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Document Scanner</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h2 className="text-3xl font-bold text-gray-900">AI Document Scanner</h2>
                        </div>
                        <p className="text-gray-600 text-lg">
                            Upload receipts and invoices - we'll extract the data automatically using AI
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-blue-900">Instant Extraction</p>
                                    <p className="text-sm text-blue-700">Vendor, date, amounts in seconds</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-green-900">VAT Calculation</p>
                                    <p className="text-sm text-green-700">Automatic tax extraction</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-purple-900">Auto-Categorize</p>
                                    <p className="text-sm text-purple-700">Smart expense categories</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Uploader */}
                    <DocumentUploader onExtracted={handleExtracted} />

                    {/* How it works */}
                    <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-lg">1</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Upload</h4>
                                <p className="text-sm text-gray-600">Drag & drop or click to upload your receipt or invoice</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-lg">2</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Extract</h4>
                                <p className="text-sm text-gray-600">AI reads the document and extracts key information</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-lg">3</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Review</h4>
                                <p className="text-sm text-gray-600">Check the extracted data (or let high-confidence items auto-post)</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-lg">4</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">Done</h4>
                                <p className="text-sm text-gray-600">Expense is created and categorized automatically</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
