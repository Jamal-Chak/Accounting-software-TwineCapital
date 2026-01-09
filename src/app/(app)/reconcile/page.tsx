'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUnreconciledTransactions, reconcileTransaction, type Transaction } from '@/lib/database'

export default function ReconcilePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [reconcilingId, setReconcilingId] = useState<string | null>(null)

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        try {
            setLoading(true)
            const data = await getUnreconciledTransactions()
            setTransactions(data)
        } catch (error) {
            console.error('Error loading transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReconcile = async (id: string) => {
        try {
            setReconcilingId(id)
            const result = await reconcileTransaction(id)
            if (result) {
                // Remove from list
                setTransactions(prev => prev.filter(t => t.id !== id))
            }
        } catch (error) {
            console.error('Error reconciling:', error)
        } finally {
            setReconcilingId(null)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white">Loading Transactions...</h2>
                    <p className="text-gray-400 mt-2">Finding unreconciled items</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="glass sticky top-0 z-40 border-b border-white/5">
                <div className="px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            T
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">TwineCapital</h1>
                            <p className="text-xs text-gray-400">Intelligent Accounting</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-surface-200 border border-white/10"></div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="border-b border-white/5 bg-surface-100/50 backdrop-blur-sm">
                <div className="px-8 py-1 max-w-7xl mx-auto flex space-x-1">
                    <Link href="/dashboard" className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-t-md transition-colors">Dashboard</Link>
                    <Link href="/banking" className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-t-md transition-colors">Banking</Link>
                    <Link href="/invoices" className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-t-md transition-colors">Invoices</Link>
                    <Link href="/expenses" className="px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-t-md transition-colors">Expenses</Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Reconciliation</h2>
                        <p className="text-gray-400">Review and reconcile your bank transactions</p>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-bold text-white">Pending Review</h3>
                        <p className="text-sm text-gray-400 mt-1">{transactions.length} transactions to reconcile</p>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-green-500 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 mb-2 text-lg">All caught up!</p>
                            <p className="text-gray-500 mb-6">No unreconciled transactions found.</p>
                            <Link
                                href="/dashboard"
                                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 transition-all shadow-lg shadow-primary/20"
                            >
                                <span>Back to Dashboard</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {transactions.map((transaction) => (
                                <div key={transaction.id} className="p-6 hover:bg-white/5 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <h4 className="font-semibold text-white">
                                                    {transaction.description}
                                                </h4>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(transaction.date).toLocaleDateString('en-ZA')}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <p className="text-sm text-gray-400">{transaction.merchant || 'Unknown Merchant'}</p>
                                                <span className="text-gray-600">•</span>
                                                <p className="text-sm text-gray-500">{transaction.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className={`text-lg font-semibold ${transaction.amount >= 0 ? 'text-green-400' : 'text-white'}`}>
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleReconcile(transaction.id)}
                                                disabled={reconcilingId === transaction.id}
                                                className="bg-surface-200 hover:bg-green-500/20 hover:text-green-400 text-gray-300 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-white/5 flex items-center gap-2"
                                            >
                                                {reconcilingId === transaction.id ? (
                                                    <span className="animate-spin">⟳</span>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                Reconcile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
