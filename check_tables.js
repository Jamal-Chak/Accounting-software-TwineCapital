const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
    try {
        console.log('Checking for new tables...')

        const tables = ['accounts', 'journals', 'journal_lines'];
        let allExist = true;

        for (const table of tables) {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                console.error(`Error checking table ${table}:`, error.message);
                allExist = false;
            } else {
                console.log(`Table ${table} exists.`);
            }
        }

        if (allExist) {
            console.log('SUCCESS: All double-entry tables exist.');
        } else {
            console.log('FAILURE: Some tables are missing.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

checkTables()
