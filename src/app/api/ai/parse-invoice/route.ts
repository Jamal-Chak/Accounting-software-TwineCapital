import { NextRequest, NextResponse } from 'next/server'
import { parseInvoiceFromText } from '@/lib/ai-service'

/**
 * POST /api/ai/parse-invoice
 * Parse natural language text into invoice data
 */
export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json()

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            )
        }

        const invoiceData = await parseInvoiceFromText(text)

        return NextResponse.json({
            success: true,
            data: invoiceData
        })
    } catch (error: any) {
        console.error('Parse invoice API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to parse invoice' },
            { status: 500 }
        )
    }
}
