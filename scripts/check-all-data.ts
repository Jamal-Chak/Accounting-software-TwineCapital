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

async function checkAllData() {
    console.log('🔍 Checking ALL invoices and clients in database...\n')

    // Get all invoices
    const { data: allInvoices, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    if (invError) {
        console.error('❌ Error fetching all invoices:', invError)
    } else {
        console.log(`📋 Total invoices in database: ${allInvoices?.length || 0}`)
        if (allInvoices && allInvoices.length > 0) {
            allInvoices.forEach((inv, idx) => {
                console.log(`\n  ${idx + 1}. Invoice #${inv.invoice_number}`)
                console.log(`     Company ID: ${inv.company_id}`)
                console.log(`     Client ID: ${inv.client_id}`)
                console.log(`     Status: ${inv.status}`)
                console.log(`     Total: R${inv.total_amount}`)
                console.log(`     Created: ${inv.created_at}`)
            })
        }
    }

    // Get all clients
    console.log('\n\n👥 All clients in database:')
    const { data: allClients, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    if (clientError) {
        console.error('❌ Error fetching all clients:', clientError)
    } else {
        console.log(`Total clients: ${allClients?.length || 0}`)
        if (allClients && allClients.length > 0) {
            allClients.forEach((client, idx) => {
                console.log(`  ${idx + 1}. ${client.name} - Company ID: ${client.company_id}`)
            })
        }
    }

    // Get all companies
    console.log('\n\n🏢 All companies in database:')
    const { data: allCompanies, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

    if (companyError) {
        console.error('❌ Error fetching companies:', companyError)
    } else {
        console.log(`Total companies: ${allCompanies?.length || 0}`)
        if (allCompanies && allCompanies.length > 0) {
            allCompanies.forEach((company, idx) => {
                console.log(`  ${idx + 1}. ${company.name} (${company.id}) - User: ${company.user_id}`)
            })
        }
    }

    console.log('\n✨ Check complete!')
}

checkAllData()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
