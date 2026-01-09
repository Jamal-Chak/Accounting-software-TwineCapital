import { NextRequest, NextResponse } from 'next/server'
import { chatAboutInvoice } from '@/lib/ai-service'

/**
 * POST /api/ai/invoice-chat
 * Chat with AI about invoice details
 */
export async function POST(request: NextRequest) {
    try {
        const { question, invoiceContext } = await request.json()

        if (!question || !invoiceContext) {
            return NextResponse.json(
                { error: 'Question and invoice context are required' },
                { status: 400 }
            )
        }

        const answer = await chatAboutInvoice(question, invoiceContext)

        return NextResponse.json({
            success: true,
            data: { answer }
        })
    } catch (error: any) {
        console.error('Invoice chat API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
