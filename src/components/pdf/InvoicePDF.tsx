import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2px solid #2563eb',
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 5,
    },
    invoiceTitle: {
        fontSize: 18,
        color: '#374151',
        marginTop: 10,
    },
    section: {
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        color: '#4b5563',
    },
    value: {
        color: '#111827',
    },
    table: {
        marginTop: 20,
        borderTop: '1px solid #e5e7eb',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #e5e7eb',
        padding: 8,
    },
    col1: { width: '40%' },
    col2: { width: '15%', textAlign: 'right' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '15%', textAlign: 'right' },
    col5: { width: '15%', textAlign: 'right' },
    totals: {
        marginTop: 20,
        marginLeft: 'auto',
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
        paddingTop: 5,
        borderTop: '2px solid #2563eb',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 8,
    },
})

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    tax_rate: number
    total_amount: number
}

interface Client {
    name: string
    email?: string
    address?: string
}

interface InvoicePDFProps {
    invoice: {
        invoice_number: string
        issue_date: string
        due_date: string
        total_amount: number
        tax_amount: number
        notes?: string
        items?: InvoiceItem[]
    }
    client: Client
}

export function InvoicePDF({ invoice, client }: InvoicePDFProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount)
    }

    const subtotal = invoice.total_amount - invoice.tax_amount

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>Twine Capital</Text>
                    <Text style={{ color: '#6b7280', fontSize: 9 }}>Business Management Platform</Text>
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                </View>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Invoice Number:</Text>
                            <Text style={styles.value}>{invoice.invoice_number}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Issue Date:</Text>
                            <Text style={styles.value}>{new Date(invoice.issue_date).toLocaleDateString('en-ZA')}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Due Date:</Text>
                            <Text style={styles.value}>{new Date(invoice.due_date).toLocaleDateString('en-ZA')}</Text>
                        </View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.section}>
                    <Text style={styles.label}>Bill To:</Text>
                    <Text style={{ ...styles.value, fontSize: 12, marginTop: 5 }}>{client.name}</Text>
                    {client.email && <Text style={styles.value}>{client.email}</Text>}
                    {client.address && <Text style={styles.value}>{client.address}</Text>}
                </View>

                {/* Items Table */}
                {invoice.items && invoice.items.length > 0 && (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>Description</Text>
                            <Text style={styles.col2}>Qty</Text>
                            <Text style={styles.col3}>Price</Text>
                            <Text style={styles.col4}>Tax</Text>
                            <Text style={styles.col5}>Total</Text>
                        </View>
                        {invoice.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.col1}>{item.description}</Text>
                                <Text style={styles.col2}>{item.quantity}</Text>
                                <Text style={styles.col3}>{formatCurrency(item.unit_price)}</Text>
                                <Text style={styles.col4}>{item.tax_rate}%</Text>
                                <Text style={styles.col5}>{formatCurrency(item.total_amount)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal:</Text>
                        <Text>{formatCurrency(subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Tax:</Text>
                        <Text>{formatCurrency(invoice.tax_amount)}</Text>
                    </View>
                    <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                        <Text>Total:</Text>
                        <Text>{formatCurrency(invoice.total_amount)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={{ ...styles.section, marginTop: 20 }}>
                        <Text style={styles.label}>Notes:</Text>
                        <Text style={{ ...styles.value, marginTop: 5 }}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business!</Text>
                    <Text>For any questions regarding this invoice, please contact us.</Text>
                </View>
            </Page>
        </Document>
    )
}
