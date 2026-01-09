'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { getClient, getInvoices, type Client, type Invoice } from '@/lib/database'
import {
    Mail,
    Phone,
    MapPin,
    Hash,
    FileText,
    Calendar,
    ArrowLeft,
    ChevronRight,
    Loader2
} from 'lucide-react'

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [client, setClient] = useState<Client | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    const loadData = async () => {
        setLoading(true)
        try {
            const [clientData, allInvoices] = await Promise.all([
                getClient(id),
                getInvoices()
            ])

            if (clientData) {
                setClient(clientData)
                // Filter invoices for this client
                const clientInvoices = allInvoices.filter(inv => inv.client_id === id)
                setInvoices(clientInvoices)
            }
        } catch (error) {
            console.error('Error loading client data:', error)
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Fetching client records...</p>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="text-center py-20">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
                <p className="text-gray-500 mt-2">The client record you are looking for does not exist or has been deleted.</p>
                <Link href="/clients" className="text-blue-600 hover:underline mt-6 inline-flex items-center gap-2 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Clients
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={client.name}
                description="Client profile and financial history"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Clients', href: '/clients' },
                    { label: client.name }
                ]}
                action={
                    <button
                        onClick={() => router.push('/invoices/create?client=' + client.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Create Invoice</span>
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                                    <p className="text-sm text-gray-900">{client.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                                    <p className="text-sm text-gray-900">{client.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Address</p>
                                    <p className="text-sm text-gray-900 whitespace-pre-line">{client.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Tax/VAT Number</p>
                                    <p className="text-sm text-gray-900 font-mono">{client.tax_number || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md">
                        <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Lifetime Value</p>
                        <p className="text-3xl font-bold">
                            {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}
                        </p>
                        <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center text-sm">
                            <span className="text-blue-100 italic">{invoices.length} Total Invoices</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Active Client</span>
                        </div>
                    </div>
                </div>

                {/* Invoice History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Invoice History
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">Most recent first</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Invoice #</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                No invoices found for this client.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900">#{inv.invoice_number}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {new Date(inv.issue_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                                inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(inv.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/invoices/${inv.id}`}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors inline-block"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
