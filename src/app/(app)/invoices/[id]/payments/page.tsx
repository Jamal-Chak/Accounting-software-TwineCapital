'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaymentForm } from '@/components/payments/payment-form'
import { recordPayment, getInvoicePayments, type Payment, type PaymentInput } from '@/lib/payments'
import { getCompanyId } from '@/lib/database'
import { ArrowLeft, DollarSign, Calendar, CreditCard } from 'lucide-react'

interface Invoice {
    id: string
    invoice_number: string
    total_amount: number
    status: string
    client?: {
        name: string
    }
}

export default function InvoicePaymentsPage() {
    const router = useRouter()
    const params = useParams()
    const invoiceId = params.id as string
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [showPaymentForm, setShowPaymentForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [invoiceId])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Load invoice
            const { supabase } = await import('@/lib/supabase')
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select('*, client:clients(name)')
                .eq('id', invoiceId)
                .single()

            if (invoiceError) {
                setError('Failed to load invoice')
                return
            }

            setInvoice(invoiceData)

            // Load payments
            const paymentsData = await getInvoicePayments(invoiceId)
            setPayments(paymentsData)
        } catch (err) {
            console.error('Error loading data:', err)
            setError('An error occurred while loading data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitPayment = async (paymentData: PaymentInput) => {
        try {
            setSubmitting(true)
            setError(null)

            const companyId = await getCompanyId()
            if (!companyId) {
                setError('Could not find company')
                return
            }

            const result = await recordPayment(companyId, paymentData)

            if (result.success) {
                setShowPaymentForm(false)
                await loadData() // Reload to show new payment

                if (result.warning) {
                    alert(result.warning)
                }
            } else {
                setError(result.error || 'Failed to record payment')
            }
        } catch (err) {
            console.error('Error recording payment:', err)
            setError('An error occurred while recording payment')
        } finally {
            setSubmitting(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = invoice ? invoice.total_amount - totalPaid : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'Invoice not found'}</p>
                    <button
                        onClick={() => router.push('/invoices')}
                        className="mt-4 text-red-600 hover:text-red-800 underline"
                    >
                        Back to Invoices
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={`Payments - Invoice ${invoice.invoice_number}`}
                description={`Manage payments for ${invoice.client?.name || 'Unknown Client'}`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Invoices', href: '/invoices' },
                    { label: invoice.invoice_number }
                ]}
                action={
                    remainingBalance > 0 ? (
                        <button
                            onClick={() => setShowPaymentForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" />
                            <span>Record Payment</span>
                        </button>
                    ) : undefined
                }
            />

            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Invoice Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Remaining Balance</p>
                    <p className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {formatCurrency(remainingBalance)}
                    </p>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                    <p className="text-sm text-gray-500 mt-1">{payments.length} payment(s) recorded</p>
                </div>

                {payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <DollarSign className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No payments recorded yet</p>
                        <p className="text-gray-400 mb-6">Record the first payment for this invoice</p>
                        <button
                            onClick={() => setShowPaymentForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" />
                            <span>Record Payment</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                            <h4 className="font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </h4>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {payment.payment_method.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(payment.payment_date)}
                                            </span>
                                            {payment.reference && (
                                                <span>Ref: {payment.reference}</span>
                                            )}
                                        </div>
                                        {payment.notes && (
                                            <p className="mt-2 text-sm text-gray-600">{payment.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Form Modal */}
            {showPaymentForm && (
                <PaymentForm
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoice_number}
                    totalAmount={remainingBalance}
                    onSubmit={handleSubmitPayment}
                    onCancel={() => setShowPaymentForm(false)}
                    isSubmitting={submitting}
                />
            )}
        </div>
    )
}
