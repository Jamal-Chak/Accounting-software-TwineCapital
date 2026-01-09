
import { Invoice } from './database';

export function generateWhatsAppLink(details: { phone: string; message: string }): string {
    // 1. Clean phone number: remove spaces, -, (, )
    let phone = details.phone.replace(/[\s\-\(\)\+]/g, '');

    // Default to SA code +27 if no code present (and length is local 10 digits e.g. 082...)
    // This is a heuristic, in prod we'd want strict E.164
    if (phone.startsWith('0') && phone.length === 10) {
        phone = '27' + phone.substring(1);
    }

    // 2. Encode message
    const encodedMessage = encodeURIComponent(details.message);

    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function generateInvoiceMessage(invoice: Invoice, clientName: string): string {
    const total = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(invoice.total_amount);
    const date = new Date(invoice.due_date).toLocaleDateString();

    return `Hi ${clientName}, 

Here is Invoice #${invoice.invoice_number} for ${total}, due on ${date}.

Please let us know if you have any questions.

Best regards,
TwineCapital`;
}
