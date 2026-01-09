'use client'

import { useState, useEffect } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { Company, CompanySettings } from '@/lib/database'
import { useToast } from '@/components/ui/toast'

interface InventorySettingsProps {
    company: Company | null
    onSave: (updates: Partial<Company>) => Promise<void>
}

export function InventorySettings({ company, onSave }: InventorySettingsProps) {
    const [method, setMethod] = useState<'fifo' | 'weighted-avg'>('fifo')
    const [allowNegative, setAllowNegative] = useState(false)
    const [trackCost, setTrackCost] = useState(true)
    const [saving, setSaving] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (company?.settings?.inventory) {
            setMethod(company.settings.inventory.valuationMethod)
            setAllowNegative(company.settings.inventory.allowNegative)
            setTrackCost(company.settings.inventory.trackCost)
        }
    }, [company])

    const handleSave = async () => {
        if (!company) return
        setSaving(true)
        try {
            const currentSettings = company.settings || {}
            const newSettings: CompanySettings = {
                ...currentSettings,
                inventory: {
                    valuationMethod: method,
                    trackCost,
                    allowNegative
                }
            }

            await onSave({ settings: newSettings })
            toast.success('Settings Saved', 'Inventory preferences updated successfully.')
        } catch (error) {
            console.error(error)
            toast.error('Save Failed', 'Could not update settings.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Inventory Configuration</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Manage how your stock is valued and tracked.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg divide-y divide-gray-200 border border-gray-200">
                {/* Valuation Method */}
                <div className="p-6">
                    <fieldset>
                        <legend className="text-base font-medium text-gray-900">Valuation Method</legend>
                        <p className="text-sm text-gray-500 mb-4">Select how you want to calculate the cost of goods sold.</p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="fifo"
                                    name="method"
                                    type="radio"
                                    checked={method === 'fifo'}
                                    onChange={() => setMethod('fifo')}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="fifo" className="ml-3 block text-sm font-medium text-gray-700">
                                    FIFO (First-In, First-Out)
                                    <span className="block text-xs font-normal text-gray-500">Assumes items bought first are sold first. Standard for most retail.</span>
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="weighted"
                                    name="method"
                                    type="radio"
                                    checked={method === 'weighted-avg'}
                                    onChange={() => setMethod('weighted-avg')}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="weighted" className="ml-3 block text-sm font-medium text-gray-700">
                                    Weighted Average
                                    <span className="block text-xs font-normal text-gray-500">Averages the cost of all items in stock. Good for commodities.</span>
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>

                {/* Rules */}
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Stock Rules</h4>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="track_cost"
                                    type="checkbox"
                                    checked={trackCost}
                                    onChange={(e) => setTrackCost(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="track_cost" className="font-medium text-gray-700">Enable Cost Tracking</label>
                                <p className="text-gray-500">Calculate COGS automatically when invoices are created.</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="allow_negative"
                                    type="checkbox"
                                    checked={allowNegative}
                                    onChange={(e) => setAllowNegative(e.target.checked)}
                                    className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="allow_negative" className="font-medium text-gray-900">Allow Negative Inventory</label>
                                <p className="text-gray-500">Allow selling items even if stock count is zero.</p>
                                {allowNegative && (
                                    <div className="mt-2 flex items-center p-2 bg-yellow-50 rounded-md text-yellow-800 text-xs">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Warning: Accountants generally advise against this as it complicates COGS calculation.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    )
}
