import { NextRequest, NextResponse } from 'next/server'
import { suggestDiscount } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/ai/suggest-discount
 * Get AI-powered discount suggestion for an invoice
 */
export async function POST(request: NextRequest) {
    try {
        const { customerId, invoiceAmount } = await request.json()

        if (!customerId || !invoiceAmount) {
            return NextResponse.json(
                { error: 'Customer ID and invoice amount are required' },
                { status: 400 }
            )
        }

        // Fetch customer history
        const { data: invoices } = await supabase
            .from('invoices')
            .select('total_amount, status, paid_at, due_date')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        const customerHistory = {
            totalInvoices: invoices?.length || 0,
            avgAmount: invoices && invoices.length > 0
                ? invoices.reduce((sum, inv) => sum + inv.total_amount, 0) / invoices.length
                : 0,
            onTimePaymentRate: invoices && invoices.length > 0
                ? (invoices.filter(inv => {
                    if (!inv.paid_at || inv.status !== 'paid') return false
                    return new Date(inv.paid_at) <= new Date(inv.due_date)
                }).length / invoices.length) * 100
                : 0
        }

        const suggestion = await suggestDiscount(customerId, invoiceAmount, {
            customerHistory,
            isRepeatCustomer: (invoices?.length || 0) > 0
        })

        return NextResponse.json({
            success: true,
            data: suggestion
        })
    } catch (error: any) {
        console.error('Suggest discount API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to suggest discount' },
            { status: 500 }
        )
    }
}
