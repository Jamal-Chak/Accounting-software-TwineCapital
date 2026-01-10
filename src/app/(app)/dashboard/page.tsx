'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { getInvoices, getExpenses } from '@/app/actions/data'
import type { Invoice, Expense } from '@/lib/database'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Clock,
    CheckCircle2,
    Building2
} from 'lucide-react'

export default function DashboardPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [invoicesData, expensesData] = await Promise.all([
                getInvoices(),
                getExpenses()
            ])
            setInvoices(invoicesData)
            setExpenses(expensesData)
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Calculate metrics
    const totalReceivables = invoices
        .filter(i => i.status !== 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0)

    const totalPaid = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0)

    const totalExpenses = expenses.reduce((sum, e) => sum + e.total_amount, 0)

    const cashFlow = totalPaid - totalExpenses

    const recentInvoices = invoices.slice(0, 5)
    const recentExpenses = expenses.slice(0, 5)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Subscription Status Banner */}
            <SubscriptionStatus />

            {/* Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="text-blue-100 text-sm font-medium">Welcome back!</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Business Dashboard</h1>
                    <p className="text-blue-100 text-lg">Here&apos;s what&apos;s happening with your finances today</p>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Receivables */}
                <div className="group relative bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                12%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Receivables</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(totalReceivables)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {invoices.filter(i => i.status !== 'paid').length} unpaid invoices
                        </p>
                    </div>
                </div>

                {/* Total Paid */}
                <div className="group relative bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                8%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(totalPaid)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {invoices.filter(i => i.status === 'paid').length} paid invoices
                        </p>
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="group relative bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs text-red-600 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                                <ArrowDownRight className="w-3 h-3" />
                                5%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(totalExpenses)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            {expenses.length} expenses recorded
                        </p>
                    </div>
                </div>

                {/* Cash Flow */}
                <div className={`group relative bg-gradient-to-br ${cashFlow >= 0 ? 'from-emerald-50 to-white border-emerald-100' : 'from-red-50 to-white border-red-100'} rounded-xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${cashFlow >= 0 ? 'bg-emerald-100' : 'bg-red-100'} rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${cashFlow >= 0 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/30' : 'from-red-500 to-red-600 shadow-red-500/30'} rounded-xl flex items-center justify-center shadow-lg`}>
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${cashFlow >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {cashFlow >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {cashFlow >= 0 ? '+' : '-'}3%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Cash Flow</p>
                        <p className={`text-2xl font-bold mb-2 ${cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(cashFlow))}
                        </p>
                        <p className="text-xs text-gray-500">
                            {cashFlow >= 0 ? 'Positive' : 'Negative'} this month
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Recent Invoices
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Latest invoice activity</p>
                            </div>
                            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                View All →
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentInvoices.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-2">No invoices yet</p>
                                <Link href="/invoices/create" className="text-sm text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                                    Create your first invoice
                                    <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ) : (
                            recentInvoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={`/invoices/${invoice.id}`}
                                    className="block p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">INV-{invoice.invoice_number}</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Due {formatDate(invoice.due_date)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {formatCurrency(invoice.total_amount)}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-orange-600" />
                                    Recent Expenses
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Latest expense activity</p>
                            </div>
                            <Link href="/expenses" className="text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                                View All →
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentExpenses.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-2">No expenses yet</p>
                                <Link href="/expenses?action=new" className="text-sm text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1">
                                    Add your first expense
                                    <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ) : (
                            recentExpenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{expense.description}</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    expense.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {expense.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {expense.category} • {formatDate(expense.date)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {formatCurrency(expense.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/invoices/create"
                        className="relative overflow-hidden flex items-center gap-4 p-5 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group hover:shadow-md"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Create Invoice</p>
                            <p className="text-sm text-gray-500">Bill your clients</p>
                        </div>
                    </Link>

                    <Link
                        href="/expenses?action=new"
                        className="relative overflow-hidden flex items-center gap-4 p-5 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group hover:shadow-md"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative">
                            <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Add Expense</p>
                            <p className="text-sm text-gray-500">Track spending</p>
                        </div>
                    </Link>

                    <Link
                        href="/banking"
                        className="relative overflow-hidden flex items-center gap-4 p-5 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 group hover:shadow-md"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative">
                            <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">View Banking</p>
                            <p className="text-sm text-gray-500">Check transactions</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/consolidated"
                        className="relative overflow-hidden flex items-center gap-4 p-5 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 group hover:shadow-md"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                            <Building2 className="w-6 h-6 text-white text-3xl font-bold" />
                        </div>
                        <div className="relative">
                            <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">Group Console</p>
                            <p className="text-sm text-gray-500">Multi-Entity View</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
