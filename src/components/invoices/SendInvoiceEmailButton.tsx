'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { sendInvoiceEmail } from '@/app/actions/email'

interface SendInvoiceEmailButtonProps {
    invoiceId: string
    invoiceNumber: string
    clientEmail?: string | null
}

export function SendInvoiceEmailButton({ invoiceId, invoiceNumber, clientEmail }: SendInvoiceEmailButtonProps) {
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!clientEmail) {
            alert('This client has no email address on file.')
            return
        }

        if (!confirm(`Send invoice ${invoiceNumber} to ${clientEmail}?`)) {
            return
        }

        setSending(true)
        try {
            const result = await sendInvoiceEmail(invoiceId)

            if (!result.success) {
                alert(result.error || 'Failed to send email')
                return
            }

            alert(result.message || `Invoice sent successfully to ${clientEmail}`)
        } catch (error) {
            console.error('Error sending invoice:', error)
            alert('Failed to send invoice email')
        } finally {
            setSending(false)
        }
    }

    return (
        <button
            onClick={handleSend}
            disabled={sending || !clientEmail}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!clientEmail ? 'Client has no email address' : 'Send invoice to client'}
        >
            <Mail className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send to Client'}
        </button>
    )
}
