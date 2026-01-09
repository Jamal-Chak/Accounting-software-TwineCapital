import { NextRequest, NextResponse } from 'next/server'
import { predictLatePayment } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/ai/predict-late-payment
 * Predict if customer will pay invoice late
 */
export async function POST(request: NextRequest) {
    try {
        const { customerId, invoiceAmount, dueDate } = await request.json()

        if (!customerId || !invoiceAmount || !dueDate) {
            return NextResponse.json(
                { error: 'Customer ID, invoice amount, and due date are required' },
                { status: 400 }
            )
        }

        // Fetch payment history
        const { data: invoices } = await supabase
            .from('invoices')
            .select('due_date, paid_at, total_amount')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(20)

        const paymentHistory = (invoices || []).map(inv => ({
            dueDate: inv.due_date,
            paidDate: inv.paid_at,
            amount: inv.total_amount
        }))

        const prediction = await predictLatePayment(customerId, {
            paymentHistory,
            currentInvoiceAmount: invoiceAmount,
            dueDate
        })

        return NextResponse.json({
            success: true,
            data: prediction
        })
    } catch (error: any) {
        console.error('Predict late payment API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to predict late payment' },
            { status: 500 }
        )
    }
}
