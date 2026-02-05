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

async function checkRecentInvoices() {
    console.log('🔍 Checking recent invoices (last 5 minutes)...\n')

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

    console.log(`✅ User: ${user.email}`)
    console.log(`✅ Company: ${company.name} (${company.id})\n`)

    // Get all recent invoices (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    console.log('📋 ALL recent invoices in database (last 5 minutes):')
    const { data: allRecentInvoices, error: allError } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })

    if (allError) {
        console.error('❌ Error:', allError)
    } else if (!allRecentInvoices || allRecentInvoices.length === 0) {
        console.log('⚠️  No invoices created in the last 5 minutes')
    } else {
        console.log(`Found ${allRecentInvoices.length} recent invoice(s):\n`)
        allRecentInvoices.forEach((inv, idx) => {
            console.log(`  ${idx + 1}. Invoice #${inv.invoice_number}`)
            console.log(`     Company ID: ${inv.company_id}`)
            console.log(`     ✓ Correct company? ${inv.company_id === company.id ? 'YES ✅' : 'NO ❌'}`)
            console.log(`     Status: ${inv.status}`)
            console.log(`     Total: R${inv.total_amount}`)
            console.log(`     Created: ${inv.created_at}`)
            console.log()
        })
    }

    // Get invoices for the user's company
    console.log(`📋 Invoices for YOUR company (${company.id}):\n`)
    const { data: companyInvoices, error: companyError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

    if (companyError) {
        console.error('❌ Error:', companyError)
    } else {
        console.log(`Total: ${companyInvoices?.length || 0} (showing last 5)`)
        if (companyInvoices && companyInvoices.length > 0) {
            companyInvoices.forEach((inv, idx) => {
                console.log(`  ${idx + 1}. Invoice #${inv.invoice_number} - ${inv.status} - R${inv.total_amount}`)
            })
        }
    }

    console.log('\n✨ Check complete!')
}

checkRecentInvoices()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
