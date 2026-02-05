import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function testInvoiceCreation() {
    console.log('🧪 Testing invoice creation...\n')

    // Get the target user and company
    const testEmail = 'twineenginehub@yahoo.com'
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === testEmail)

    if (!user) {
        console.error('❌ User not found')
        process.exit(1)
    }

    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!company) {
        console.error('❌ Company not found')
        process.exit(1)
    }

    console.log(`✅ Company: ${company.name} (${company.id})`)

    // Get or create a test client
    let testClient
    const { data: existingClients } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .limit(1)

    if (existingClients && existingClients.length > 0) {
        testClient = existingClients[0]
        console.log(`✅ Using existing client: ${testClient.name} (${testClient.id})`)
    } else {
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert([{
                company_id: company.id,
                name: 'Test Client for Invoice',
                email: 'test@example.com'
            }])
            .select()
            .single()

        if (clientError || !newClient) {
            console.error('❌ Error creating test client:', clientError)
            process.exit(1)
        }

        testClient = newClient
        console.log(`✅ Created test client: ${testClient.name} (${testClient.id})`)
    }

    // Create a test invoice
    console.log('\n📝 Creating test invoice...')
    const testInvoice = {
        company_id: company.id,
        client_id: testClient.id,
        invoice_number: `TEST-${Date.now()}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        tax_amount: 150,
        total_amount: 1150
    }

    const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([testInvoice])
        .select()
        .single()

    if (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError)
        console.log('\nError details:')
        console.log('  Code:', invoiceError.code)
        console.log('  Message:', invoiceError.message)
        console.log('  Details:', invoiceError.details)
        console.log('  Hint:', invoiceError.hint)
        process.exit(1)
    }

    console.log('✅ Invoice created successfully!')
    console.log(`   Invoice #${createdInvoice.invoice_number}`)
    console.log(`   ID: ${createdInvoice.id}`)
    console.log(`   Company ID: ${createdInvoice.company_id}`)
    console.log(`   Total: R${createdInvoice.total_amount}`)

    // Verify it can be retrieved
    console.log('\n🔍 Verifying invoice can be retrieved...')
    const { data: retrieved, error: retrieveError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', createdInvoice.id)
        .single()

    if (retrieveError || !retrieved) {
        console.error('❌ Cannot retrieve created invoice:', retrieveError)
    } else {
        console.log('✅ Invoice retrieved successfully!')
    }

    console.log('\n✨ Test complete!')
}

testInvoiceCreation()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
