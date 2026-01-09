'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CashflowProjection } from '@/lib/analytics'

export default function CashflowDashboard() {
    const [projections, setProjections] = useState<CashflowProjection[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/cashflow')
            const result = await response.json()

            if (result.success) {
                setProjections(result.data)
            } else {
                setError(result.error || 'Failed to load data')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0
        }).format(amount)
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
                    <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Cashflow Forecast</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">13-Week Cashflow Forecast</h2>
                        <p className="text-gray-600">AI-powered projection of your future financial health</p>
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
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Current Balance</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(projections[0]?.openingBalance || 0)}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Projected Inflow (13 Weeks)</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(projections.reduce((sum, p) => sum + p.predictedInflow, 0))}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Projected Outflow (13 Weeks)</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(projections.reduce((sum, p) => sum + p.predictedOutflow, 0))}
                                    </p>
                                </div>
                            </div>

                            {/* Chart Placeholder (Visual Bar Chart) */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Projection</h3>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {projections.map((week, idx) => {
                                        const maxVal = Math.max(...projections.map(p => Math.max(p.predictedInflow, p.predictedOutflow)))
                                        const inflowHeight = (week.predictedInflow / maxVal) * 100
                                        const outflowHeight = (week.predictedOutflow / maxVal) * 100

                                        return (
                                            <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap">
                                                    <div>Week: {week.weekStartDate}</div>
                                                    <div className="text-green-300">In: {formatCurrency(week.predictedInflow)}</div>
                                                    <div className="text-red-300">Out: {formatCurrency(week.predictedOutflow)}</div>
                                                    <div className="font-bold mt-1">End: {formatCurrency(week.closingBalance)}</div>
                                                </div>

                                                <div className="w-full flex gap-1 items-end h-full">
                                                    <div
                                                        className="w-1/2 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-all"
                                                        style={{ height: `${Math.max(inflowHeight, 2)}%` }}
                                                    ></div>
                                                    <div
                                                        className="w-1/2 bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-all"
                                                        style={{ height: `${Math.max(outflowHeight, 2)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-2 rotate-45 origin-left truncate w-full">
                                                    {week.weekStartDate.slice(5)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Detailed Table */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Opening</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">Inflow</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">Outflow</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Closing</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {projections.map((week, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{week.weekStartDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(week.openingBalance)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">+{formatCurrency(week.predictedInflow)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">-{formatCurrency(week.predictedOutflow)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatCurrency(week.closingBalance)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${week.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                                                            week.confidence > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {Math.round(week.confidence * 100)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
