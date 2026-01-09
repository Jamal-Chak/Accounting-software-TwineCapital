'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRecentTransactions, type Transaction } from '@/lib/database'

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'reconciled' | 'unreconciled'>('unreconciled')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const transactionsData = await getRecentTransactions(50) // Load more for reconciliation
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReconciliation = (transactionId: string) => {
    setTransactions(prev => prev.map(t =>
      t.id === transactionId
        ? { ...t, is_reconciled: !t.is_reconciled }
        : t
    ))
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

  const filteredTransactions = transactions.filter(t => {
    switch (filter) {
      case 'reconciled':
        return t.is_reconciled
      case 'unreconciled':
        return !t.is_reconciled
      default:
        return true
    }
  })

  const reconciledCount = transactions.filter(t => t.is_reconciled).length
  const unreconciledCount = transactions.filter(t => !t.is_reconciled).length
  const totalReconciled = transactions.filter(t => t.is_reconciled).reduce((sum, t) => sum + t.amount, 0)
  const totalUnreconciled = transactions.filter(t => !t.is_reconciled).reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Reconciliation...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load your transaction data</p>
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
          <Link href="/banking" className="text-gray-600 hover:text-gray-900">Banking</Link>
          <Link href="/invoices" className="text-gray-600 hover:text-gray-900">Invoices</Link>
          <Link href="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
          <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Reconciliation</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h2>
              <p className="text-gray-600">Review and reconcile your bank transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    setLoading(true)
                    const response = await fetch('/api/reconcile/auto', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ threshold: 0.85 })
                    })
                    const result = await response.json()

                    if (result.success) {
                      alert(`✅ Auto-Reconciliation Complete!\n\n${result.matched} transactions auto-matched\n${result.categorized || 0} AI categorized\n${result.suggested} need review\n${result.unmatched} unmatched`)
                      loadTransactions() // Reload to show updated status
                    } else {
                      alert(`❌ Error: ${result.error}`)
                    }
                  } catch (error) {
                    alert('Failed to run auto-reconciliation')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Match & AI Categorize
              </button>
              <Link
                href="/banking"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium text-sm transition-colors duration-200"
              >
                ← Back to Banking
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Reconciled</p>
              <p className="text-2xl font-bold text-green-600">{reconciledCount}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Need Review</p>
              <p className="text-2xl font-bold text-orange-600">{unreconciledCount}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Unreconciled Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalUnreconciled)}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setFilter('unreconciled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${filter === 'unreconciled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Need Review ({unreconciledCount})
                </button>
                <button
                  onClick={() => setFilter('reconciled')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${filter === 'reconciled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Reconciled ({reconciledCount})
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  All ({transactions.length})
                </button>
              </nav>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">
                          {filter === 'unreconciled' ? 'All transactions reconciled!' :
                            filter === 'reconciled' ? 'No reconciled transactions yet' :
                              'No transactions to display'}
                        </p>
                        <p className="text-gray-400">
                          {filter === 'unreconciled' ? 'Great job! All transactions have been reconciled.' :
                            filter === 'reconciled' ? 'Start reconciling transactions to see them here.' :
                              'Add some transactions to get started.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleReconciliation(transaction.id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${transaction.is_reconciled
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              }`}
                          >
                            {transaction.is_reconciled ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Reconciled
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Needs Review
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.merchant && (
                              <div className="text-gray-500">{transaction.merchant}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {transaction.category}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors duration-150">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reconciliation Summary */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconciliation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reconciled Transactions</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReconciled)}</p>
                <p className="text-sm text-gray-500">{reconciledCount} transactions</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Unreconciled Transactions</h4>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnreconciled)}</p>
                <p className="text-sm text-gray-500">{unreconciledCount} transactions</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
