'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadInvoicePDF } from '@/app/actions/pdf'

interface DownloadInvoicePDFButtonProps {
    invoiceId: string
    invoiceNumber: string
}

export function DownloadInvoicePDFButton({ invoiceId, invoiceNumber }: DownloadInvoicePDFButtonProps) {
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const result = await downloadInvoicePDF(invoiceId)

            if (!result.success || !result.pdf) {
                alert(result.error || 'Failed to generate PDF')
                return
            }

            // Convert base64 to blob and download
            const byteCharacters = atob(result.pdf)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = result.filename || `invoice-${invoiceNumber}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Failed to download PDF')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
    )
}
