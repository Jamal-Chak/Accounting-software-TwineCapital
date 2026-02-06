'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Upload, Search, Folder, File, MoreVertical, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react'
import { getDocuments, deleteDocument, getDocumentUrl, type Document } from '@/lib/database'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentFolder, setCurrentFolder] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)

    const loadDocuments = async () => {
        setLoading(true)
        const data = await getDocuments(currentFolder || undefined)
        setDocuments(data)
        setLoading(false)
    }

    useEffect(() => {
        loadDocuments()
    }, [currentFolder])

    const handleDelete = async (doc: Document) => {
        if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return

        const result = await deleteDocument(doc.id, doc.storage_path)
        if (result.success) {
            loadDocuments()
        } else {
            alert(`Error: ${result.error}`)
        }
    }

    const handleDownload = (doc: Document) => {
        const url = getDocumentUrl(doc.storage_path)
        window.open(url, '_blank')
    }

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const folders = ['General', 'Invoices', 'Receipts', 'Contracts', 'Bank Statements']

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-8 h-8 text-purple-500" />
        if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
        return <File className="w-8 h-8 text-blue-500" />
    }

    return (
        <div>
            <PageHeader
                title="Documents"
                description="Manage and organize your business documents"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Documents' }
                ]}
                action={
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{showUpload ? 'Cancel Upload' : 'Upload File'}</span>
                    </button>
                }
            />

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <button
                            onClick={() => setCurrentFolder(null)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!currentFolder
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All Files
                        </button>
                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => setCurrentFolder(folder)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentFolder === folder
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {folder}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {showUpload && (
                        <div className="mb-8 max-w-xl mx-auto">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
                            <DocumentUpload
                                folder={currentFolder || 'General'}
                                onUploadComplete={() => {
                                    setShowUpload(false)
                                    loadDocuments()
                                }}
                            />
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <div className="text-gray-400 mb-4">
                                <File className="w-12 h-12 mx-auto" />
                            </div>
                            <p className="text-gray-500 mb-2">No documents found</p>
                            <p className="text-gray-400 text-sm">Upload files to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredDocuments.map((doc) => (
                                <div key={doc.id} className="group relative bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            {getFileIcon(doc.type)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1" title={doc.name}>
                                        {doc.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {doc.entity_type && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                Linked to {doc.entity_type}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
