'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'

interface FollowUpEmailGeneratorProps {
    invoiceId: string
    invoiceNumber: string
    customerName: string
    amount: number
    dueDate: string
    onGenerate: (subject: string, body: string) => void
}

export function FollowUpEmailGenerator({
    invoiceId,
    invoiceNumber,
    customerName,
    amount,
    dueDate,
    onGenerate
}: FollowUpEmailGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [generated, setGenerated] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const today = new Date()
            const due = new Date(dueDate)
            const diffTime = today.getTime() - due.getTime()
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            const response = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    invoiceNumber,
                    amount,
                    daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
                    previousFollowups: 0 // Mock for now
                })
            })

            const result = await response.json()
            if (result.success) {
                onGenerate(result.data.subject, result.data.body)
                setGenerated(true)
                setTimeout(() => setGenerated(false), 3000)
            }
        } catch (error) {
            console.error('Error generating email:', error)
            alert('Failed to generate email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Follow-up Assistant
                </h3>
            </div>
            <p className="text-xs text-blue-700 mb-4">
                Generate a professional follow-up email for this invoice.
            </p>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : generated ? (
                    <>
                        <Check className="w-4 h-4" />
                        Generated!
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate Follow-up
                    </>
                )}
            </button>
        </div>
    )
}
