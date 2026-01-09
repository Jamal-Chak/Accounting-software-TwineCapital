
'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { analyzeFraud, FraudAlert } from '@/lib/fraud'
import { AlertTriangle, ShieldCheck, TrendingUp, Calendar, Copy, DollarSign } from 'lucide-react'

export default function FraudDetectionPage() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await analyzeFraud()
            setAlerts(data)
        } catch (error) {
            console.error('Error analyzing fraud:', error)
        } finally {
            setLoading(false)
        }
    }

    const highRiskCount = alerts.filter(a => a.severity === 'high').length
    const mediumRiskCount = alerts.filter(a => a.severity === 'medium').length

    // Determine overall health
    let healthStatus = 'Secure'
    let healthColor = 'text-green-600'
    let healthBg = 'bg-green-100'

    if (highRiskCount > 0) {
        healthStatus = 'Critical Attention Needed'
        healthColor = 'text-red-600'
        healthBg = 'bg-red-100'
    } else if (mediumRiskCount > 2) {
        healthStatus = 'Moderate Risk'
        healthColor = 'text-orange-600'
        healthBg = 'bg-orange-100'
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'duplicate': return <Copy className="w-5 h-5 text-red-500" />
            case 'outlier': return <TrendingUp className="w-5 h-5 text-orange-500" />
            case 'weekend': return <Calendar className="w-5 h-5 text-gray-500" />
            case 'round_number': return <DollarSign className="w-5 h-5 text-purple-500" />
            default: return <AlertTriangle className="w-5 h-5 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing financial patterns...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="Risk & Fraud Console"
                description="AI-driven analysis of suspicious financial patterns."
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Risk Console' }]}
                action={
                    <button onClick={loadData} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Refresh Analysis
                    </button>
                }
            />

            {/* Health Scorecard */}
            <div className={`mb-8 p-6 rounded-lg border ${highRiskCount > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${highRiskCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                        {highRiskCount > 0 ? <AlertTriangle className="w-8 h-8 text-red-600" /> : <ShieldCheck className="w-8 h-8 text-green-600" />}
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold ${highRiskCount > 0 ? 'text-red-900' : 'text-green-900'}`}>{healthStatus}</h2>
                        <p className={`text-sm ${highRiskCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {highRiskCount} High Risk Alerts, {mediumRiskCount} Medium Risk Alerts
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Detected Anomalies</h3>
                </div>

                {alerts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <ShieldCheck className="w-16 h-16 text-green-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">All Clear</p>
                        <p>No suspicious activity detected.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(alert.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 capitalize">{alert.type.replace('_', ' ')}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                    alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(alert.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                                                Source: {alert.sourceType.toUpperCase()} #{alert.sourceId.slice(0, 8)}
                                            </span>
                                            <span>Amount: {formatCurrency(alert.amount)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Actions could go here */}
                                        <button
                                            className="text-sm text-blue-600 hover:underline"
                                            onClick={() => alert('Feature coming: Navigate to source')}
                                        >
                                            Investigate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
