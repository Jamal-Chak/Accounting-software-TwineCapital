
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function assignCompany() {
    const email = 'verify@twinecapital.com'

    // 1. Get User
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('User not found')
        process.exit(1)
    }

    console.log(`Found user ${user.id}`)

    // 2. Check for existing company
    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)

    if (companies && companies.length > 0) {
        console.log('User already has a company:', companies[0].name)
        return
    }

    // 3. Create Company
    console.log('Creating company for user...')
    const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
            user_id: user.id,
            name: 'Twine Test Corp',
            country: 'South Africa',
            currency: 'ZAR',
            settings: {
                inventory: { valuationMethod: 'fifo', trackCost: true, allowNegative: false },
                notifications: { emailDigest: true }
            }
        })
        .select()
        .single()

    if (companyError) {
        console.error('Error creating company:', companyError)
        process.exit(1)
    }

    console.log('Company created:', company)
}

assignCompany()
