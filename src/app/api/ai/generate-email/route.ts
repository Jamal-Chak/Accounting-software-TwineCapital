import { NextRequest, NextResponse } from 'next/server'
import { generateFollowUpEmail } from '@/lib/ai-service'

/**
 * POST /api/ai/generate-email
 * Generate a follow-up email for an invoice
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { customerName, invoiceNumber, amount, daysOverdue, previousFollowups } = body

        if (!customerName || !invoiceNumber || amount === undefined || daysOverdue === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const emailDraft = await generateFollowUpEmail({
            customerName,
            invoiceNumber,
            amount,
            daysOverdue,
            previousFollowups: previousFollowups || 0
        })

        return NextResponse.json({
            success: true,
            data: emailDraft
        })
    } catch (error: any) {
        console.error('Generate email API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate email' },
            { status: 500 }
        )
    }
}
