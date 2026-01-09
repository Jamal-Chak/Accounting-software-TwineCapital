'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown, Shield, Loader2 } from 'lucide-react'

interface DiscountSuggestionProps {
    customerId: string | null
    invoiceAmount: number
}

export function DiscountSuggestion({ customerId, invoiceAmount }: DiscountSuggestionProps) {
    const [suggestion, setSuggestion] = useState<{
        shouldOffer: boolean
        discountPercent: number
        reasoning: string
    } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!customerId || invoiceAmount === 0) {
            setSuggestion(null)
            return
        }

        // Fetch discount suggestion
        const fetchSuggestion = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/ai/suggest-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId, invoiceAmount })
                })

                const result = await response.json()
                if (result.success) {
                    setSuggestion(result.data)
                }
            } catch (error) {
                console.error('Error fetching discount suggestion:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestion()
    }, [customerId, invoiceAmount])

    if (!customerId || invoiceAmount === 0) return null
    if (loading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700">Analyzing customer for discount opportunities...</span>
            </div>
        )
    }
    if (!suggestion || !suggestion.shouldOffer) return null

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                        AI Suggests {suggestion.discountPercent}% Discount
                    </h4>
                    <p className="text-sm text-green-700 mb-3">{suggestion.reasoning}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">
                            Save: R{(invoiceAmount * suggestion.discountPercent / 100).toLocaleString()}
                        </span>
                        <span className="text-xs text-green-600">•</span>
                        <span className="text-xs text-green-600">
                            New Total: R{(invoiceAmount * (1 - suggestion.discountPercent / 100)).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface LatePaymentRiskProps {
    customerId: string | null
    invoiceAmount: number
    dueDate: string
}

export function LatePaymentRisk({ customerId, invoiceAmount, dueDate }: LatePaymentRiskProps) {
    const [risk, setRisk] = useState<{
        riskLevel: 'low' | 'medium' | 'high'
        probability: number
        factors: string[]
        recommendations: string[]
    } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!customerId || invoiceAmount === 0 || !dueDate) {
            setRisk(null)
            return
        }

        // Fetch risk prediction
        const fetchRisk = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/ai/predict-late-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId, invoiceAmount, dueDate })
                })

                const result = await response.json()
                if (result.success) {
                    setRisk(result.data)
                }
            } catch (error) {
                console.error('Error fetching payment risk:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRisk()
    }, [customerId, invoiceAmount, dueDate])

    if (!customerId || invoiceAmount === 0 || !dueDate) return null
    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                <span className="text-sm text-gray-700">Analyzing payment risk...</span>
            </div>
        )
    }
    if (!risk) return null

    const riskColors = {
        low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-100 text-green-800', icon: 'text-green-600' },
        medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800', icon: 'text-yellow-600' },
        high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-100 text-red-800', icon: 'text-red-600' }
    }

    const colors = riskColors[risk.riskLevel]

    return (
        <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 shadow-sm`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${risk.riskLevel === 'high' ? 'bg-red-600' : risk.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {risk.riskLevel === 'high' ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                    ) : (
                        <Shield className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className={`text-sm font-semibold ${colors.text}`}>Late Payment Risk</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                            {risk.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                            {risk.probability}% probability
                        </span>
                    </div>

                    {risk.factors.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Risk Factors:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {risk.factors.map((factor, idx) => (
                                    <li key={idx} className="text-xs text-gray-600">{factor}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {risk.recommendations.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {risk.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-xs text-gray-600">{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
