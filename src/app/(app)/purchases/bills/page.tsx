'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, Search, Filter, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

export default function BillsPage() {
    const [showUpload, setShowUpload] = useState(false)

    return (
        <div>
            <PageHeader
                title="Bills"
                description="Manage bills from your vendors"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Purchases' },
                    { label: 'Bills' }
                ]}
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Document</span>
                        </button>
                        <Link
                            href="/purchases/bills/create"
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Bill</span>
                        </Link>
                    </div>
                }
            />

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Upload Bill Document</h3>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <DocumentUpload
                            folder="Bills"
                            onUploadComplete={() => {
                                setShowUpload(false)
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bills..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-500 mb-2 text-lg">No bills yet</p>
                    <p className="text-gray-400 mb-6">Record your first bill from a vendor</p>
                    <Link
                        href="/purchases/bills/create"
                        className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create New Bill</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
