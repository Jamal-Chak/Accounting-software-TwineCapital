const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
    try {
        console.log('Applying migration: add_company_settings_json.sql...');

        // Use absolute path to be sure
        const migrationPath = path.resolve(__dirname, 'migrations', 'add_company_settings_json.sql');

        if (!fs.existsSync(migrationPath)) {
            console.error('Migration file not found at:', migrationPath);
            return;
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('SQL content length:', sql.length);

        const { data, error } = await supabase.rpc('execute_raw_sql', { sql });

        if (error) {
            console.error('Error executing migration:', JSON.stringify(error, null, 2));
        } else {
            console.log('SUCCESS: Migration executed successfully.');
        }

    } catch (e) {
        console.error('CRITICAL ERROR:', e)
    }
}

applyMigration()
