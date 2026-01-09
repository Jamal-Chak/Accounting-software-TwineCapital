import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInvoiceEmailParams {
    to: string
    invoiceNumber: string
    clientName: string
    totalAmount: number
    pdfBuffer: Buffer
}

export async function sendInvoiceEmail({
    to,
    invoiceNumber,
    clientName,
    totalAmount,
    pdfBuffer,
}: SendInvoiceEmailParams) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount)
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Twine Capital <invoices@resend.dev>', // Use resend.dev domain for testing
            to: [to],
            subject: `Invoice ${invoiceNumber} from Twine Capital`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .invoice-details {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .invoice-details table {
                width: 100%;
                border-collapse: collapse;
              }
              .invoice-details td {
                padding: 8px 0;
              }
              .invoice-details td:first-child {
                color: #6b7280;
                width: 120px;
              }
              .invoice-details td:last-child {
                font-weight: 600;
                color: #111827;
              }
              .total {
                font-size: 24px;
                color: #2563eb;
                font-weight: bold;
              }
              .button {
                display: inline-block;
                background: #2563eb;
                color: white;
               padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Twine Capital</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Invoice ${invoiceNumber}</p>
            </div>
            <div class="content">
              <p>Dear ${clientName},</p>
              <p>Thank you for your business. Please find attached your invoice.</p>
              
              <div class="invoice-details">
                <table>
                  <tr>
                    <td>Invoice Number:</td>
                    <td>${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td>Total Amount:</td>
                    <td class="total">${formatCurrency(totalAmount)}</td>
                  </tr>
                </table>
              </div>

              <p>The invoice is attached as a PDF file. Please review the details and process payment at your earliest convenience.</p>
              
              <p style="margin-top: 30px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
              
              <p style="margin-top: 20px;">Best regards,<br>The Twine Capital Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
              <p>© ${new Date().getFullYear()} Twine Capital. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
            attachments: [
                {
                    filename: `invoice-${invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email sending error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
