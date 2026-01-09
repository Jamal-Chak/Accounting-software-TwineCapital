'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { getTrialBalance, getProfitAndLoss, getBalanceSheet } from '@/lib/reports'
import { getCompanyId } from '@/lib/database'
import { generateSampleDataAction } from '../actions/reports'
import { Download, Calendar, Database } from 'lucide-react'

type ReportType = 'trial-balance' | 'profit-loss' | 'balance-sheet'

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportType>('profit-loss')
    const [loading, setLoading] = useState(false)
    const [generatingData, setGeneratingData] = useState(false)
    const [data, setData] = useState<any>(null)
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
        end: new Date().toISOString().split('T')[0] // Today
    })

    useEffect(() => {
        loadReport()
    }, [activeTab, dateRange])

    const loadReport = async () => {
        try {
            setLoading(true)
            const companyId = await getCompanyId()
            console.log('Reports Page - Company ID:', companyId)

            if (!companyId) {
                console.log('No company ID found for reports')
                setLoading(false)
                return
            }

            let reportData
            switch (activeTab) {
                case 'trial-balance':
                    reportData = await getTrialBalance(companyId, dateRange.start, dateRange.end)
                    break
                case 'profit-loss':
                    reportData = await getProfitAndLoss(companyId, dateRange.start, dateRange.end)
                    break
                case 'balance-sheet':
                    reportData = await getBalanceSheet(companyId, dateRange.end)
                    break
            }
            console.log('Report Data Received:', reportData)
            setData(reportData)
        } catch (error) {
            console.error('Error loading report:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateData = async () => {
        try {
            setGeneratingData(true)
            const result = await generateSampleDataAction()
            if (result.success) {
                await loadReport()
            } else {
                console.error('Failed to generate data:', result.error)
            }
        } catch (error) {
            console.error('Error generating data:', error)
        } finally {
            setGeneratingData(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Financial Reports"
                description="View your company's financial performance and position"
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerateData}
                            disabled={generatingData}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50"
                        >
                            <Database className="w-4 h-4" />
                            {generatingData ? 'Generating...' : 'Load Sample Data'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                }
            />

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {(['profit-loss', 'balance-sheet', 'trial-balance'] as ReportType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setData(null)
                                setActiveTab(tab)
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="border-gray-300 rounded-md text-sm"
                        disabled={activeTab === 'balance-sheet'}
                    />
                    <span className="text-gray-400">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : !data ? (
                    <div className="flex items-center justify-center h-full py-20 text-gray-500">
                        No data available
                    </div>
                ) : (
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">TwineCapital Demo</h2>
                            <h3 className="text-lg text-gray-600 mt-1">
                                {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeTab === 'balance-sheet'
                                    ? `As of ${new Date(dateRange.end).toLocaleDateString()}`
                                    : `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                                }
                            </p>
                        </div>

                        {activeTab === 'profit-loss' && (
                            <div className="space-y-8">
                                {/* Revenue */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Revenue</h4>
                                    <div className="space-y-2">
                                        {data.revenue.accounts.map((acc: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{acc.name}</span>
                                                <span className="font-medium">{formatCurrency(acc.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Total Revenue</span>
                                            <span>{formatCurrency(data.revenue.amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Operating Expenses</h4>
                                    <div className="space-y-2">
                                        {data.expenses.accounts.map((acc: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{acc.name}</span>
                                                <span className="font-medium">{formatCurrency(acc.amount)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Total Expenses</span>
                                            <span>{formatCurrency(data.expenses.amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Income */}
                                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Net Income</span>
                                    <span className={`text-xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(data.netIncome)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'balance-sheet' && (
                            <div className="space-y-8">
                                {['assets', 'liabilities', 'equity'].map((section) => (
                                    <div key={section}>
                                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4 capitalize">{section}</h4>
                                        <div className="space-y-2">
                                            {data[section].accounts.map((acc: any, i: number) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{acc.name}</span>
                                                    <span className="font-medium">{formatCurrency(acc.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                                <span className="capitalize">Total {section}</span>
                                                <span>{formatCurrency(data[section].total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center text-sm text-gray-500">
                                    <span>Check: Assets = Liabilities + Equity</span>
                                    <span className={Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 0.01 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                        {Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 0.01 ? 'Balanced' : 'Unbalanced'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'trial-balance' && (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-2 font-semibold text-gray-900">Account</th>
                                        <th className="text-left py-2 font-semibold text-gray-900">Type</th>
                                        <th className="text-right py-2 font-semibold text-gray-900">Debit</th>
                                        <th className="text-right py-2 font-semibold text-gray-900">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map((entry: any, i: number) => (
                                        <tr key={i}>
                                            <td className="py-2 text-gray-900">
                                                <span className="text-gray-400 mr-2">{entry.accountCode}</span>
                                                {entry.accountName}
                                            </td>
                                            <td className="py-2 text-gray-500">{entry.accountType}</td>
                                            <td className="py-2 text-right font-mono">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                                            <td className="py-2 text-right font-mono">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="py-3 pl-2" colSpan={2}>Total</td>
                                        <td className="py-3 text-right font-mono">
                                            {formatCurrency(data.reduce((sum: number, e: any) => sum + e.debit, 0))}
                                        </td>
                                        <td className="py-3 text-right font-mono">
                                            {formatCurrency(data.reduce((sum: number, e: any) => sum + e.credit, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
