import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setupUserCompany() {
    console.log('🔧 Setting up user company for TwineCapital...\n')

    // 1. Find the test user
    const testEmail = 'twineenginehub@yahoo.com'
    console.log(`1️⃣ Looking for user: ${testEmail}`)

    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        console.error('❌ Error fetching users:', userError)
        process.exit(1)
    }

    const testUser = users.users.find(u => u.email === testEmail)

    if (!testUser) {
        console.error(`❌ User ${testEmail} not found`)
        console.log('Available users:', users.users.map(u => u.email))
        process.exit(1)
    }

    console.log(`✅ Found user: ${testUser.email} (ID: ${testUser.id})\n`)

    // 2. Check if user already has a company
    console.log('2️⃣ Checking for existing company...')
    const { data: existingCompanies, error: companyCheckError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', testUser.id)

    if (companyCheckError) {
        console.error('❌ Error checking companies:', companyCheckError)
        process.exit(1)
    }

    if (existingCompanies && existingCompanies.length > 0) {
        console.log(`✅ User already has ${existingCompanies.length} company(ies)`)
        console.log('First company:', existingCompanies[0])
        console.log('\n✨ Setup already complete!')
        return
    }

    console.log('⚠️ No company found for user\n')

    // 3. Create a company for the user
    console.log('3️⃣ Creating company for user...')
    const newCompany = {
        user_id: testUser.id,
        name: 'TwineCapital Demo Company',
        email: testEmail,
        phone: '+27 11 123 4567',
        address: '123 Business Street, Johannesburg, 2000',
        tax_number: 'TAX123456789',
        registration_number: 'REG987654321'
    }

    const { data: createdCompany, error: createError } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single()

    if (createError) {
        console.error('❌ Error creating company:', createError)
        process.exit(1)
    }

    console.log('✅ Company created successfully!')
    console.log('Company details:', createdCompany)

    // 4. Verify the setup
    console.log('\n4️⃣ Verifying setup...')
    const { data: verifyCompany, error: verifyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', testUser.id)
        .single()

    if (verifyError || !verifyCompany) {
        console.error('❌ Verification failed:', verifyError)
        process.exit(1)
    }

    console.log('✅ Verification successful!')
    console.log('\n🎉 Setup complete! User can now create clients and invoices.')
    console.log(`\n📝 Summary:`)
    console.log(`   User: ${testUser.email}`)
    console.log(`   User ID: ${testUser.id}`)
    console.log(`   Company: ${verifyCompany.name}`)
    console.log(`   Company ID: ${verifyCompany.id}`)
}

setupUserCompany()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
    })
