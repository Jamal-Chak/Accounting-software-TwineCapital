'use server'

import { pdf } from '@react-pdf/renderer'
import { getAuthenticatedClient } from '@/lib/auth/database-helpers'
import { InvoicePDF } from '@/lib/pdf/invoice-template'
import type { Invoice, Client, Company } from '@/lib/database'

/**
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(invoiceId: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // Fetch invoice with client data
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, client:clients(*)')
            .eq('id', invoiceId)
            .single()

        if (invoiceError || !invoice) {
            return { success: false, error: 'Invoice not found' }
        }

        // Fetch company data
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (companyError || !company) {
            return { success: false, error: 'Company not found' }
        }

        // Generate PDF - call as function, not JSX (server action)
        const pdfElement = InvoicePDF({
            invoice: invoice as Invoice,
            client: invoice.client as Client,
            company: company as Company
        })

        const blob = await pdf(pdfElement).toBlob()

        // Convert blob to base64 for download
        const buffer = await blob.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')

        return {
            success: true,
            pdf: base64,
            filename: `invoice-${invoice.invoice_number}.pdf`
        }
    } catch (error) {
        console.error('Error generating PDF:', error)
        return { success: false, error: 'Failed to generate PDF' }
    }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoicePDF(invoiceId: string) {
    return await generateInvoicePDF(invoiceId)
}
