// Quick diagnostic script to test authentication
import 'dotenv/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Authentication Diagnostic\n')

// Check 1: Environment variables
console.log('1️⃣ Environment Variables:')
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('\n❌ PROBLEM: Missing Supabase credentials in .env.local')
    console.log('   Solution: Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
}

// Check 2: Test Supabase connection
console.log('\n2️⃣ Testing Supabase Connection...')

async function testSupabase() {
    try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

        // Test auth connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
            console.log(`   ❌ Connection error: ${error.message}`)
            return false
        }

        console.log('   ✅ Successfully connected to Supabase')
        return true
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        return false
    }
}

// Check 3: Test database
async function testDatabase() {
    console.log('\n3️⃣ Testing Database Tables...')
    try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

        // Check if companies table exists
        const { data, error } = await supabase
            .from('companies')
            .select('count')
            .limit(1)

        if (error) {
            if (error.message.includes('relation "companies" does not exist') ||
                error.message.includes('does not exist')) {
                console.log('   ❌ Companies table does not exist')
                console.log('   Solution: Run database migrations')
                return false
            }
            console.log(`   ⚠️  Table check error: ${error.message}`)
            return true // Table exists but might have RLS issues
        }

        console.log('   ✅ Companies table exists')
        return true
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        return false
    }
}

// Check 4: Test signup
async function testSignup() {
    console.log('\n4️⃣ Testing Signup Flow...')
    try {
        const testEmail = `test-${Date.now()}@example.com`
        const testPassword = 'testpass123'

        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: testEmail,
                password: testPassword
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.log(`   ❌ Signup failed (${response.status}): ${data.error}`)

            if (data.error.includes('email')) {
                console.log('   💡 Possible issue: Email confirmation required')
            }
            return false
        }

        console.log('   ✅ Signup successful')
        return true
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        console.log('   Make sure dev server is running: npm run dev')
        return false
    }
}

// Run diagnostics
async function runDiagnostics() {
    const supabaseOk = await testSupabase()
    if (!supabaseOk) {
        console.log('\n❌ Cannot proceed - fix Supabase connection first')
        process.exit(1)
    }

    await testDatabase()

    console.log('\n5️⃣ Testing API Route...')
    console.log('   Make sure dev server is running on http://localhost:3000')
    console.log('   Then run signup test manually from browser console')
    console.log('\n📋 Summary Complete\n')
}

runDiagnostics().catch(console.error)
