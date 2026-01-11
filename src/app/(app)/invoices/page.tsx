'use client'

import { useEffect, useState } from 'react'
import { getInvoices, getClients } from '@/app/actions/data'
import type { Invoice, Client } from '@/lib/database'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, Upload } from 'lucide-react'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { DownloadInvoicePDFButton } from '@/components/invoices/DownloadInvoicePDFButton'
import { SendInvoiceEmailButton } from '@/components/invoices/SendInvoiceEmailButton'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [invoicesData, clientsData] = await Promise.all([
        getInvoices(),
        getClients()
      ])
      setInvoices(invoicesData)
      setClients(clientsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getClientEmail = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.email || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage your client invoices"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices' }
        ]}
        action={
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
            <Link href="/invoices/create" className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        }
      />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Invoice Document</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <DocumentUpload
              folder="Invoices"
              onUploadComplete={() => {
                setShowUpload(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-600">
            {invoices.filter(i => i.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Unpaid</p>
          <p className="text-2xl font-bold text-orange-600">
            {invoices.filter(i => i.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'paid').length}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Invoices</h3>
              <p className="text-sm text-gray-500 mt-1">{invoices.length} invoices</p>
            </div>
            {invoices.length > 0 && (
              <Link href="/invoices/create" className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                + New Invoice
              </Link>
            )}
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2 text-lg">No invoices yet</p>
            <p className="text-gray-400 mb-6">Create your first invoice to get started</p>
            <Link href="/invoices/create" className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="w-4 h-4" />
              <span>Create Your First Invoice</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <Link href={`/invoices/${invoice.id}`} className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        INV-{invoice.invoice_number}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getClientName(invoice.client_id)}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Issued: {new Date(invoice.issue_date).toLocaleDateString('en-ZA')}</span>
                      <span>Due: {new Date(invoice.due_date).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </Link>
                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      including VAT
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SendInvoiceEmailButton
                      invoiceId={invoice.id}
                      invoiceNumber={invoice.invoice_number}
                      clientEmail={getClientEmail(invoice.client_id)}
                    />
                    <DownloadInvoicePDFButton
                      invoiceId={invoice.id}
                      invoiceNumber={invoice.invoice_number}
                    />
                    <Link href={`/invoices/${invoice.id}`}>
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
