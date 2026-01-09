'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Paperclip } from 'lucide-react'
import { getDocuments, deleteDocument, getDocumentUrl, type Document } from '@/lib/database'
import { DocumentUpload } from './DocumentUpload'

interface AttachmentsListProps {
    entityType: string
    entityId: string
    folder?: string
}

export function AttachmentsList({ entityType, entityId, folder = 'General' }: AttachmentsListProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [showUpload, setShowUpload] = useState(false)

    useEffect(() => {
        loadDocuments()
    }, [entityType, entityId])

    const loadDocuments = async () => {
        setLoading(true)
        const data = await getDocuments(undefined, entityType, entityId)
        setDocuments(data)
        setLoading(false)
    }

    const handleDelete = async (doc: Document) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                    Attachments
                    <span className="text-sm font-normal text-gray-500">({documents.length})</span>
                </h3>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {showUpload ? 'Cancel Upload' : 'Add Attachment'}
                </button>
            </div>

            {showUpload && (
                <div className="mb-4">
                    <DocumentUpload
                        folder={folder}
                        entityType={entityType}
                        entityId={entityId}
                        onUploadComplete={() => {
                            setShowUpload(false)
                            loadDocuments()
                        }}
                    />
                </div>
            )}

            {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading attachments...</div>
            ) : documents.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No attachments yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
