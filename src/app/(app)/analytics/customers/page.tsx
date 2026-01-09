'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CustomerAnalytics } from '@/lib/business-analytics'
import { User, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export default function CustomersAnalyticsPage() {
    const [customers, setCustomers] = useState<CustomerAnalytics[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch('/api/analytics/customers')
            const result = await response.json()

            if (result.success) {
                setCustomers(result.data)
            } else {
                setError(result.error || 'Failed to load customer analytics')
            }
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const getBehaviorBadge = (behavior: string) => {
        const colors = {
            excellent: 'bg-green-100 text-green-800',
            good: 'bg-blue-100 text-blue-800',
            fair: 'bg-yellow-100 text-yellow-800',
            poor: 'bg-red-100 text-red-800'
        }
        return colors[behavior as keyof typeof colors] || colors.fair
    }

    const getRiskColor = (risk: number) => {
        if (risk < 30) return 'text-green-600 bg-green-100'
        if (risk < 60) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
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
                    <p className="text-gray-600">Loading customer analytics...</p>
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
                    <Link href="/analytics/suppliers" className="text-gray-600 hover:text-gray-900">Supplier Analytics</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Customer Analytics</span>
                    <Link href="/analytics/products" className="text-gray-600 hover:text-gray-900">Product Analytics</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Customer Analytics</h2>
                        <p className="text-gray-600">Payment behavior, profitability, and risk assessment for your customers</p>
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
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(customers.reduce((sum, c) => sum + c.totalRevenue, 0))}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Avg LTV</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {customers.length > 0
                                    ? formatCurrency(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length)
                                    : formatCurrency(0)}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">High Risk</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {customers.filter(c => c.riskScore > 60).length}
                            </p>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">All Customers</h3>
                            <p className="text-sm text-gray-600 mt-1">Ranked by total revenue</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Behavior</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days to Pay</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.map((customer) => (
                                        <tr key={customer.customerId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                                                    <div className="text-xs text-gray-500">LTV: {formatCurrency(customer.lifetimeValue)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalRevenue)}</div>
                                                <div className="text-xs text-gray-500">Profit: {formatCurrency(customer.profitability)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{customer.invoiceCount}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(customer.avgInvoiceAmount)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getBehaviorBadge(customer.paymentBehavior)}`}>
                                                    {customer.paymentBehavior}
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Late: {customer.latePaymentRate.toFixed(0)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${customer.avgDaysToPay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {customer.avgDaysToPay > 0 ? '+' : ''}{Math.round(customer.avgDaysToPay)} days
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskColor(customer.riskScore)}`}>
                                                        {customer.riskScore}
                                                    </span>
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
