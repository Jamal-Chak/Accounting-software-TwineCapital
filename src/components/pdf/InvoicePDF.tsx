import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, Client, InvoiceItem } from '@/lib/database';

// Register a font (optional, usually standard fonts like Helvetica work fine out of box)
// Font.register({ family: 'Roboto', src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 12,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        textTransform: 'uppercase',
    },
    companyDetails: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        color: '#000',
        marginBottom: 2,
    },
    clientSection: {
        marginBottom: 30,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#EEE',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8,
    },
    tableColDesc: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#EEE',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8,
    },
    tableColSmall: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#EEE',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 8,
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
    },
    totals: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#999',
        fontSize: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    }
});

interface InvoicePDFProps {
    invoice: Invoice;
    client?: Client;
    items: InvoiceItem[];
    companyName?: string;
}

const formatCurrency = (amount: number, currency = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, items, companyName }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.companyDetails}>
                    <Text style={styles.title}>{companyName || 'TwineCapital'}</Text>
                    <Text style={styles.value}>Invoice #{invoice.invoice_number}</Text>
                    <Text style={styles.value}>Date: {new Date(invoice.issue_date).toLocaleDateString()}</Text>
                    <Text style={styles.value}>Due: {new Date(invoice.due_date).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={{ ...styles.value, color: invoice.status === 'paid' ? 'green' : (invoice.status === 'overdue' ? 'red' : 'gray') }}>
                        {invoice.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Client Details */}
            <View style={styles.clientSection}>
                <Text style={styles.label}>BILL TO:</Text>
                <Text style={{ ...styles.value, fontWeight: 'bold' }}>{client?.name || 'Unknown Client'}</Text>
                {client?.email && <Text style={styles.value}>{client.email}</Text>}
                {client?.address && <Text style={styles.value}>{client.address}</Text>}
                {client?.tax_number && <Text style={styles.value}>VAT: {client.tax_number}</Text>}
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                    <View style={{ ...styles.tableColDesc, ...styles.tableHeader }}>
                        <Text>Description</Text>
                    </View>
                    <View style={{ ...styles.tableColSmall, ...styles.tableHeader }}>
                        <Text>Qty</Text>
                    </View>
                    <View style={{ ...styles.tableCol, ...styles.tableHeader }}>
                        <Text>Price</Text>
                    </View>
                    <View style={{ ...styles.tableCol, ...styles.tableHeader }}>
                        <Text>Total</Text>
                    </View>
                </View>

                {/* Table Rows */}
                {items.map((item) => (
                    <View style={styles.tableRow} key={item.id}>
                        <View style={styles.tableColDesc}>
                            <Text>{item.description}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text>{item.quantity}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text>{formatCurrency(item.unit_price)}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text>{formatCurrency(item.total_amount)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.totals}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount - invoice.tax_amount)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>VAT (15%):</Text>
                    <Text style={styles.totalValue}>{formatCurrency(invoice.tax_amount)}</Text>
                </View>
                <View style={{ ...styles.totalRow, marginTop: 10 }}>
                    <Text style={{ ...styles.totalLabel, fontWeight: 'bold', fontSize: 14 }}>Total:</Text>
                    <Text style={{ ...styles.totalValue, fontSize: 14 }}>{formatCurrency(invoice.total_amount)}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Thank you for your business!</Text>
                {invoice.notes && <Text style={{ marginTop: 5 }}>{invoice.notes}</Text>}
            </View>

        </Page>
    </Document>
);
