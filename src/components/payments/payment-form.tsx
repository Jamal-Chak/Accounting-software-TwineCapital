'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { PaymentInput } from '@/lib/payments'

interface PaymentFormProps {
    invoiceId: string
    invoiceNumber: string
    totalAmount: number
    onSubmit: (payment: PaymentInput) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function PaymentForm({
    invoiceId,
    invoiceNumber,
    totalAmount,
    onSubmit,
    onCancel,
    isSubmitting = false
}: PaymentFormProps) {
    const [formData, setFormData] = useState<PaymentInput>({
        invoice_id: invoiceId,
        amount: totalAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        reference: '',
        notes: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than zero'
        }

        if (formData.amount > totalAmount) {
            newErrors.amount = 'Amount cannot exceed invoice total'
        }

        if (!formData.payment_date) {
            newErrors.payment_date = 'Payment date is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            await onSubmit(formData)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Record Payment</h3>
                        <p className="text-sm text-gray-500 mt-1">Invoice: {invoiceNumber}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">R</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max={totalAmount}
                                required
                                className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="0.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Invoice Total: {formatCurrency(totalAmount)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="payment_date"
                            value={formData.payment_date}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white ${errors.payment_date ? 'border-red-500' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting}
                        />
                        {errors.payment_date && (
                            <p className="mt-1 text-sm text-red-500">{errors.payment_date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            disabled={isSubmitting}
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="check">Check</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference Number
                        </label>
                        <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="e.g. Transaction ID, Check number"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white resize-none"
                            placeholder="Additional notes about this payment"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
