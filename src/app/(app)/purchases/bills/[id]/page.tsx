'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Mail } from 'lucide-react'
import { getBill, type Bill } from '@/lib/database'
import { PageHeader } from '@/components/layout/PageHeader'
import { AttachmentsList } from '@/components/documents/AttachmentsList'

export default function BillDetailsPage() {
    const params = useParams()
    const id = params?.id as string
    const [bill, setBill] = useState<Bill | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    const loadData = async () => {
        setLoading(true)
        const billData = await getBill(id)
        if (billData) {
            setBill(billData)
        }
        setLoading(false)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Bill not found</h2>
                <Link href="/purchases/bills" className="text-blue-600 hover:underline mt-4 inline-block">
                    Return to Bills
                </Link>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={`Bill ${bill.bill_number}`}
                description="View and manage bill details"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Purchases', href: '/purchases/bills' },
                    { label: bill.bill_number }
                ]}
                action={
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                            <Printer className="w-4 h-4" />
                            <span>Print</span>
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Bill Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">BILL</h1>
                                <p className="text-gray-500 mt-1">#{bill.bill_number}</p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {bill.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">From</h3>
                                <div className="text-sm text-gray-900">
                                    <p className="font-medium text-lg mb-1">{bill.vendor_name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill Date:</span>
                                        <span className="ml-2 text-sm text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date:</span>
                                        <span className="ml-2 text-sm text-gray-900">{new Date(bill.due_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bill.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-4 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-3 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.total_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-end">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(bill.total_amount - bill.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tax</span>
                                        <span>{formatCurrency(bill.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                                        <span>Total</span>
                                        <span>{formatCurrency(bill.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {bill.notes && (
                            <div className="p-6 border-t border-gray-200">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                                <p className="text-sm text-gray-600">{bill.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Attachments */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <AttachmentsList
                            entityType="bill"
                            entityId={bill.id}
                            folder="Bills"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
