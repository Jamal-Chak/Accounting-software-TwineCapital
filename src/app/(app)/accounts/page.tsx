'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getChartOfAccounts, type Account } from '@/lib/journal'

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAccounts()
    }, [])

    const loadAccounts = async () => {
        try {
            setLoading(true)
            const accountsData = await getChartOfAccounts('22222222-2222-2222-2222-222222222222')
            setAccounts(accountsData)
        } catch (error) {
            console.error('Error loading chart of accounts:', error)
        } finally {
            setLoading(false)
        }
    }

    const groupAccountsByType = () => {
        const grouped: Record<string, Account[]> = {}
        accounts.forEach(account => {
            if (!grouped[account.type]) {
                grouped[account.type] = []
            }
            grouped[account.type].push(account)
        })
        return grouped
    }

    const groupedAccounts = groupAccountsByType()
    const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Asset': 'text-green-600 bg-green-50',
            'Liability': 'text-red-600 bg-red-50',
            'Equity': 'text-blue-600 bg-blue-50',
            'Revenue': 'text-purple-600 bg-purple-50',
            'Expense': 'text-orange-600 bg-orange-50'
        }
        return colors[type] || 'text-gray-600 bg-gray-50'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Loading Chart of Accounts...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">TwineCapital</h1>
                        <p className="text-gray-600">Accounting, Intelligently Engineered</p>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="px-8 py-3 flex space-x-6">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Chart of Accounts</span>
                    <Link href="/invoices" className="text-gray-600 hover:text-gray-900">Invoices</Link>
                    <Link href="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Chart of Accounts</h2>
                        <p className="text-gray-600 mt-2">
                            Your accounting structure for double-entry bookkeeping
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        {accountTypes.map(type => {
                            const count = groupedAccounts[type]?.length || 0
                            return (
                                <div key={type} className={`rounded-lg p-4 ${getTypeColor(type)}`}>
                                    <p className="text-sm font-medium opacity-75">{type}</p>
                                    <p className="text-2xl font-bold mt-1">{count}</p>
                                    <p className="text-xs mt-1 opacity-75">accounts</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Accounts by Type */}
                    <div className="space-y-6">
                        {accountTypes.map(type => {
                            const typeAccounts = groupedAccounts[type] || []
                            if (typeAccounts.length === 0) return null

                            return (
                                <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className={`px-6 py-4 border-b border-gray-200 ${getTypeColor(type)}`}>
                                        <h3 className="text-lg font-semibold">{type} Accounts</h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {typeAccounts.map(account => (
                                            <div key={account.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <span className="font-mono font-semibold text-gray-900 w-20">
                                                            {account.code}
                                                        </span>
                                                        <span className="text-gray-900 font-medium">
                                                            {account.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {account.is_active ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {account.description && (
                                                    <p className="text-sm text-gray-500 mt-2 ml-24">
                                                        {account.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">
                            Double-Entry Bookkeeping
                        </h4>
                        <p className="text-blue-800 text-sm">
                            These accounts form the foundation of your accounting system. Every financial transaction creates balanced journal entries where debits equal credits, ensuring accurate financial records.
                        </p>
                        <div className="mt-4 text-sm text-blue-700">
                            <p><strong>Total Accounts:</strong> {accounts.length}</p>
                            <p><strong>Company:</strong> Demo Company (Pty) Ltd</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
