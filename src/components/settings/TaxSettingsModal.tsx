'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { addTaxRate, deleteTaxRate, type TaxRate } from '@/lib/database'

interface TaxSettingsModalProps {
    companyId: string
    taxRates: TaxRate[]
    onClose: () => void
    onRefresh: () => Promise<void>
}

export function TaxSettingsModal({ companyId, taxRates, onClose, onRefresh }: TaxSettingsModalProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTaxRate, setNewTaxRate] = useState({ name: '', rate: 0 })
    const [saving, setSaving] = useState(false)

    const handleAddTaxRate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const result = await addTaxRate({
            company_id: companyId,
            name: newTaxRate.name,
            rate: newTaxRate.rate,
            is_default: false
        })
        if (result.success) {
            setNewTaxRate({ name: '', rate: 0 })
            setShowAddForm(false)
            await onRefresh()
        }
        setSaving(false)
    }

    const handleDeleteTaxRate = async (id: string) => {
        if (confirm('Are you sure you want to delete this tax rate?')) {
            const result = await deleteTaxRate(id)
            if (result.success) {
                await onRefresh()
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Tax Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Tax Rates</h3>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Tax Rate
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddTaxRate} className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newTaxRate.name}
                                        onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                                        placeholder="e.g., Standard VAT"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newTaxRate.rate}
                                        onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-2">
                        {taxRates.map((rate) => (
                            <div key={rate.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{rate.name}</span>
                                            {rate.is_default && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">{rate.rate}%</span>
                                    </div>
                                </div>
                                {!rate.is_default && (
                                    <button
                                        onClick={() => handleDeleteTaxRate(rate.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
