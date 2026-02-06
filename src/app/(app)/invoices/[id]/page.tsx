'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Mail, MessageCircle } from 'lucide-react'
import { getInvoice, getClients, type Invoice, type Client } from '@/lib/database'
import { generateInvoiceMessage } from '@/lib/whatsapp'
import { WhatsAppModal } from '../whatsapp-modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { AttachmentsList } from '@/components/documents/AttachmentsList'
import { SendInvoiceModal } from '@/components/email/SendInvoiceModal'
import { FollowUpEmailGenerator } from '@/components/email/FollowUpEmailGenerator'
import { InvoiceActions } from '@/components/invoice/InvoiceActions'

export default function InvoiceDetailsPage() {
    const params = useParams()
    const id = params?.id as string
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)
    const [showSendModal, setShowSendModal] = useState(false)
    const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null)

    // WhatsApp State
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
    const [whatsAppMessage, setWhatsAppMessage] = useState('')

    const loadData = async () => {
        setLoading(true)
        const invoiceData = await getInvoice(id)
        if (invoiceData) {
            setInvoice(invoiceData)
            const clientsData = await getClients()
            const clientData = clientsData.find(c => c.id === invoiceData.client_id)
            setClient(clientData || null)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

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

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
                <Link href="/invoices" className="text-blue-600 hover:underline mt-4 inline-block">
                    Return to Invoices
                </Link>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title={`Invoice ${invoice.invoice_number}`}
                description="View and manage invoice details"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Invoices', href: '/invoices' },
                    { label: invoice.invoice_number }
                ]}
                action={
                    <div className="flex gap-3">
                        <InvoiceActions invoice={invoice} onStatusChange={loadData} />
                        <a
                            href={`/api/invoices/${invoice.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Download PDF</span>
                        </a>
                        <button
                            onClick={() => {
                                if (invoice && client) {
                                    setWhatsAppMessage(generateInvoiceMessage(invoice, client.name));
                                    setShowWhatsAppModal(true);
                                }
                            }}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#128C7E]"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                        </button>
                        <button
                            onClick={() => setShowSendModal(true)}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                        </button>
                    </div>
                }
            />

            {/* Send Invoice Modal */}
            {showSendModal && (
                <SendInvoiceModal
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoice_number}
                    defaultEmail={client?.email || ''}
                    initialSubject={generatedEmail?.subject}
                    initialBody={generatedEmail?.body}
                    onClose={() => {
                        setShowSendModal(false)
                        setGeneratedEmail(null)
                    }}
                    onSuccess={() => {
                        alert('Invoice sent successfully!')
                        loadData()
                    }}
                />
            )}

            <WhatsAppModal
                isOpen={showWhatsAppModal}
                onClose={() => setShowWhatsAppModal(false)}
                phoneNumber={client?.phone || ''}
                clientName={client?.name || 'Client'}
                message={whatsAppMessage}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Invoice Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                                <p className="text-gray-500 mt-1">#{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {invoice.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                                {client ? (
                                    <div className="text-sm text-gray-900">
                                        <p className="font-medium text-lg mb-1">{client.name}</p>
                                        {client.address && <p className="text-gray-600 whitespace-pre-line">{client.address}</p>}
                                        {client.email && <p className="text-gray-600 mt-1">{client.email}</p>}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Unknown Client</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue Date:</span>
                                        <span className="ml-2 text-sm text-gray-900">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date:</span>
                                        <span className="ml-2 text-sm text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
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
                                    {invoice.items?.map((item, index) => (
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
                                        <span>{formatCurrency(invoice.total_amount - invoice.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tax</span>
                                        <span>{formatCurrency(invoice.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                                        <span>Total</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="p-6 border-t border-gray-200">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                                <p className="text-sm text-gray-600">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Follow-up Generator */}
                    <FollowUpEmailGenerator
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.invoice_number}
                        customerName={client?.name || 'Customer'}
                        amount={invoice.total_amount}
                        dueDate={invoice.due_date}
                        onGenerate={(subject, body) => {
                            setGeneratedEmail({ subject, body })
                            setShowSendModal(true)
                        }}
                    />

                    {/* Attachments */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <AttachmentsList
                            entityType="invoice"
                            entityId={invoice.id}
                            folder="Invoices"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
