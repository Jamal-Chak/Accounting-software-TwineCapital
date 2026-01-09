
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

async function verifyInvoiceSubmission() {
    console.log('Starting invoice submission verification...')

    // Dynamic import to ensure env vars are loaded first
    const { createInvoice, addClient, getCompanyId } = await import('../src/lib/database')

    try {
        const companyId = await getCompanyId()
        console.log('Company ID:', companyId)

        if (!companyId) {
            throw new Error('Could not get company ID')
        }

        // Create a test client
        const clientData = {
            company_id: companyId,
            name: 'Test Client Script',
            email: 'test@script.com',
            phone: '1234567890',
            address: '123 Test St',
            tax_number: 'TAX123'
        }

        const clientResult = await addClient(clientData)
        if (!clientResult.success || !clientResult.data) {
            throw new Error(`Failed to create client: ${clientResult.error}`)
        }
        const clientId = clientResult.data.id
        console.log('Created Client ID:', clientId)

        const lineItems = [
            {
                description: 'Test Service Script',
                quantity: 1,
                unit_price: 100,
                tax_rate: 15,
                tax_amount: 15,
                total_amount: 115
            }
        ]

        // Calculate totals
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const taxAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100), 0)
        const totalAmount = subtotal + taxAmount

        // Create Invoice
        const invoiceData = {
            client_id: clientId,
            company_id: companyId,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: 'Test Invoice from Script',
            invoice_number: `INV-${Date.now()}`,
            status: 'sent' as const,
            subtotal: subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount
        }

        console.log('Creating invoice...')
        const invoiceResult = await createInvoice(invoiceData, lineItems)

        if (invoiceResult.success) {
            console.log('Invoice created successfully!')
            console.log('Invoice ID:', invoiceResult.data?.id)

            // Verify Journal Entries
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            const supabase = createClient(supabaseUrl, supabaseKey)

            const { data: journals, error: journalError } = await supabase
                .from('journals')
                .select('*, journal_lines(*)')
                .eq('reference_id', invoiceResult.data?.id)
                .eq('reference_type', 'invoice')

            if (journalError) {
                console.error('Error fetching journals:', journalError)
            } else {
                console.log('Journal Entries found:', journals?.length)
                if (journals && journals.length > 0) {
                    console.log('Journal Entry:', JSON.stringify(journals[0], null, 2))
                } else {
                    console.warn('WARNING: No journal entry found for this invoice!')
                }
            }

        } else {
            console.error('Failed to create invoice:', invoiceResult.error)
        }

    } catch (error) {
        console.error('Verification failed:', error)
    }
}

verifyInvoiceSubmission()
