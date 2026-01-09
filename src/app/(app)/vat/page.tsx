'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { VATSummary, VAT201FormData } from '@/lib/vat'
import { getUpcomingVATDueDates, daysUntilVATDue, isVATOverdue } from '@/lib/vat'

export default function VATCompliancePage() {
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<VATSummary | null>(null)
    const [vat201, setVAT201] = useState<VAT201FormData | null>(null)
    const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'custom'>('current')
    const [showVAT201, setShowVAT201] = useState(false)

    useEffect(() => {
        loadVATData()
    }, [selectedPeriod])

    const loadVATData = async () => {
        try {
            setLoading(true)

            // Load summary
            const summaryRes = await fetch(`/api/vat/summary?period=${selectedPeriod}`)
            const summaryData = await summaryRes.json()
            setSummary(summaryData)

            // Load VAT201
            const vat201Res = await fetch(`/api/vat/vat201?period=${selectedPeriod}`)
            const vat201Data = await vat201Res.json()
            setVAT201(vat201Data)
        } catch (error) {
            console.error('Error loading VAT data:', error)
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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const dueDates = getUpcomingVATDueDates(3)
    const nextDueDate = dueDates[0]

    if (loading && !summary) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Loading VAT Data...</h2>
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
                    <Link href="/invoices" className="text-gray-600 hover:text-gray-900">Invoices</Link>
                    <Link href="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                    <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">VAT Compliance</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">VAT & SARS Compliance</h2>
                            <p className="text-gray-600">Automated VAT calculation and reporting for South Africa</p>
                        </div>
                        <Link
                            href="/reports"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium text-sm transition-colors"
                        >
                            ← Back to Reports
                        </Link>
                    </div>

                    {/* Due Date Alert */}
                    {nextDueDate && (
                        <div className={`mb-6 p-4 rounded-lg border ${isVATOverdue(nextDueDate.dueDate)
                                ? 'bg-red-50 border-red-200'
                                : daysUntilVATDue(nextDueDate.dueDate) <= 7
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-semibold">
                                        {isVATOverdue(nextDueDate.dueDate)
                                            ? '⚠️ VAT Return Overdue!'
                                            : `Next VAT Return Due: ${formatDate(nextDueDate.dueDate)}`}
                                    </p>
                                    <p className="text-sm">
                                        Period: {formatDate(nextDueDate.startDate)} - {formatDate(nextDueDate.endDate)}
                                        {!isVATOverdue(nextDueDate.dueDate) && (
                                            ` • ${daysUntilVATDue(nextDueDate.dueDate)} days remaining`
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VAT Summary Cards */}
                    {summary && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Output VAT (Sales)</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.outputVAT)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{summary.invoiceCount} invoices</p>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Input VAT (Purchases)</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.inputVAT)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{summary.expenseCount} transactions</p>
                                </div>

                                <div className={`rounded-lg border p-6 shadow-sm ${summary.netVAT > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                    }`}>
                                    <p className="text-sm font-medium text-gray-700">Net VAT</p>
                                    <p className={`text-2xl font-bold ${summary.netVAT > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {formatCurrency(Math.abs(summary.netVAT))}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {summary.netVAT > 0 ? 'Payable to SARS' : 'Refund from SARS'}
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Period</p>
                                    <p className="text-lg font-bold text-gray-900">{summary.period.period}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(summary.period.startDate)} - {formatDate(summary.period.endDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Sales (excl. VAT)</span>
                                            <span className="font-semibold">{formatCurrency(summary.totalSales - summary.outputVAT)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">VAT @ 15%</span>
                                            <span className="font-semibold">{formatCurrency(summary.outputVAT)}</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="font-bold text-lg">{formatCurrency(summary.totalSales)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchases Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Purchases (excl. VAT)</span>
                                            <span className="font-semibold">{formatCurrency(summary.totalPurchases - summary.inputVAT)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">VAT @ 15%</span>
                                            <span className="font-semibold">{formatCurrency(summary.inputVAT)}</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="font-bold text-lg">{formatCurrency(summary.totalPurchases)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* VAT201 Form */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">VAT201 Return Form</h3>
                                            <p className="text-sm text-gray-600">Official SARS VAT Return - Simplified View</p>
                                        </div>
                                        <button
                                            onClick={() => setShowVAT201(!showVAT201)}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {showVAT201 ? 'Hide Form' : 'View Form'}
                                        </button>
                                    </div>
                                </div>

                                {showVAT201 && vat201 && (
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {/* Output Tax Section */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Output Tax (VAT on Sales)</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Box 1: Standard-rated sales</span>
                                                        <span className="font-mono">{formatCurrency(vat201.box1_standardRateSales)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Box 5: Output tax @ 15%</span>
                                                        <span className="font-mono font-semibold">{formatCurrency(vat201.box5_outputTaxStandardRate)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-2">
                                                        <span className="font-semibold">Box 7: Total Output Tax</span>
                                                        <span className="font-mono font-bold">{formatCurrency(vat201.box7_totalOutputTax)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Tax Section */}
                                            <div className="border-t pt-6">
                                                <h4 className="font-semibold text-gray-900 mb-3">Input Tax (VAT on Purchases)</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Box 9: Standard-rated purchases</span>
                                                        <span className="font-mono">{formatCurrency(vat201.box9_standardRatePurchases)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Box 12: Input tax @ 15%</span>
                                                        <span className="font-mono font-semibold">{formatCurrency(vat201.box12_inputTaxStandardRate)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-2">
                                                        <span className="font-semibold">Box 14: Total Input Tax</span>
                                                        <span className="font-mono font-bold">{formatCurrency(vat201.box14_totalInputTax)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Final Calculation */}
                                            <div className="border-t pt-6">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">Box 17: Total VAT {vat201.box17_totalVATPayableRefundable > 0 ? 'Payable' : 'Refundable'}</p>
                                                            <p className="text-xs text-gray-600">Amount to {vat201.box17_totalVATPayableRefundable > 0 ? 'pay' : 'claim from'} SARS</p>
                                                        </div>
                                                        <p className={`text-2xl font-bold ${vat201.box17_totalVATPayableRefundable > 0 ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {formatCurrency(Math.abs(vat201.box17_totalVATPayableRefundable))}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="border-t pt-6 flex gap-3">
                                                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                                                    Export to PDF
                                                </button>
                                                <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium">
                                                    Print Form
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
