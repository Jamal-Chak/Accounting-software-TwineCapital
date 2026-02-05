import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, getClient } from '@/lib/database'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/InvoicePDF'
import { createElement } from 'react'

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
        const client = invoice.client || (invoice.client_id ? await getClient(invoice.client_id) : undefined)

        // Convert client to Client | undefined explicitly if needed, but the PDF component accepts Client | undefined
        // Note: getClient returns Client | null, so we might need to handle null -> undefined or just rely on optional

        // Render PDF
        // @ts-ignore - renderToStream types might be tricky with RSC
        const stream = await renderToStream(
            createElement(InvoicePDF, {
                invoice,
                client: client || undefined,
                items: invoice.items || [],
                companyName: 'TwineCapital' // In real app, fetch from company settings
            })
        )

        // Convert Node stream to Web Stream (Next.js Response expects Web Stream or similar)
        // Actually NextResponse can take a Node stream in some versions, but standard Response takes a Web ReadableStream.
        // @react-pdf/renderer renderToStream returns a Node.js Readable stream.

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
        // Return JSON error if something fails
        return NextResponse.json(
            { error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        )
    }
}
