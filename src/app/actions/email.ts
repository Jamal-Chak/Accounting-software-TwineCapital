'use server'

import { Resend } from 'resend'
import { render } from '@react-email/components'
import { getAuthenticatedClient } from '@/lib/auth/database-helpers'
import { generateInvoicePDF } from './pdf'
import { InvoiceEmail } from '@/lib/email/templates/invoice-email'
import { WelcomeEmail } from '@/lib/email/templates/welcome-email'
import type { Invoice, Client, Company } from '@/lib/database'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send invoice email to client with PDF attachment
 */
export async function sendInvoiceEmail(invoiceId: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // Fetch invoice with client data
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, client:clients(*)')
            .eq('id', invoiceId)
            .single()

        if (invoiceError || !invoice) {
            return { success: false, error: 'Invoice not found' }
        }

        const client = invoice.client as Client
        if (!client.email) {
            return { success: false, error: 'Client has no email address' }
        }

        // Fetch company data
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (companyError || !company) {
            return { success: false, error: 'Company not found' }
        }

        // Generate PDF
        const pdfResult = await generateInvoicePDF(invoiceId)
        if (!pdfResult.success || !pdfResult.pdf) {
            return { success: false, error: 'Failed to generate PDF' }
        }

        // Format amounts
        const totalAmount = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: company.currency
        }).format(invoice.total_amount)

        const dueDate = new Date(invoice.due_date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Render email template
        const emailHtml = await render(InvoiceEmail({
            invoiceNumber: invoice.invoice_number,
            clientName: client.name,
            companyName: company.name,
            totalAmount,
            dueDate,
        }))

        // Send email with PDF attachment
        const { data, error } = await resend.emails.send({
            from: `${company.name} <invoices@twinecapital.com>`,
            to: client.email,
            subject: `Invoice ${invoice.invoice_number} from ${company.name}`,
            html: emailHtml,
            attachments: [
                {
                    filename: `invoice-${invoice.invoice_number}.pdf`,
                    content: Buffer.from(pdfResult.pdf, 'base64'),
                },
            ],
        })

        if (error) {
            console.error('Error sending email:', error)
            return { success: false, error: error.message }
        }

        // Update invoice status to 'sent' if it was 'draft'
        if (invoice.status === 'draft') {
            await supabase
                .from('invoices')
                .update({ status: 'sent' })
                .eq('id', invoiceId)
        }

        return { success: true, data, message: `Invoice sent to ${client.email}` }
    } catch (error) {
        console.error('Error sending invoice email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        }
    }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string, companyName: string) {
    try {
        const emailHtml = await render(WelcomeEmail({
            userName,
            companyName,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        }))

        const { data, error } = await resend.emails.send({
            from: 'TwineCapital <welcome@twinecapital.com>',
            to: userEmail,
            subject: 'Welcome to TwineCapital!',
            html: emailHtml,
        })

        if (error) {
            console.error('Error sending welcome email:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error sending welcome email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        }
    }
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminderEmail(invoiceId: string) {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // Fetch invoice with client data
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, client:clients(*)')
            .eq('id', invoiceId)
            .single()

        if (invoiceError || !invoice) {
            return { success: false, error: 'Invoice not found' }
        }

        const client = invoice.client as Client
        if (!client.email) {
            return { success: false, error: 'Client has no email address' }
        }

        // Fetch company
        const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!company) {
            return { success: false, error: 'Company not found' }
        }

        const totalAmount = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: company.currency
        }).format(invoice.total_amount)

        const dueDate = new Date(invoice.due_date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Simple reminder email (can be templated later)
        const { data, error } = await resend.emails.send({
            from: `${company.name} <invoices@twinecapital.com>`,
            to: client.email,
            subject: `Payment Reminder: Invoice ${invoice.invoice_number}`,
            html: `
                <h2>Payment Reminder</h2>
                <p>Dear ${client.name},</p>
                <p>This is a friendly reminder that invoice ${invoice.invoice_number} for ${totalAmount} was due on ${dueDate}.</p>
                <p>If you have already made the payment, please disregard this message.</p>
                <p>Thank you,<br>${company.name}</p>
            `,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data, message: `Reminder sent to ${client.email}` }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send reminder'
        }
    }
}
