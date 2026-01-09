const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
    try {
        console.log('Testing RPC with SELECT 1...');
        const { data, error } = await supabase.rpc('execute_raw_sql', { sql: 'SELECT 1' });
        if (error) {
            console.error('RPC Test Failed:', JSON.stringify(error, null, 2));
        } else {
            console.log('RPC Test Success:', data);
        }

        console.log('Checking if settings column exists...');
        const { data: colData, error: colError } = await supabase.from('companies').select('settings').limit(1);
        if (colError) {
            console.log('Column check failed (likely does not exist):', colError.message);
        } else {
            console.log('Column check success! Settings column exists.');
        }

    } catch (e) {
        console.error(e);
    }
}
test()
