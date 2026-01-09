'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface AIInvoiceAssistantProps {
    onInvoiceParsed: (data: {
        customer: string
        amount: number
        description: string
        items: Array<{ description: string; quantity: number; unit_price: number }>
        due_date?: string
        notes?: string
    }) => void
}

export function AIInvoiceAssistant({ onInvoiceParsed }: AIInvoiceAssistantProps) {
    const [nlInput, setNlInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleGenerate = async () => {
        if (!nlInput.trim()) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch('/api/ai/parse-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: nlInput })
            })

            const result = await response.json()

            if (result.success) {
                onInvoiceParsed(result.data)
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
                setNlInput('') // Clear input after success
            } else {
                setError(result.error || 'Failed to parse invoice')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        AI Invoice Assistant
                        <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Beta</span>
                    </h3>
                    <p className="text-sm text-gray-600">Describe your invoice in plain language</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <textarea
                        value={nlInput}
                        onChange={(e) => setNlInput(e.target.value)}
                        placeholder='Example: "Create invoice for Acme Corp for R5,000 for website development. Due in 30 days. 2 items: design at R2,500 and coding at R2,500"'
                        rows={4}
                        className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Invoice data generated! Check the form below.</span>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading || !nlInput.trim()}
                    className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Invoice</span>
                        </>
                    )}
                </button>

                <div className="bg-white/50 rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        <strong>Tip:</strong> Include customer name, amount, description, line items, and due date.
                        The AI will extract details and pre-fill the form for you.
                    </p>
                </div>
            </div>
        </div>
    )
}
