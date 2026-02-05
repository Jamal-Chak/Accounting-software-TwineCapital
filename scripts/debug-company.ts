
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugCompany() {
    console.log('🔍 DEBUGGING COMPANY CONTEXT')
    console.log('='.repeat(60))

    // 1. Check Companies Table Access (Service Role)
    const { data: allCompanies, error: allErr } = await supabase
        .from('companies')
        .select('id, user_id, name')
        .limit(5)

    if (allErr) {
        console.error('❌ Error querying companies (Admin):', allErr)
    } else {
        console.log(`✅ Admin Access: Found ${allCompanies.length} companies.`)
    }

    // 2. Check RLS Policies on Companies
    // We can't easily simulate "User Auth" here without a valid user token.
    // However, we can inspect the policies via SQL if we had that ability, or just try to act as a user if we sign them in.

    // Let's rely on checking the table structure/existence first.

    // 3. Check if user -> company mapping exists for a known user (if we had one)
    // For now, I'll validte that the table allows inserts and selects.

    console.log('\nChecking Table Info...')
    const { error: rpcError } = await supabase.rpc('execute_raw_sql', {
        sql: "SELECT * FROM companies LIMIT 1"
    });

    if (rpcError) {
        // execute_raw_sql might fail if function not exists, which is fine, 
        // but if it works it means we can query.
        // Let's assume the previous select worked.
        console.log('RPC check skipped or failed (expected if restricted).')
    }

    console.log('\nSuggested Fix: Ensure RLS policies on "companies" allow SELECT/INSERT.')
}

debugCompany().catch(console.error)
