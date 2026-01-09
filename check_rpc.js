const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRpc() {
    try {
        console.log('Checking for execute_raw_sql RPC...')
        const { data, error } = await supabase.rpc('execute_raw_sql', { sql: 'SELECT 1' })

        if (error) {
            console.error('RPC Error:', error.message)
            if (error.message.includes('function execute_raw_sql') && error.message.includes('does not exist')) {
                console.log('RESULT: execute_raw_sql does NOT exist.')
            } else {
                console.log('RESULT: RPC failed with other error.')
            }
        } else {
            console.log('RESULT: execute_raw_sql exists and works.')
        }
    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

checkRpc()
