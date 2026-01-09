import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, getClient } from '@/lib/database'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        // Get invoice data
        const invoice = await getInvoice(id)
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Get client data
        const client = invoice.client || (invoice.client_id ? await getClient(invoice.client_id) : null)

        // For now, return a simple message
        // TODO: Implement proper PDF generation with a library like pdfkit or puppeteer
        // The react-pdf/renderer approach requires a different architecture

        return NextResponse.json({
            message: 'PDF generation endpoint - implementation in progress',
            invoice: {
                number: invoice.invoice_number,
                client: client?.name,
                total: invoice.total_amount
            }
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
