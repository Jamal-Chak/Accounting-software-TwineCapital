'use client'

import { useState } from 'react'
import { Check, Send, XCircle, AlertCircle, Edit } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { updateInvoiceStatus } from '@/lib/database'
import type { Invoice } from '@/lib/database'

interface InvoiceActionsProps {
    invoice: Invoice
    onStatusChange?: () => void
}

export function InvoiceActions({ invoice, onStatusChange }: InvoiceActionsProps) {
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const handleStatusChange = async (newStatus: Invoice['status']) => {
        if (loading) return

        const statusLabels = {
            draft: 'Draft',
            sent: 'Sent',
            paid: 'Paid',
            overdue: 'Overdue',
            cancelled: 'Cancelled'
        }

        // Confirmation for certain actions
        if (newStatus === 'cancelled') {
            if (!confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
                return
            }
        }

        setLoading(true)
        try {
            const result = await updateInvoiceStatus(invoice.id, newStatus)

            if (result.success) {
                toast.success(
                    'Invoice Updated',
                    `Invoice marked as ${statusLabels[newStatus]}`
                )
                onStatusChange?.()
            } else {
                toast.error('Update Failed', result.error || 'Could not update invoice status')
            }
        } catch (error) {
            console.error('Error updating invoice status:', error)
            toast.error('Update Failed', 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const canEdit = invoice.status === 'draft'
    const canSend = invoice.status === 'draft'
    const canMarkPaid = invoice.status === 'sent' || invoice.status === 'overdue'
    const canCancel = invoice.status !== 'paid' && invoice.status !== 'cancelled'

    return (
        <div className="flex flex-wrap gap-2">
            {canEdit && (
                <a
                    href={`/invoices/${invoice.id}/edit`}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </a>
            )}

            {canSend && (
                <button
                    onClick={() => handleStatusChange('sent')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                    Mark as Sent
                </button>
            )}

            {canMarkPaid && (
                <button
                    onClick={() => handleStatusChange('paid')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check className="w-4 h-4" />
                    Mark as Paid
                </button>
            )}

            {invoice.status === 'sent' && (
                <button
                    onClick={() => handleStatusChange('overdue')}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <AlertCircle className="w-4 h-4" />
                    Mark as Overdue
                </button>
            )}

            {canCancel && (
                <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <XCircle className="w-4 h-4" />
                    Cancel Invoice
                </button>
            )}
        </div>
    )
}
