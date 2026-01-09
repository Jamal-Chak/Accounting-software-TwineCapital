const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
    try {
        const sql = fs.readFileSync('migrations/add_projects_table.sql', 'utf8')

        console.log('Running migration: add_projects_table.sql')
        console.log('SQL length:', sql.length, 'characters')

        // Split into individual statements and run them
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`Found ${statements.length} SQL statements`)

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'
            console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)

            const { data, error } = await supabase.rpc('exec_sql', { sql_string: statement })

            if (error) {
                console.error(`Error on statement ${i + 1}:`, error)
                // Continue with other statements
            } else {
                console.log(`✓ Statement ${i + 1} executed successfully`)
            }
        }

        console.log('\nMigration completed!')

    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
