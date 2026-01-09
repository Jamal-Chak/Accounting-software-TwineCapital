'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { getCompanyId } from '@/lib/database'

export default function DebugPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        loadDebugData()
    }, [])

    const loadDebugData = async () => {
        try {
            setLoading(true)
            const companyId = await getCompanyId()

            // 1. Get Accounts
            const { count: accountCount, data: accounts } = await supabase
                .from('accounts')
                .select('*', { count: 'exact' })
                .eq('company_id', companyId)

            // 2. Get Journals
            const { count: journalCount, data: journals } = await supabase
                .from('journals')
                .select('*', { count: 'exact' })
                .eq('company_id', companyId)

            // 3. Get Journal Lines
            const { count: lineCount } = await supabase
                .from('journal_lines')
                .select('*', { count: 'exact' })
                .in('journal_id', journals?.map(j => j.id) || [])

            // 4. Get Invoices and check for journals
            const { data: invoices } = await supabase
                .from('invoices')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })
                .limit(5)

            const invoicesWithJournals = await Promise.all((invoices || []).map(async (inv) => {
                const { data: journal } = await supabase
                    .from('journals')
                    .select('id')
                    .eq('source', 'invoice')
                    .eq('source_id', inv.id)
                    .single()
                return { ...inv, hasJournal: !!journal }
            }))

            // 5. Get Expenses and check for journals
            const { data: expenses } = await supabase
                .from('expenses')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })
                .limit(5)

            const expensesWithJournals = await Promise.all((expenses || []).map(async (exp) => {
                const { data: journal } = await supabase
                    .from('journals')
                    .select('id')
                    .eq('source', 'bill') // Expenses are currently posted as 'bill' source in addExpense
                    .eq('source_id', exp.id)
                    .single()
                return { ...exp, hasJournal: !!journal }
            }))

            setData({
                companyId,
                accountCount,
                accounts: accounts || [],
                journalCount,
                lineCount,
                invoices: invoicesWithJournals,
                expenses: expensesWithJournals
            })
        } catch (error) {
            console.error('Debug load error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8">Loading debug data...</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Debug"
                description="Diagnose data integrity issues"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Debug' }]}
            />

            <div className="grid gap-6">
                {/* Company Status */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Company Status</h3>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm text-gray-500">Company ID</dt>
                            <dd className="font-mono text-xs">{data?.companyId}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Chart of Accounts</dt>
                            <dd className={`font-bold ${data?.accountCount === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {data?.accountCount} accounts
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Journal Entries</dt>
                            <dd className="font-bold">{data?.journalCount}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500">Journal Lines</dt>
                            <dd className="font-bold">{data?.lineCount}</dd>
                        </div>
                    </dl>
                </div>

                {/* Invoices Check */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Recent Invoices (Last 5)</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="pb-2">Invoice #</th>
                                <th className="pb-2">Amount</th>
                                <th className="pb-2">Journal Entry?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.invoices.map((inv: any) => (
                                <tr key={inv.id} className="border-t">
                                    <td className="py-2">{inv.invoice_number}</td>
                                    <td className="py-2">{inv.total_amount}</td>
                                    <td className="py-2">
                                        {inv.hasJournal ? (
                                            <span className="text-green-600 font-bold">Yes</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">MISSING</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Expenses Check */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Recent Expenses (Last 5)</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="pb-2">Description</th>
                                <th className="pb-2">Amount</th>
                                <th className="pb-2">Journal Entry?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.expenses.map((exp: any) => (
                                <tr key={exp.id} className="border-t">
                                    <td className="py-2">{exp.description}</td>
                                    <td className="py-2">{exp.total_amount}</td>
                                    <td className="py-2">
                                        {exp.hasJournal ? (
                                            <span className="text-green-600 font-bold">Yes</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">MISSING</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Account List */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Chart of Accounts Preview</h3>
                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 sticky top-0 bg-white">
                                    <th className="pb-2">Code</th>
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.accounts.map((acc: any) => (
                                    <tr key={acc.id} className="border-t">
                                        <td className="py-2 font-mono">{acc.code}</td>
                                        <td className="py-2">{acc.name}</td>
                                        <td className="py-2">{acc.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
