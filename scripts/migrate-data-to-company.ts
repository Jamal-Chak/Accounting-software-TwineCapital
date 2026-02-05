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

async function migrateData() {
    console.log('🔄 Migrating invoices and clients to correct company...\n')

    // 1. Get the target user and company
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

    console.log(`✅ Target Company: ${company.name} (${company.id})`)
    console.log(`✅ User: ${user.email}\n`)

    // 2. Update all clients with placeholder company IDs
    console.log('👥 Updating clients...')
    const placeholderCompanyIds = [
        '00000000-0000-0000-0000-000000000000',
        '22222222-2222-2222-2222-222222222222'
    ]

    const { data: updatedClients, error: clientError } = await supabase
        .from('clients')
        .update({ company_id: company.id })
        .in('company_id', placeholderCompanyIds)
        .select()

    if (clientError) {
        console.error('❌ Error updating clients:', clientError)
    } else {
        console.log(`✅ Updated ${updatedClients?.length || 0} clients\n`)
    }

    // 3. Update all invoices with placeholder company IDs
    console.log('📋 Updating invoices...')
    const { data: updatedInvoices, error: invoiceError } = await supabase
        .from('invoices')
        .update({ company_id: company.id })
        .in('company_id', placeholderCompanyIds)
        .select()

    if (invoiceError) {
        console.error('❌ Error updating invoices:', invoiceError)
    } else {
        console.log(`✅ Updated ${updatedInvoices?.length || 0} invoices\n`)
    }

    // 4. Verify the migration
    console.log('🔍 Verifying migration...')
    const { data: verifyInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)

    const { data: verifyClients } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)

    console.log(`✅ Invoices now linked to company: ${verifyInvoices?.length || 0}`)
    console.log(`✅ Clients now linked to company: ${verifyClients?.length || 0}`)

    console.log('\n✨ Migration complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Refresh the invoices page: http://localhost:3000/invoices')
    console.log('   2. You should now see all migrated invoices')
}

migrateData()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
