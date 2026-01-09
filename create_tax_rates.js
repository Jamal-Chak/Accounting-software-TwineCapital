const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTaxRatesTable() {
    try {
        console.log('Creating tax_rates table...')

        const sql = fs.readFileSync('create_tax_rates_table.sql', 'utf8');

        const { error } = await supabase.rpc('execute_raw_sql', { sql });

        if (error) {
            console.error('Error creating tax_rates table:', error.message);
            return;
        }

        console.log('SUCCESS: tax_rates table created.');

        // Verify table exists
        const { data, error: verifyError } = await supabase
            .from('tax_rates')
            .select('*')
            .limit(1);

        if (verifyError) {
            console.error('Error verifying table:', verifyError.message);
        } else {
            console.log('Table verified successfully.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

createTaxRatesTable()
