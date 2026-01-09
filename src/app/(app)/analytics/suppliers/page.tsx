'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SupplierAnalytics } from '@/lib/business-analytics'
import { TrendingUp, TrendingDown, Minus, DollarSign, Package, Award } from 'lucide-react'

export default function SuppliersAnalyticsPage() {
    const [suppliers, setSuppliers] = useState<SupplierAnalytics[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/suppliers')
            const result = await response.json()

            if (result.success) {
                setSuppliers(result.data)
            } else {
                setError(result.error || 'Failed to load supplier analytics')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-600" />
        if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-600" />
        return <Minus className="w-4 h-4 text-gray-600" />
    }

    const getTrendColor = (trend: string) => {
        if (trend === 'increasing') return 'text-red-600 bg-red-50'
        if (trend === 'decreasing') return 'text-green-600 bg-green-50'
        return 'text-gray-600 bg-gray-50'
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading supplier analytics...</p>
                </div>
            </div>
        )
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
                    <Link href="/analytics/health" className="text-gray-600 hover:text-gray-900">Health Score</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Supplier Analytics</span>
                    <Link href="/analytics/customers" className="text-gray-600 hover:text-gray-900">Customer Analytics</Link>
                    <Link href="/analytics/products" className="text-gray-600 hover:text-gray-900">Product Analytics</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Supplier Analytics</h2>
                        <p className="text-gray-600">Performance metrics and spending analysis for your suppliers</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Suppliers</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{suppliers.length}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Spend</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(suppliers.reduce((sum, s) => sum + s.totalSpend, 0))}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Avg Reliability</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {Math.round(suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length)}%
                            </p>
                        </div>
                    </div>

                    {/* Suppliers Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">All Suppliers</h3>
                            <p className="text-sm text-gray-600 mt-1">Ranked by total spend</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Trend</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.supplierId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{supplier.supplierName}</div>
                                                    <div className="text-xs text-gray-500">Last: {new Date(supplier.lastTransactionDate).toLocaleDateString()}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{formatCurrency(supplier.totalSpend)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{supplier.transactionCount}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{formatCurrency(supplier.avgInvoiceAmount)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTrendColor(supplier.priceComparison.trend)}`}>
                                                    {getTrendIcon(supplier.priceComparison.trend)}
                                                    {supplier.priceComparison.trend}
                                                    {supplier.priceComparison.percentChange !== 0 && (
                                                        <span className="ml-1">
                                                            ({supplier.priceComparison.percentChange > 0 ? '+' : ''}
                                                            {supplier.priceComparison.percentChange.toFixed(1)}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${supplier.reliabilityScore >= 80 ? 'bg-green-600' : supplier.reliabilityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                                            style={{ width: `${supplier.reliabilityScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{supplier.reliabilityScore}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
