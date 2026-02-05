import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
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

async function checkInvoices() {
    console.log('🔍 Checking invoices in database...\n')

    // 1. Get the logged-in user's company
    const testEmail = 'twineenginehub@yahoo.com'
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('❌ Error fetching users:', userError)
        process.exit(1)
    }

    const user = users.users.find(u => u.email === testEmail)
    if (!user) {
        console.error(`❌ User ${testEmail} not found`)
        process.exit(1)
    }

    console.log(`✅ User: ${user.email} (${user.id})`)

    // 2. Get user's company
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (companyError || !company) {
        console.error('❌ Error fetching company:', companyError)
        process.exit(1)
    }

    console.log(`✅ Company: ${company.name} (${company.id})\n`)

    // 3. Check invoices for this company
    console.log('📋 Invoices in database:')
    const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

    if (invoicesError) {
        console.error('❌ Error fetching invoices:', invoicesError)
        process.exit(1)
    }

    if (!invoices || invoices.length === 0) {
        console.log('⚠️  No invoices found for this company')
    } else {
        console.log(`✅ Found ${invoices.length} invoice(s):`)
        invoices.forEach((inv, idx) => {
            console.log(`\n  ${idx + 1}. Invoice #${inv.invoice_number}`)
            console.log(`     ID: ${inv.id}`)
            console.log(`     Status: ${inv.status}`)
            console.log(`     Client ID: ${inv.client_id}`)
            console.log(`     Total: R${inv.total_amount}`)
            console.log(`     Created: ${inv.created_at}`)
        })
    }

    // 4. Check clients
    console.log('\n\n👥 Clients in database:')
    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)

    if (clientsError) {
        console.error('❌ Error fetching clients:', clientsError)
        process.exit(1)
    }

    if (!clients || clients.length === 0) {
        console.log('⚠️  No clients found for this company')
    } else {
        console.log(`✅ Found ${clients.length} client(s):`)
        clients.forEach((client, idx) => {
            console.log(`  ${idx + 1}. ${client.name} (${client.id})`)
        })
    }

    // 5. Check RLS policies
    console.log('\n\n🔒 Checking RLS policies on invoices table:')
    const { data: policies, error: policiesError } = await supabase.rpc('pg_policies', {})
        .catch(async () => {
            // Fallback: query information_schema
            const { data, error } = await supabase
                .from('pg_policies')
                .select('*')
                .eq('tablename', 'invoices')

            return { data, error }
        })

    if (policiesError) {
        console.log('⚠️  Could not fetch RLS policies (this is expected)')
    } else if (policies) {
        console.log('✅ RLS policies found:', policies)
    }

    console.log('\n✨ Check complete!')
}

checkInvoices()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
