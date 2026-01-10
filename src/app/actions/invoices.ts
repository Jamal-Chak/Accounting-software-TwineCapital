'use server'

import { getAuthenticatedClient, getCurrentCompanyId } from '@/lib/auth/database-helpers'
import type { Invoice, InvoiceItem } from '@/lib/database'

/**
 * Create a new invoice with items
 */
export async function createInvoice(
    invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'company_id'>,
    items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]
) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    const companyId = await getCurrentCompanyId()
    if (!companyId) {
        return { success: false, error: 'No company found' }
    }

    try {
        // Create invoice
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .insert([{ ...invoice, company_id: companyId }])
            .select()
            .single()

        if (invoiceError) {
            console.error('Error creating invoice:', invoiceError)
            return { success: false, error: invoiceError.message }
        }

        // Create invoice items
        const itemsWithInvoiceId = items.map(item => ({
            ...item,
            invoice_id: invoiceData.id
        }))

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithInvoiceId)

        if (itemsError) {
            console.error('Error creating invoice items:', itemsError)
            return { success: false, error: itemsError.message }
        }

        // Post to journal
        try {
            const { postInvoiceJournal } = await import('@/lib/journal')
            await postInvoiceJournal(
                companyId,
                invoiceData.id,
                invoice.issue_date,
                invoiceData.total_amount - invoiceData.tax_amount,
                invoiceData.tax_amount,
                invoiceData.total_amount,
                invoiceData.invoice_number
            )
        } catch (journalError) {
            console.error('Error posting invoice journal:', journalError)
            // Don't fail the whole operation if journal fails
        }

        return { success: true, data: invoiceData }
    } catch (error) {
        console.error('Unexpected error in createInvoice:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data, error } = await supabase
            .from('invoices')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating invoice status:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in updateInvoiceStatus:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Delete invoice items first (foreign key constraint)
        await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)

        // Delete invoice
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting invoice:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteInvoice:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
