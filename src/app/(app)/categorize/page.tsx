'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AutoCategorizePage() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<{ categorized: number; failed: number } | null>(null)
    const [error, setError] = useState<string | null>(null)

    const runCategorization = async () => {
        setIsProcessing(true)
        setError(null)
        setResults(null)

        try {
            const response = await fetch('/api/categorize/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50 })
            })

            const data = await response.json()

            if (data.success) {
                setResults({ categorized: data.categorized, failed: data.failed })
            } else {
                setError(data.error || 'Failed to categorize transactions')
            }
        } catch (err) {
            setError('Network error occurred')
        } finally {
            setIsProcessing(false)
        }
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
                    <Link href="/expenses" className="text-gray-600 hover:text-gray-900">Expenses</Link>
                    <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                    <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Auto-Categorization</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h2 className="text-3xl font-bold text-gray-900">AI Auto-Categorization</h2>
                        </div>
                        <p className="text-gray-600 text-lg">
                            Automatically categorize expenses using AI pattern learning
                        </p>
                    </div>

                    {/* How It Works */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">How AI Categorization Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Vendor Learning</h4>
                                    <p className="text-sm text-gray-600">Remembers how you categorized vendors before</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Pattern Matching</h4>
                                    <p className="text-sm text-gray-600">Smart keywords detect fuel, travel, food, etc.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Confidence Scoring</h4>
                                    <p className="text-sm text-gray-600">Only high-confidence matches (70%+) are auto-applied</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-8 mb-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Auto-Categorize?</h3>
                            <p className="text-gray-700 mb-6">
                                Click below to automatically categorize up to 50 uncategorized expenses
                            </p>

                            <button
                                onClick={runCategorization}
                                disabled={isProcessing}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Run Auto-Categorization
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {results && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900">Categorization Complete!</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-700 mb-1">Successfully Categorized</p>
                                    <p className="text-3xl font-bold text-green-900">{results.categorized}</p>
                                </div>

                                {results.failed > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm text-orange-700 mb-1">Needs Manual Review</p>
                                        <p className="text-3xl font-bold text-orange-900">{results.failed}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Link
                                    href="/expenses"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-center"
                                >
                                    View Expenses
                                </Link>
                                <button
                                    onClick={() => setResults(null)}
                                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium"
                                >
                                    Run Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Categories Reference */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Categories</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                'Advertising & Marketing',
                                'Bank Charges',
                                'Computer & Internet',
                                'Fuel',
                                'Insurance',
                                'Legal & Professional Fees',
                                'Meals & Entertainment',
                                'Office Supplies',
                                'Rent',
                                'Salaries & Wages',
                                'Software & Subscriptions',
                                'Telephone',
                                'Travel & Accommodation',
                                'Utilities',
                                'VAT'
                            ].map((category) => (
                                <div key={category} className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">{category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
