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

async function debugRLS() {
    console.log('🔍 Debugging RLS and Invoice Visibility...\n')

    // Get user and company
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

    console.log(`✅ User: ${user.email} (${user.id})`)
    console.log(`✅ Company: ${company.name} (${company.id})\n`)

    // Check RLS status
    console.log('🔒 Checking RLS status...')
    const { data: rlsCheck, error: rlsError } = await supabase.rpc('exec_sql', {
        sql_query: `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('invoices', 'clients', 'companies')
    `
    }).catch(() => ({ data: null, error: 'RPC not available' }))

    if (rlsError || !rlsCheck) {
        console.log('⚠️  Cannot check RLS status via RPC')
    } else {
        console.log('RLS Status:', rlsCheck)
    }

    // Try to query invoices as service role (should work)
    console.log('\n📋 Testing invoice retrieval (Service Role - bypasses RLS):')
    const { data: allInvoices, error: allError } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

    if (allError) {
        console.error('❌ Error:', allError)
    } else {
        console.log(`✅ Found ${allInvoices?.length || 0} invoices for company`)
        if (allInvoices && allInvoices.length > 0) {
            allInvoices.forEach((inv, idx) => {
                console.log(`  ${idx + 1}. #${inv.invoice_number} - ${inv.status} - R${inv.total_amount}`)
            })
        }
    }

    // Check if there are any policies on invoices table
    console.log('\n🔐 Checking policies on invoices table...')
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql_query: `
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'invoices'
    `
    }).catch(() => ({ data: null, error: 'Cannot query policies' }))

    if (policies) {
        console.log('✅ Policies found:', policies.length)
        policies.forEach((p: any) => {
            console.log(`  - ${p.policyname} (${p.cmd})`)
        })
    } else {
        console.log('⚠️  Could not retrieve policies:', policiesError)
    }

    console.log('\n✨ Debug complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Check browser console for errors when creating invoice')
    console.log('2. Verify the SQL was executed successfully in Supabase')
    console.log('3. Try refreshing the invoices page')
}

debugRLS()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
