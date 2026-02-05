import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixCompanyRLS() {
    console.log('🔧 Fixing Company RLS Issue...\n')

    // Get the current user email
    const userEmail = 'verify@twinecapital.com'

    // 1. Find the user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('❌ Error fetching users:', userError)
        return
    }

    const user = userData.users.find(u => u.email === userEmail)

    if (!user) {
        console.error(`❌ User ${userEmail} not found`)
        return
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)

    // 2. Check if user already has a company
    const { data: existingCompanies, error: companyCheckError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)

    if (companyCheckError) {
        console.error('❌ Error checking existing companies:', companyCheckError)
        return
    }

    if (existingCompanies && existingCompanies.length > 0) {
        console.log(`\n✅ User already has ${existingCompanies.length} company(ies):`)
        existingCompanies.forEach(c => {
            console.log(`   - ${c.name} (${c.id})`)
        })
        console.log('\n✨ Company association is correct. Issue may be elsewhere.')
        return
    }

    // 3. Create a company for the user
    console.log('\n📝 Creating company for user...')

    const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([
            {
                user_id: user.id,
                name: 'Twine Capital',
                vat_number: 'VAT4012345678',
                country: 'South Africa',
                currency: 'ZAR'
            }
        ])
        .select()
        .single()

    if (companyError) {
        console.error('❌ Error creating company:', companyError)
        return
    }

    console.log(`✅ Company created: ${newCompany.name} (${newCompany.id})`)

    // 4. Verify the company was created
    const { data: verification } = await supabase
        .from('companies')
        .select('*')
        .eq('id', newCompany.id)
        .single()

    if (verification) {
        console.log('\n✅ Verification successful!')
        console.log(`   User: ${user.email}`)
        console.log(`   Company: ${verification.name}`)
        console.log(`   Company ID: ${verification.id}`)
    }

    console.log('\n✨ Done! You should now be able to create invoices and clients.')
}

fixCompanyRLS().catch(console.error)
