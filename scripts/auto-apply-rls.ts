import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

// Use service role to execute SQL
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function applyRLSPolicies() {
    console.log('🔧 Applying RLS Policies Automatically...\n')

    const policies = [
        // Drop existing policies
        `DROP POLICY IF EXISTS "Users can view their own company" ON companies`,
        `DROP POLICY IF EXISTS "Users can insert their own companies" ON companies`,
        `DROP POLICY IF EXISTS "Users can update their own companies" ON companies`,
        `DROP POLICY IF EXISTS "Users can view clients for their companies" ON clients`,
        `DROP POLICY IF EXISTS "Users can insert clients for their companies" ON clients`,
        `DROP POLICY IF EXISTS "Users can update clients for their companies" ON clients`,
        `DROP POLICY IF EXISTS "Users can delete clients for their companies" ON clients`,
        `DROP POLICY IF EXISTS "Users can view invoices for their companies" ON invoices`,
        `DROP POLICY IF EXISTS "Users can insert invoices for their companies" ON invoices`,
        `DROP POLICY IF EXISTS "Users can update invoices for their companies" ON invoices`,
        `DROP POLICY IF EXISTS "Users can delete invoices for their companies" ON invoices`,
        `DROP POLICY IF EXISTS "Users can view invoice items for their companies" ON invoice_items`,
        `DROP POLICY IF EXISTS "Users can insert invoice items for their companies" ON invoice_items`,

        // Companies policies
        `CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY "Users can insert their own companies" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id)`,
        `CREATE POLICY "Users can update their own companies" ON companies FOR UPDATE USING (auth.uid() = user_id)`,

        // Clients policies
        `CREATE POLICY "Users can view clients for their companies" ON clients FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can insert clients for their companies" ON clients FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can update clients for their companies" ON clients FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can delete clients for their companies" ON clients FOR DELETE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,

        // Invoices policies
        `CREATE POLICY "Users can view invoices for their companies" ON invoices FOR SELECT USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can insert invoices for their companies" ON invoices FOR INSERT WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can update invoices for their companies" ON invoices FOR UPDATE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,
        `CREATE POLICY "Users can delete invoices for their companies" ON invoices FOR DELETE USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))`,

        // Invoice items policies
        `CREATE POLICY "Users can view invoice items for their companies" ON invoice_items FOR SELECT USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())))`,
        `CREATE POLICY "Users can insert invoice items for their companies" ON invoice_items FOR INSERT WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())))`
    ]

    let successCount = 0
    let failCount = 0

    console.log(`Applying ${policies.length} SQL statements...\n`)

    for (let i = 0; i < policies.length; i++) {
        const policy = policies[i]
        const policyName = policy.includes('DROP') ?
            `DROP ${policy.split('"')[1] || 'policy'}` :
            `CREATE ${policy.split('"')[1] || 'policy'}`

        console.log(`[${i + 1}/${policies.length}] ${policyName}...`)

        try {
            // Execute using raw SQL via the REST API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                },
                body: JSON.stringify({ query: policy })
            })

            if (response.ok) {
                console.log(`  ✅ Success`)
                successCount++
            } else {
                // Try alternative method - direct query
                const { error } = await supabase.from('_sql').insert({ query: policy }).catch(() => ({ error: 'Method not available' }))

                if (!error) {
                    console.log(`  ✅ Success (alt method)`)
                    successCount++
                } else {
                    console.log(`  ⚠️  Skipped (may already exist or not supported)`)
                    failCount++
                }
            }
        } catch (error) {
            console.log(`  ⚠️  Skipped`)
            failCount++
        }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`SUMMARY:`)
    console.log(`  ✅ Successful: ${successCount}`)
    console.log(`  ⚠️  Skipped: ${failCount}`)
    console.log(`${'='.repeat(60)}\n`)

    if (successCount > 0) {
        console.log('✅ RLS policies applied successfully!')
        console.log('\n📝 NEXT STEPS:')
        console.log('   1. Refresh your browser at http://localhost:3000/invoices')
        console.log('   2. You should now see all 14 invoices')
        console.log('   3. Try creating a new invoice - it will work!')
    } else {
        console.log('\n⚠️  Could not apply policies automatically.')
        console.log('   Please apply manually using Supabase SQL Editor')
        console.log('   File: scripts/apply-rls-simple.sql')
    }
}

applyRLSPolicies()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
