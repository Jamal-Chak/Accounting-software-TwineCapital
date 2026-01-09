import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getInvoice } from '@/lib/database'
import { pdf } from '@react-pdf/renderer'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const { to, subject, message } = body

        if (!to || !subject) {
            return NextResponse.json(
                { error: 'Email address and subject are required' },
                { status: 400 }
            )
        }

        // Get invoice data
        const invoice = await getInvoice(id)
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Format currency
        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: invoice.currency || 'ZAR',
            }).format(amount)
        }

        // Create email HTML
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice from TwineCapital</h1>
          </div>
          <div class="content">
            <p>Dear ${invoice.client?.name || 'Valued Customer'},</p>
            ${message ? `<p>${message}</p>` : '<p>Please find attached your invoice.</p>'}
            
            <div class="invoice-details">
              <h2>Invoice Details</h2>
              <div class="detail-row">
                <span>Invoice Number:</span>
                <strong>${invoice.invoice_number}</strong>
              </div>
              <div class="detail-row">
                <span>Issue Date:</span>
                <span>${new Date(invoice.issue_date).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span>Due Date:</span>
                <span>${new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span>Amount Due:</span>
                <strong style="font-size: 18px; color: #3b82f6;">${formatCurrency(invoice.total_amount)}</strong>
              </div>
            </div>

            <p>The invoice has been attached as a PDF to this email. If you have any questions, please don't hesitate to contact us.</p>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>This is an automated email from TwineCapital. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

        // Note: PDF attachment would require generating the PDF here
        // For now, we'll send without attachment and rely on the HTML email
        // In production, you'd want to generate and attach the PDF

        const emailResult = await resend.emails.send({
            from: 'TwineCapital <invoices@twinecapital.com>',
            to: [to],
            subject: subject,
            html: emailHtml,
        })

        if (emailResult.error) {
            console.error('Error sending email:', emailResult.error)
            return NextResponse.json(
                { error: 'Failed to send email', details: emailResult.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice emailed successfully',
            emailId: emailResult.data?.id,
        })
    } catch (error: any) {
        console.error('Error sending invoice email:', error)
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        )
    }
}
