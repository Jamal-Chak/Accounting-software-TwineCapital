'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductAnalytics } from '@/lib/business-analytics'
import { Package, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ProductsAnalyticsPage() {
    const [products, setProducts] = useState<ProductAnalytics[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/products')
            const result = await response.json()

            if (result.success) {
                setProducts(result.data)
            } else {
                setError(result.error || 'Failed to load product analytics')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const getTrendIcon = (trend: string) => {
        if (trend === 'growing') return <TrendingUp className="w-4 h-4 text-green-600" />
        if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />
        return <Minus className="w-4 h-4 text-gray-600" />
    }

    const getTrendColor = (trend: string) => {
        if (trend === 'growing') return 'text-green-600 bg-green-50'
        if (trend === 'declining') return 'text-red-600 bg-red-50'
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
                    <p className="text-gray-600">Loading product analytics...</p>
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
                <div className="px-8 py-3 flex justify-between items-center">
                    <div className="flex space-x-6">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <Link href="/analytics/health" className="text-gray-600 hover:text-gray-900">Health Score</Link>
                        <Link href="/analytics/suppliers" className="text-gray-600 hover:text-gray-900">Supplier Analytics</Link>
                        <Link href="/analytics/customers" className="text-gray-600 hover:text-gray-900">Customer Analytics</Link>
                        <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Product Analytics</span>
                    </div>
                    <Link href="/items" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Manage Inventory
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Product Analytics</h2>
                            <p className="text-gray-600">Revenue, margins, and performance metrics for your products & services</p>
                        </div>
                        <Link
                            href="/items"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            New Product
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(products.reduce((sum, p) => sum + p.totalRevenue, 0))}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Units Sold</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {products.reduce((sum, p) => sum + p.unitsSold, 0).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Avg Margin</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {(products.reduce((sum, p) => sum + p.margin, 0) / (products.length || 1)).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">All Products</h3>
                            <p className="text-sm text-gray-600 mt-1">Ranked by revenue</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.itemId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                                    <span className="text-sm font-semibold text-gray-700">#{product.profitabilityRank}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{product.itemName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.totalRevenue)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${product.currentStock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {product.currentStock}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{product.unitsSold.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{formatCurrency(product.avgPrice)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                        <div
                                                            className="h-2 rounded-full bg-green-600"
                                                            style={{ width: `${Math.min(product.margin, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{product.margin}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTrendColor(product.trend)}`}>
                                                    {getTrendIcon(product.trend)}
                                                    {product.trend}
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
