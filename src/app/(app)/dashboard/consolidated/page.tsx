import Link from 'next/link'
import { getUserCompanies } from '@/lib/database'
import { getConsolidatedTrialBalance } from '@/lib/journal'
import { Building2, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default async function ConsolidatedDashboard() {
    const companies = await getUserCompanies()
    const companyIds = companies.map(c => c.id)

    // Fetch consolidated data
    const trialBalance = await getConsolidatedTrialBalance(companyIds)

    // Calculate core metrics
    const revenue = trialBalance
        .filter(a => a.account_type === 'Revenue')
        .reduce((sum, a) => sum + Math.abs(a.balance), 0) // Revenue is Credit, balance is Debit-Credit, so it's negative. use Abs.

    const expenses = trialBalance
        .filter(a => a.account_type === 'Expense')
        .reduce((sum, a) => sum + a.balance, 0) // Expenses are Debit, positive balance.

    const netProfit = revenue - expenses

    // Calculate Assets/Liabilities for balance sheet snapshot
    const assets = trialBalance
        .filter(a => a.account_type === 'Asset')
        .reduce((sum, a) => sum + a.balance, 0)

    const liabilities = trialBalance
        .filter(a => a.account_type === 'Liability')
        .reduce((sum, a) => sum + Math.abs(a.balance), 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700">
                <div className="px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    ENTERPRISE VIEW
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold">Group Console</h1>
                            <p className="text-gray-400 mt-1">Consolidated financial overview across {companies.length} entities</p>
                        </div>
                        <Link href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                            Back to Single Entity
                        </Link>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">

                {/* Companies Grid */}
                <div className="mb-10">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Entities</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {companies.map(company => (
                            <div key={company.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-w-[200px] flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{company.name}</h4>
                                    <p className="text-xs text-gray-500">{company.country}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Consolidated Revenue</h3>
                        <p className="text-4xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
                        <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>Across all markets</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingDown className="w-24 h-24 text-red-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
                        <p className="text-4xl font-bold text-gray-900">{formatCurrency(expenses)}</p>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                            <span>Operating costs</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-24 h-24 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Net Profit (Group)</h3>
                        <p className={`text-4xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                        <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                            <span>{(revenue > 0 ? (netProfit / revenue) * 100 : 0).toFixed(1)}% Margin</span>
                        </div>
                    </div>
                </div>

                {/* Financial Position */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Group Financial Position</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                                    <span className="font-medium text-gray-700">Total Assets</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(assets)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div>
                                    <span className="font-medium text-gray-700">Total Liabilities</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(liabilities)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-t-2 border-gray-200">
                                <span className="font-bold text-gray-900">Total Equity</span>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(assets - liabilities)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI CFO Insights (Real Integration) */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl shadow-lg p-8 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                <BrainIcon />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">AI CFO Insights</h3>
                                <p className="text-indigo-200 text-sm">Automated Variance Analysis</p>
                            </div>
                        </div>

                        <div className="space-y-4 leading-relaxed font-light text-indigo-50">
                            <CFOReport metrics={{ revenue, expenses, netProfit, margin: (revenue > 0 ? (netProfit / revenue) * 100 : 0) }} />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

// Client Component Wrapper for AI Report (could be server, but let's keep it simple inline)
import { generateCFOReport, type FinancialMetrics } from '@/lib/ai-cfo'

async function CFOReport({ metrics }: { metrics: FinancialMetrics }) {
    const report = await generateCFOReport(metrics)

    return (
        <div className="animate-in fade-in duration-700">
            <p className="text-lg font-medium mb-4 text-white">{report.summary}</p>

            {report.keyDrivers.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Key Drivers</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {report.keyDrivers.map((driver, i) => (
                            <li key={i}>{driver}</li>
                        ))}
                    </ul>
                </div>
            )}

            {report.recommendations.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Strategic Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {report.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

function BrainIcon() {
    return (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    )
}
