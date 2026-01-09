'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HealthScore } from '@/lib/health'

export default function HealthScoreDashboard() {
    const [health, setHealth] = useState<HealthScore | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/health')
            const result = await response.json()

            if (result.success) {
                setHealth(result.data)
            } else {
                setError(result.error || 'Failed to load health data')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100'
        if (score >= 60) return 'bg-yellow-100'
        return 'bg-red-100'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">TwineCapital</h1>
                    <p className="text-gray-600">Accounting, Intelligently Engineered</p>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="px-8 py-3 flex space-x-6">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                    <Link href="/analytics/cashflow" className="text-gray-600 hover:text-gray-900">Cashflow</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Health Score</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Business Health Score</h2>
                        <p className="text-gray-600">AI-driven analysis of your company's financial performance</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : health && (
                        <>
                            {/* Hero Score Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">Overall Health Score</h3>
                                    <div className="flex items-baseline gap-4">
                                        <span className={`text-6xl font-bold ${getScoreColor(health.totalScore)}`}>
                                            {health.totalScore}
                                        </span>
                                        <span className="text-gray-400 text-xl">/ 100</span>
                                    </div>
                                    <p className="text-gray-600 mt-2">
                                        {health.totalScore >= 80 ? 'Excellent! Your business is thriving.' :
                                            health.totalScore >= 60 ? 'Good. Some areas need attention.' :
                                                'Needs Improvement. Action required.'}
                                    </p>
                                </div>

                                {/* Circular Progress Placeholder */}
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#eee"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={health.totalScore >= 80 ? '#16a34a' : health.totalScore >= 60 ? '#ca8a04' : '#dc2626'}
                                            strokeWidth="3"
                                            strokeDasharray={`${health.totalScore}, 100`}
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Pillars Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Profitability */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold text-gray-900">Profitability</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(health.pillars.profitability.score)} ${getScoreColor(health.pillars.profitability.score)}`}>
                                            {health.pillars.profitability.score}/100
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Net Margin</span>
                                            <span className="font-medium">{health.pillars.profitability.metrics.netMargin.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Gross Margin</span>
                                            <span className="font-medium">{health.pillars.profitability.metrics.grossMargin.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Liquidity */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold text-gray-900">Liquidity</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(health.pillars.liquidity.score)} ${getScoreColor(health.pillars.liquidity.score)}`}>
                                            {health.pillars.liquidity.score}/100
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Current Ratio</span>
                                            <span className="font-medium">{health.pillars.liquidity.metrics.currentRatio.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Quick Ratio</span>
                                            <span className="font-medium">{health.pillars.liquidity.metrics.quickRatio.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Cash Runway</span>
                                            <span className="font-medium">{health.pillars.liquidity.metrics.cashRunway.toFixed(1)} mo</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Working Capital</span>
                                            <span className={`font-medium ${health.pillars.liquidity.metrics.workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                R{health.pillars.liquidity.metrics.workingCapital.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Efficiency */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold text-gray-900">Efficiency</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(health.pillars.efficiency.score)} ${getScoreColor(health.pillars.efficiency.score)}`}>
                                            {health.pillars.efficiency.score}/100
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">AR Overdue</span>
                                            <span className="font-medium">{health.pillars.efficiency.metrics.arAging.toFixed(1)}%</span>
                                        </div>
                                        <div className="pl-2 space-y-1 border-l-2 border-gray-200">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">0-30 days</span>
                                                <span className="text-gray-600">R{health.pillars.efficiency.metrics.arAging30.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">31-60 days</span>
                                                <span className="text-orange-600">R{health.pillars.efficiency.metrics.arAging60.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">90+ days</span>
                                                <span className="text-red-600">R{health.pillars.efficiency.metrics.arAging90Plus.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">DSO (Days)</span>
                                            <span className="font-medium">{Math.round(health.pillars.efficiency.metrics.dso)} days</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Expense Ratio</span>
                                            <span className="font-medium">{health.pillars.efficiency.metrics.expenseRatio.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Growth */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold text-gray-900">Growth</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBg(health.pillars.growth.score)} ${getScoreColor(health.pillars.growth.score)}`}>
                                            {health.pillars.growth.score}/100
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Revenue Growth</span>
                                            <span className="font-medium">+{health.pillars.growth.metrics.revenueGrowth}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    AI Recommendations
                                </h3>
                                <ul className="space-y-3">
                                    {health.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                        rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                                                    {rec.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">{rec.category}</div>
                                                <p className="text-gray-700 text-sm">{rec.message}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
