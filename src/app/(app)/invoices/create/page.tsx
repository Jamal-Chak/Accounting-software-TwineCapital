'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createInvoice, addSampleClients, getCompanyId, addClient } from '@/lib/database'
import { ClientSelection } from '@/components/invoice/client-selection'
import { NewClientForm } from '@/components/invoice/new-client-form'
import { LineItems } from '@/components/invoice/line-items'
import { invoiceSchema, type InvoiceFormData, type NewClient } from '@/lib/validations/invoice'
import { PageHeader } from '@/components/layout/PageHeader'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { AIInvoiceAssistant } from '@/components/ai/AIInvoiceAssistant'
import { DiscountSuggestion, LatePaymentRisk } from '@/components/ai/SmartFeatures'
import { getExchangeRate, SUPPORTED_CURRENCIES, formatCurrency as formatMultiCurrency } from '@/lib/currency'

// Local types matching our components
interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

export default function CreateInvoicePage() {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [isNewClient, setIsNewClient] = useState(false)
  const [newClientData, setNewClientData] = useState<NewClient | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')
  const [currency, setCurrency] = useState('ZAR')
  const [exchangeRate, setExchangeRate] = useState(1.0)

  // Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const addSampleData = async () => {
    try {
      setLoading(true)
      setGeneralError(null)
      await addSampleClients()
      window.location.reload()
    } catch (error: any) {
      console.error('Error adding sample data:', error)
      setGeneralError(`Failed to add sample data: ${error.message || JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    if (newCurrency === 'ZAR') {
      setExchangeRate(1.0)
    } else {
      try {
        const rate = await getExchangeRate(newCurrency)
        setExchangeRate(rate)
      } catch (error) {
        console.error('Failed to get exchange rate:', error)
        // Non-blocking error
        setExchangeRate(1.0)
      }
    }
  }

  const validateForm = (): boolean => {
    try {
      const formData: InvoiceFormData = {
        client_id: selectedClientId,
        client: isNewClient ? newClientData || undefined : undefined,
        issue_date: issueDate,
        due_date: dueDate,
        notes: notes || undefined,
        items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        }))
      }

      invoiceSchema.parse(formData)
      setFormErrors({})
      return true

    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) return

    try {
      setSubmitting(true)

      // Get company ID
      const companyId = await getCompanyId()
      if (!companyId) {
        setGeneralError('Could not find your company record. Please try logging out and back in.')
        setSubmitting(false)
        return
      }

      // Handle Client ID
      let finalClientId = selectedClientId
      if (isNewClient && newClientData) {
        // Create new client
        const newClient = {
          company_id: companyId,
          name: newClientData.name,
          email: newClientData.email || null,
          phone: newClientData.phone || null,
          address: newClientData.address || null,
          tax_number: newClientData.tax_number || null
        }

        const clientResult = await addClient(newClient)
        if (!clientResult.success || !clientResult.data) {
          setGeneralError(`Failed to create client: ${clientResult.error}. This is likely a permission issue (RLS).`)
          setSubmitting(false)
          return
        }
        finalClientId = clientResult.data.id
      } else if (selectedClientId === 'new') {
        setGeneralError('Please enter new client details.')
        setSubmitting(false)
        return
      }

      const invoiceData = {
        company_id: companyId,
        invoice_number: `INV-${Date.now()}`,
        client_id: finalClientId,
        issue_date: issueDate,
        due_date: dueDate,
        currency,
        exchange_rate: exchangeRate,
        status: 'draft' as const,
        total_amount: lineItems.reduce((sum, item) => {
          const itemTotal = Number(item.quantity) * Number(item.unit_price) * (1 + Number(item.tax_rate) / 100)
          return sum + itemTotal
        }, 0),
        tax_amount: lineItems.reduce((sum, item) => {
          const itemSubtotal = Number(item.quantity) * Number(item.unit_price)
          const taxAmount = itemSubtotal * (Number(item.tax_rate) / 100)
          return sum + taxAmount
        }, 0),
        notes: notes || null
      }

      const lineItemsData = lineItems.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_rate: Number(item.tax_rate),
        total_amount: Number(item.quantity) * Number(item.unit_price) * (1 + Number(item.tax_rate) / 100)
      }))

      console.log('Invoice data prepared:', { invoiceData, lineItemsData })

      const result = await createInvoice(invoiceData, lineItemsData)

      if (result.success) {
        // Success!
        window.location.href = '/invoices'
      } else {
        console.error('Error creating invoice:', result.error)
        setGeneralError(`Error creating invoice: ${result.error}. Check database permissions.`)
      }

    } catch (error: any) {
      console.error('Error creating invoice:', error)
      setGeneralError(`Unexpected error: ${error.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxTotal = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price
      return sum + (itemSubtotal * item.tax_rate / 100)
    }, 0)
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal }
  }

  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Handler for AI-parsed invoice data
  const handleAIParsed = (data: any) => {
    // Set customer name (would need to find/create client in real scenario)
    // For now, we'll just set notes with the customer info
    setNotes(`Customer: ${data.customer}\n${data.notes || data.description}`)

    // Set line items
    const newItems = data.items.map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: 15 // Default VAT
    }))
    setLineItems(newItems)

    // Set due date if provided
    if (data.due_date) {
      setDueDate(data.due_date)
    }
  }

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

  return (
    <div>
      <PageHeader
        title="Create Invoice"
        description="Create a new invoice for your client"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'Create' }
        ]}
        action={
          <div className="flex gap-3">

            <Link href="/invoices" className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices</span>
            </Link>
          </div>
        }
      />

      {/* AI Invoice Assistant */}
      <div className="mb-6">
        <AIInvoiceAssistant onInvoiceParsed={handleAIParsed} />
      </div>

      {generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{generalError}</span>
        </div>
      )}

      {/* Invoice Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Smart Features */}
        {selectedClientId && lineItems.length > 0 && (
          <div className="space-y-4">
            <DiscountSuggestion
              customerId={selectedClientId !== 'new' ? selectedClientId : null}
              invoiceAmount={calculateTotals().grandTotal}
            />
            <LatePaymentRisk
              customerId={selectedClientId !== 'new' ? selectedClientId : null}
              invoiceAmount={calculateTotals().grandTotal}
              dueDate={dueDate}
            />
          </div>
        )}

        {/* Client Selection */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
            <ClientSelection
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
              onNewClientToggle={setIsNewClient}
              error={formErrors.client_id}
            />

            {isNewClient && (
              <div className="mt-6">
                <NewClientForm
                  onClientChange={setNewClientData}
                  initialData={newClientData || undefined}
                  error={formErrors.client_details}
                />
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
                {currency !== 'ZAR' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Exchange Rate: 1 {currency} = R{exchangeRate.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
                {formErrors.issue_date && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.issue_date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
                {formErrors.due_date && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.due_date}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
            <LineItems
              items={lineItems}
              onItemsChange={setLineItems}
              error={formErrors.items}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this invoice..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
            {formErrors.notes && (
              <p className="text-red-600 text-sm mt-1">{formErrors.notes}</p>
            )}
          </div>
        </div>

        {/* Invoice Summary */}
        {lineItems.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-900">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatCurrencyLocal(calculateTotals().subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">{formatCurrencyLocal(calculateTotals().taxTotal)}</span>
                </div>
                {currency !== 'ZAR' && (
                  <div className="flex justify-between text-gray-500 text-sm italic">
                    <span>Converted (ZAR):</span>
                    <span>{formatMultiCurrency(calculateTotals().grandTotal * exchangeRate, 'ZAR')}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrencyLocal(calculateTotals().grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/invoices"
            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || lineItems.length === 0}
            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
