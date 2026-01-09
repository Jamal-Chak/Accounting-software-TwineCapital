import { supabase } from './supabase'

export interface Payment {
    id: string
    company_id: string
    invoice_id: string
    amount: number
    payment_date: string
    payment_method: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other'
    reference: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface PaymentInput {
    invoice_id: string
    amount: number
    payment_date: string
    payment_method: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other'
    reference?: string
    notes?: string
}

/**
 * Record a payment against an invoice
 * This function:
 * 1. Creates a payment record
 * 2. Updates the invoice balance and status
 * 3. Posts a journal entry (Debit: Cash/Bank, Credit: AR)
 */
export async function recordPayment(companyId: string, paymentData: PaymentInput) {
    try {
        // 1. Get the invoice to verify it exists and get current balance
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, status')
            .eq('id', paymentData.invoice_id)
            .eq('company_id', companyId)
            .single()

        if (invoiceError || !invoice) {
            return {
                success: false,
                error: invoiceError?.message || 'Invoice not found'
            }
        }

        // Validate payment amount
        if (paymentData.amount <= 0) {
            return { success: false, error: 'Payment amount must be greater than zero' }
        }

        if (paymentData.amount > invoice.total_amount) {
            return {
                success: false,
                error: 'Payment amount cannot exceed invoice total'
            }
        }

        // 2. Create the payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert([{
                company_id: companyId,
                invoice_id: paymentData.invoice_id,
                amount: paymentData.amount,
                payment_date: paymentData.payment_date,
                payment_method: paymentData.payment_method,
                reference: paymentData.reference || null,
                notes: paymentData.notes || null
            }])
            .select()
            .single()

        if (paymentError || !payment) {
            return {
                success: false,
                error: paymentError?.message || 'Failed to create payment record'
            }
        }

        // 3. Calculate new invoice status
        const { data: allPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('invoice_id', paymentData.invoice_id)

        const totalPaid = allPayments?.reduce((sum, p) => sum + p.amount, 0) || paymentData.amount
        const newStatus = totalPaid >= invoice.total_amount ? 'paid' : 'sent'

        // 4. Update invoice status
        await supabase
            .from('invoices')
            .update({ status: newStatus })
            .eq('id', paymentData.invoice_id)

        // 5. Post journal entry
        const { postPaymentJournal } = await import('./journal')
        const journalResult = await postPaymentJournal(
            companyId,
            payment.id,
            paymentData.payment_date,
            paymentData.amount,
            invoice.invoice_number || invoice.id.substring(0, 8),
            paymentData.payment_method
        )

        if (!journalResult.success) {
            console.error('Failed to post payment journal:', journalResult.error)
            return {
                success: true,
                data: payment,
                warning: 'Payment recorded but journal entry failed: ' + journalResult.error
            }
        }

        return { success: true, data: payment }
    } catch (error) {
        console.error('Error in recordPayment:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Get all payments for a specific invoice
 */
export async function getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_id', invoiceId)
            .order('payment_date', { ascending: false })

        if (error) {
            console.error('Error fetching payments:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in getInvoicePayments:', error)
        return []
    }
}

/**
 * Get all payments for a company
 */
export async function getPayments(companyId: string): Promise<Payment[]> {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('company_id', companyId)
            .order('payment_date', { ascending: false })

        if (error) {
            console.error('Error fetching payments:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in getPayments:', error)
        return []
    }
}

/**
 * Delete a payment (admin function, use with caution)
 */
export async function deletePayment(paymentId: string) {
    try {
        // Get payment details first
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('invoice_id, amount')
            .eq('id', paymentId)
            .single()

        if (fetchError || !payment) {
            return { success: false, error: 'Payment not found' }
        }

        // Delete the payment
        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId)

        if (deleteError) {
            return { success: false, error: deleteError.message }
        }

        // Recalculate invoice status
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('total_amount')
            .eq('id', payment.invoice_id)
            .single()

        if (!invoiceError && invoice) {
            const { data: remainingPayments } = await supabase
                .from('payments')
                .select('amount')
                .eq('invoice_id', payment.invoice_id)

            const totalPaid = remainingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
            const newStatus = totalPaid >= invoice.total_amount ? 'paid' : 'sent'

            await supabase
                .from('invoices')
                .update({ status: newStatus })
                .eq('id', payment.invoice_id)
        }

        return { success: true }
    } catch (error) {
        console.error('Error in deletePayment:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
