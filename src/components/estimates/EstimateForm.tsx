'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createEstimate, updateEstimate, getClients, type Estimate, type EstimateItem, type Client } from '@/lib/database'

interface EstimateFormProps {
    estimate?: Estimate
    onClose: () => void
    onSuccess: () => void
}

export function EstimateForm({ estimate, onClose, onSuccess }: EstimateFormProps) {
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [formData, setFormData] = useState({
        client_id: estimate?.client_id || '',
        estimate_number: estimate?.estimate_number || `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        issue_date: estimate?.issue_date || new Date().toISOString().split('T')[0],
        expiry_date: estimate?.expiry_date || '',
        status: estimate?.status || 'draft' as const,
        notes: estimate?.notes || ''
    })

    const [items, setItems] = useState<Omit<EstimateItem, 'id' | 'created_at' | 'estimate_id'>[]>(
        estimate?.items?.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            total_amount: item.total_amount
        })) || [
            { description: '', quantity: 1, unit_price: 0, tax_rate: 0, total_amount: 0 }
        ]
    )

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        const data = await getClients()
        setClients(data)
    }

    const calculateItemTotal = (item: typeof items[0]) => {
        const subtotal = item.quantity * item.unit_price
        const tax = subtotal * (item.tax_rate / 100)
        return subtotal + tax
    }

    const handleItemChange = (index: number, field: keyof typeof items[0], value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // Recalculate total if quantity, price or tax changes
        if (['quantity', 'unit_price', 'tax_rate'].includes(field)) {
            newItems[index].total_amount = calculateItemTotal(newItems[index])
        }

        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0, total_amount: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tax_rate / 100)), 0)
        const totalAmount = subtotal + taxAmount
        return { subtotal, taxAmount, totalAmount }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const totals = calculateTotals()

            const estimateData = {
                client_id: formData.client_id || null,
                estimate_number: formData.estimate_number,
                issue_date: formData.issue_date,
                expiry_date: formData.expiry_date || null,
                status: formData.status,
                notes: formData.notes || null,
                subtotal: totals.subtotal,
                tax_amount: totals.taxAmount,
                total_amount: totals.totalAmount
            }

            const result = estimate
                ? await updateEstimate(estimate.id, estimateData, items)
                : await createEstimate(estimateData, items)

            if (result.success) {
                onSuccess()
                onClose()
            } else {
                alert(`Error: ${result.error}`)
            }
        } catch (error) {
            console.error('Error saving estimate:', error)
            alert('Failed to save estimate')
        } finally {
            setLoading(false)
        }
    }

    const totals = calculateTotals()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {estimate ? 'Edit Estimate' : 'New Estimate'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client
                            </label>
                            <select
                                value={formData.client_id}
                                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimate Number
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.estimate_number}
                                onChange={(e) => setFormData({ ...formData, estimate_number: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.issue_date}
                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                        />
                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Qty</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Price</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Tax %</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.tax_rate}
                                                    onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Total</label>
                                                <div className="px-3 py-2 bg-gray-100 rounded-md text-right font-medium">
                                                    {item.total_amount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="mt-1 text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal:</span>
                                <span>{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax:</span>
                                <span>{totals.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                                <span>Total:</span>
                                <span>{totals.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add notes or terms..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : estimate ? 'Update Estimate' : 'Create Estimate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
