import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Client, Company } from '@/lib/database'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    companyInfo: {
        fontSize: 12,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
        textAlign: 'right',
    },
    invoiceNumber: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1f2937',
    },
    billTo: {
        marginBottom: 20,
    },
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        padding: 8,
    },
    col1: { width: '50%' },
    col2: { width: '15%', textAlign: 'right' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    totalsSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        paddingVertical: 5,
    },
    totalLabel: {
        fontSize: 10,
    },
    totalAmount: {
        fontSize: 10,
        textAlign: 'right',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        paddingVertical: 8,
        borderTopWidth: 2,
        borderTopColor: '#2563eb',
        marginTop: 5,
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    grandTotalAmount: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 9,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
    },
    notes: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f9fafb',
        borderRadius: 5,
    },
    notesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notesText: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.5,
    },
})

interface InvoicePDFProps {
    invoice: Invoice
    client: Client
    company: Company
}

export function InvoicePDF({ invoice, client, company }: InvoicePDFProps) {
    const items = invoice.items || []
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = invoice.tax_amount || 0
    const total = invoice.total_amount || (subtotal + taxAmount)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{company.name}</Text>
                        <Text>{company.country}</Text>
                        {company.vat_number && <Text>VAT: {company.vat_number}</Text>}
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                    </View>
                </View>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Invoice Date:</Text>
                            <Text>{new Date(invoice.issue_date).toLocaleDateString()}</Text>
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Due Date:</Text>
                            <Text>{new Date(invoice.due_date).toLocaleDateString()}</Text>
                        </View>
                        <View>
                            <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Status:</Text>
                            <Text style={{
                                color: invoice.status === 'paid' ? '#10b981' :
                                    invoice.status === 'overdue' ? '#ef4444' : '#f59e0b'
                            }}>
                                {invoice.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bill To */}
                <View style={styles.billTo}>
                    <Text style={styles.sectionTitle}>Bill To:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{client.name}</Text>
                    {client.email && <Text>{client.email}</Text>}
                    {client.phone && <Text>{client.phone}</Text>}
                    {client.address && <Text>{client.address}</Text>}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Description</Text>
                        <Text style={styles.col2}>Qty</Text>
                        <Text style={styles.col3}>Rate</Text>
                        <Text style={styles.col4}>Amount</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>{item.description}</Text>
                            <Text style={styles.col2}>{item.quantity}</Text>
                            <Text style={styles.col3}>{company.currency} {item.unit_price.toFixed(2)}</Text>
                            <Text style={styles.col4}>
                                {company.currency} {(item.quantity * item.unit_price).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalAmount}>{company.currency} {subtotal.toFixed(2)}</Text>
                    </View>
                    {taxAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tax:</Text>
                            <Text style={styles.totalAmount}>{company.currency} {taxAmount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>Total:</Text>
                        <Text style={styles.grandTotalAmount}>{company.currency} {total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes:</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business!</Text>
                    <Text style={{ marginTop: 5 }}>
                        For questions, contact {company.name}
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
