import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components'

interface InvoiceEmailProps {
    invoiceNumber: string
    clientName: string
    companyName: string
    totalAmount: string
    dueDate: string
    invoiceUrl?: string
}

export function InvoiceEmail({
    invoiceNumber,
    clientName,
    companyName,
    totalAmount,
    dueDate,
    invoiceUrl,
}: InvoiceEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Invoice {invoiceNumber} from {companyName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Invoice {invoiceNumber}</Heading>

                    <Text style={text}>Dear {clientName},</Text>

                    <Text style={text}>
                        Thank you for your business! Please find your invoice details below:
                    </Text>

                    <Section style={invoiceDetails}>
                        <Text style={detailRow}>
                            <strong>Invoice Number:</strong> {invoiceNumber}
                        </Text>
                        <Text style={detailRow}>
                            <strong>Amount Due:</strong> {totalAmount}
                        </Text>
                        <Text style={detailRow}>
                            <strong>Due Date:</strong> {dueDate}
                        </Text>
                    </Section>

                    {invoiceUrl && (
                        <Section style={buttonContainer}>
                            <Button style={button} href={invoiceUrl}>
                                View Invoice
                            </Button>
                        </Section>
                    )}

                    <Hr style={hr} />

                    <Text style={footer}>
                        This invoice was sent by {companyName}. If you have any questions,
                        please don't hesitate to contact us.
                    </Text>

                    <Text style={footer}>
                        Thank you for your business!
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
}

const h1 = {
    color: '#2563eb',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0 40px',
}

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
}

const invoiceDetails = {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    margin: '24px 40px',
    padding: '24px',
}

const detailRow = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '8px 0',
}

const buttonContainer = {
    padding: '24px 40px',
}

const button = {
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
}

const hr = {
    borderColor: '#e6ebf1',
    margin: '32px 40px',
}

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '0 40px',
}

export default InvoiceEmail
