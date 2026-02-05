
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createTestUser() {
    const email = 'verify@twinecapital.com'
    const password = 'Password123!'

    console.log(`Creating test user: ${email}`)

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const user = existingUsers.users.find(u => u.email === email)

    if (user) {
        console.log('User already exists, updating password...')
        const { error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: password, email_confirm: true }
        )
        if (error) {
            console.error('Error updating user:', error)
            process.exit(1)
        }
        console.log('User password updated.')
    } else {
        console.log('Creating new user...')
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name: 'Verification User' }
        })

        if (error) {
            console.error('Error creating user:', error)
            process.exit(1)
        }
        console.log('User created:', data.user.id)
    }
}

createTestUser()
