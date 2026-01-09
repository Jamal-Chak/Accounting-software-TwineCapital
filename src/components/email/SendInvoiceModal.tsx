'use client'

import { useState } from 'react'
import { X, Mail, Loader2 } from 'lucide-react'

interface SendInvoiceModalProps {
    invoiceId: string
    invoiceNumber: string
    defaultEmail?: string
    initialSubject?: string
    initialBody?: string
    onClose: () => void
    onSuccess: () => void
}

export function SendInvoiceModal({
    invoiceId,
    invoiceNumber,
    defaultEmail = '',
    initialSubject = '',
    initialBody = '',
    onClose,
    onSuccess,
}: SendInvoiceModalProps) {
    const [email, setEmail] = useState(defaultEmail)
    const [subject, setSubject] = useState(initialSubject)
    const [body, setBody] = useState(initialBody)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSending(true)

        try {
            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoiceId,
                    recipientEmail: email,
                    subject,
                    body
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invoice')
            }

            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send invoice')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Send Invoice</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={sending}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice Number
                        </label>
                        <input
                            type="text"
                            value={invoiceNumber}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipient Email *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="client@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Invoice #12345"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Optional message..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={sending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending || !email}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send Invoice
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
