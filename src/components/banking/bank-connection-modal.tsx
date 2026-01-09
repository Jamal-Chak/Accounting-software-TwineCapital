'use client'

import { useState } from 'react'
import { X, Building2, AlertCircle, ExternalLink } from 'lucide-react'

interface BankConnectionModalProps {
    onClose: () => void
    onSuccess: () => void
}

const SOUTH_AFRICAN_BANKS = [
    { id: 'fnb', name: 'FNB (First National Bank)', color: 'bg-orange-600' },
    { id: 'standard-bank', name: 'Standard Bank', color: 'bg-blue-700' },
    { id: 'absa', name: 'ABSA', color: 'bg-red-600' },
    { id: 'nedbank', name: 'Nedbank', color: 'bg-green-700' },
    { id: 'capitec', name: 'Capitec Bank', color: 'bg-blue-500' }
] as const

export function BankConnectionModal({
    onClose,
    onSuccess
}: BankConnectionModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConnectBank = async () => {
        try {
            setLoading(true)
            setError(null)

            // Call initiate endpoint to get OAuth URL
            const response = await fetch('/api/banking/connect/initiate')
            const data = await response.json()

            if (!response.ok) {
                if (data.demoMode) {
                    setError('Stitch API not configured. Please add STITCH_CLIENT_ID and STITCH_CLIENT_SECRET to your environment variables.')
                    return
                }
                throw new Error(data.error || 'Failed to initiate connection')
            }

            // Redirect to Stitch OAuth page
            window.location.href = data.authUrl
        } catch (err) {
            console.error('Error connecting bank:', err)
            setError(err instanceof Error ? err.message : 'Failed to connect bank')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Connect Bank Account</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Secure connection via Stitch Open Banking
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800">
                                    <p className="font-medium mb-1">Connection Error</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Secure Connection</p>
                                <p>You'll be redirected to Stitch's secure platform to authorize access to your bank account. Your credentials are never shared with us.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Supported Banks</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SOUTH_AFRICAN_BANKS.map((bank) => (
                                <div
                                    key={bank.id}
                                    className="p-4 border-2 border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center`}>
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {bank.name.split('(')[0].trim()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">What happens next?</h4>
                        <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <span className="font-semibold text-blue-600">1.</span>
                                <span>You'll be redirected to Stitch's secure platform</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-blue-600">2.</span>
                                <span>Select your bank and log in with your banking credentials</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-blue-600">3.</span>
                                <span>Authorize TwineCapital to access your account information</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-blue-600">4.</span>
                                <span>You'll be redirected back to complete the setup</span>
                            </li>
                        </ol>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConnectBank}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Connect via Stitch</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-center text-gray-500">
                        Powered by <a href="https://stitch.money" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stitch</a> - South Africa's leading Open Banking platform
                    </p>
                </div>
            </div>
        </div>
    )
}
