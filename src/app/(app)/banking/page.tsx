'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    getBankConnections,
    getRecentTransactions,
    addSampleTransactions,
    type BankConnection,
    type Transaction
} from '@/lib/database'
import { PageHeader } from '@/components/layout/PageHeader'
import { BankConnectionModal } from '@/components/banking/bank-connection-modal'
import { RefreshCw, Plus } from 'lucide-react'

export default function BankingPage() {
    const [loading, setLoading] = useState(false)
    const [bankConnections, setBankConnections] = useState<BankConnection[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [showConnectionModal, setShowConnectionModal] = useState(false)

    useEffect(() => {
        loadBankingData()

        // Check for OAuth callback success/error
        const params = new URLSearchParams(window.location.search)
        const success = params.get('success')
        const error = params.get('error')

        if (success === 'true') {
            alert('Bank account connected successfully!')
            // Clean URL
            window.history.replaceState({}, '', '/banking')
        } else if (error) {
            alert(`Connection failed: ${error}`)
            // Clean URL
            window.history.replaceState({}, '', '/banking')
        }
    }, [])

    const loadBankingData = async () => {
        try {
            setLoading(true)
            const [connectionsData, transactionsData] = await Promise.all([
                getBankConnections(),
                getRecentTransactions(10)
            ])
            setBankConnections(connectionsData)
            setTransactions(transactionsData)
        } catch (error) {
            console.error('Error loading banking data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnectBankSuccess = async () => {
        setShowConnectionModal(false)
        await loadBankingData()
    }

    const addSampleBankingData = async () => {
        try {
            setLoading(true)
            await addSampleTransactions()
            await loadBankingData()
        } catch (error) {
            console.error('Error adding sample banking data:', error)
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
        return new Date(dateString).toLocaleDateString('en-ZA')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading banking data...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="Banking"
                description="Manage your bank connections and transactions"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Banking' }
                ]}
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={loadBankingData}
                            disabled={loading}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>{loading ? 'Syncing...' : 'Sync Now'}</span>
                        </button>
                        <Link
                            href="/banking/reconciliation"
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Reconciliation
                        </Link>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Bank Connections</p>
                    <p className="text-2xl font-bold text-gray-900">{bankConnections.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Recent Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Reconciled</p>
                    <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(t => t.is_reconciled).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Unreconciled</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {transactions.filter(t => !t.is_reconciled).length}
                    </p>
                </div>
            </div>

            {/* Bank Connections */}
            <div className="card mb-8">
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Bank Connections</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage your connected bank accounts</p>
                        </div>
                        <button
                            onClick={() => setShowConnectionModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Connect Bank</span>
                        </button>
                    </div>
                </div>

                {bankConnections.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No bank connections yet</p>
                        <p className="text-gray-400 mb-6">Connect your first bank account to get started</p>
                        <button
                            onClick={() => setShowConnectionModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Connect Your First Bank</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {bankConnections.map((connection) => (
                            <div key={connection.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{connection.account_name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {connection.bank_name} • {connection.account_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Last synced</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {connection.last_synced_at ? formatDate(connection.last_synced_at) : 'Never'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${connection.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {connection.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <p className="text-sm text-gray-500 mt-1">Latest transactions from your bank accounts</p>
                        </div>
                        <Link
                            href="/banking/reconciliation"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            View All →
                        </Link>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No transactions yet</p>
                        <p className="text-gray-400 mb-6">Connect a bank account to see your transactions</p>
                        <button
                            onClick={addSampleBankingData}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Sample Transactions</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {transaction.amount > 0 ? (
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                                            <p className="text-sm text-gray-600">
                                                {transaction.merchant && `${transaction.merchant} • `}
                                                {formatDate(transaction.date)}
                                            </p>
                                            {transaction.category && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-gray-100 text-gray-800">
                                                    {transaction.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.is_reconciled ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {transaction.is_reconciled ? 'Reconciled' : 'Needs Review'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bank Connection Modal */}
            {showConnectionModal && (
                <BankConnectionModal
                    onClose={() => setShowConnectionModal(false)}
                    onSuccess={handleConnectBankSuccess}
                />
            )}
        </div>
    )
}
