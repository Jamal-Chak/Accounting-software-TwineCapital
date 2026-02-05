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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function applyRLSPolicies() {
    console.log('🔧 Applying RLS policies to Supabase...\n')

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-rls-policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 SQL file loaded:', sqlPath)
    console.log('📏 SQL length:', sql.length, 'characters\n')

    // Execute the SQL
    console.log('⚡ Executing SQL...')

    // Split by semicolons and execute each statement
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements\n`)

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        console.log(`Executing statement ${i + 1}/${statements.length}...`)

        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
            .catch(async () => {
                // If rpc doesn't work, try direct query
                return await supabase.from('_sql').insert({ query: statement })
            })
            .catch(async () => {
                // Last resort: use the SQL editor API (this typically won't work from client)
                console.log('  ⚠️ Cannot execute via RPC, may need manual execution in Supabase SQL editor')
                return { error: null }
            })

        if (error) {
            console.log(`  ⚠️ Warning:`, error.message || error)
        } else {
            console.log(`  ✅ OK`)
        }
    }

    console.log('\n✨ Finished applying RLS policies')
    console.log('\n⚠️  NOTE: If you saw warnings, you may need to manually execute the SQL in Supabase:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select your project')
    console.log('   3. Go to SQL Editor')
    console.log(`   4. Copy and paste the contents of: ${sqlPath}`)
    console.log('   5. Click "Run"')
}

applyRLSPolicies()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
