'use client'

import { useState } from 'react'
import { createCompanyForCurrentUser } from '@/app/actions/fix-company'

export default function FixCompanyPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleFix = async () => {
        setLoading(true)
        const res = await createCompanyForCurrentUser()
        setResult(res)
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-4">Fix Missing Company</h1>
                <p className="text-gray-600 mb-6">
                    Click the button below to create a company record for your account.
                </p>

                <button
                    onClick={handleFix}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Creating Company...' : 'Create Company'}
                </button>

                {result && (
                    <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <p className="font-medium">{result.message || result.error}</p>
                        {result.companyId && (
                            <p className="text-sm mt-2">Company ID: {result.companyId}</p>
                        )}
                        {result.success && (
                            <a href="/settings" className="inline-block mt-4 text-blue-600 hover:underline">
                                Go to Settings →
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
