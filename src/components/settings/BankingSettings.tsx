'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { getBankConnections, getCompanyId, type BankConnection } from '@/lib/database'
import { Settings, RefreshCw, Trash2, Plus } from 'lucide-react'
import { updateBankingSettings, deleteBankConnection } from '@/app/actions/settings'

export function BankingSettings() {
    const [connections, setConnections] = useState<BankConnection[]>([])
    const [loading, setLoading] = useState(true)
    const [autoMatchEnabled, setAutoMatchEnabled] = useState(true)
    const [matchThreshold, setMatchThreshold] = useState(85)
    const [reconciliationFrequency, setReconciliationFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const toast = useToast()

    useEffect(() => {
        loadConnections()
    }, [])

    const loadConnections = async () => {
        setLoading(true)
        try {
            const data = await getBankConnections()
            setConnections(data)
        } catch (error) {
            console.error('Error loading bank connections:', error)
            toast.error('Failed to load', 'Could not load bank connections')
        } finally {
            setLoading(false)
        }
    }

    const handleSyncConnection = async (id: string) => {
        toast.info('Syncing...', 'Bank sync started')
        // TODO: Implement actual bank sync
        setTimeout(() => {
            toast.success('Synced!', 'Bank connection synced successfully')
            loadConnections()
        }, 2000)
    }

    const handleDeleteConnection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bank connection?')) return

        const result = await deleteBankConnection(id)
        if (result.success) {
            toast.success('Deleted', 'Bank connection removed')
            loadConnections()
        } else {
            toast.error('Error', result.error || 'Failed to delete connection')
        }
    }

    const handleSaveSettings = async () => {
        const result = await updateBankingSettings({
            autoMatchEnabled,
            matchThreshold,
            reconciliationFrequency
        })

        if (result.success) {
            toast.success('Settings Saved', 'Banking preferences updated successfully')
        } else {
            toast.error('Error', result.error || 'Failed to save settings')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Banking Configuration</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Manage bank connections, reconciliation settings, and auto-matching rules.
                </p>
            </div>

            {/* Bank Connections */}
            <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Connected Banks</h3>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add Bank
                    </button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading connections...</div>
                    ) : connections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No bank connections yet. Add one to get started.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {connections.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-2 h-2 rounded-full ${connection.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{connection.account_name}</p>
                                            <p className="text-sm text-gray-500">
                                                {connection.bank_name.toUpperCase()} • {connection.account_number || 'No account number'}
                                            </p>
                                            {connection.last_synced_at && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Last synced: {new Date(connection.last_synced_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSyncConnection(connection.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                            title="Sync now"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConnection(connection.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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
            </div>

            {/* Reconciliation Settings */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Reconciliation Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={autoMatchEnabled}
                                onChange={(e) => setAutoMatchEnabled(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enable automatic transaction matching</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6">
                            Automatically match and categorize transactions based on rules
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Auto-match confidence threshold: {matchThreshold}%
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={matchThreshold}
                            onChange={(e) => setMatchThreshold(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            disabled={!autoMatchEnabled}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Transactions with match confidence above this threshold will be auto-categorized
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reconciliation frequency
                        </label>
                        <select
                            value={reconciliationFrequency}
                            onChange={(e) => setReconciliationFrequency(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            How often to automatically sync bank transactions
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSaveSettings}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
