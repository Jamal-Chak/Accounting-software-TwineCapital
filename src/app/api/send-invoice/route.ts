import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/InvoicePDF'
import { sendInvoiceEmail } from '@/lib/email'
import { getInvoice, getClients } from '@/lib/database'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { invoiceId, recipientEmail } = body

        if (!invoiceId || !recipientEmail) {
            return NextResponse.json(
                { error: 'Invoice ID and recipient email are required' },
                { status: 400 }
            )
        }

        // Fetch invoice data
        const invoice = await getInvoice(invoiceId)
        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        // Fetch client data
        const clients = await getClients()
        const client = clients.find(c => c.id === invoice.client_id)
        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Generate PDF using createElement
        const pdfElement = createElement(InvoicePDF, {
            invoice: invoice as any,
            client: client as any
        })
        const pdfBuffer = await renderToBuffer(pdfElement as unknown as React.ReactElement<any>)

        // Send email
        const result = await sendInvoiceEmail({
            to: recipientEmail,
            invoiceNumber: invoice.invoice_number,
            clientName: client.name,
            totalAmount: invoice.total_amount,
            pdfBuffer: Buffer.from(pdfBuffer),
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice sent successfully',
        })
    } catch (error) {
        console.error('Send invoice error:', error)
        return NextResponse.json(
            { error: 'Failed to send invoice' },
            { status: 500 }
        )
    }
}
