
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    try {
        const sqlPath = path.join(__dirname, 'migrations', 'fix_companies_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying COMPANIES migration...');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('--- Executing ---');
            console.log(statement.substring(0, 50) + '...');

            const { error } = await supabase.rpc('execute_raw_sql', { sql: statement });

            if (error) {
                console.error('FAILED:', error.message);
            } else {
                console.log('SUCCESS');
            }
        }

        console.log('✅ Companies RLS Update Complete.');
    } catch (e) {
        console.error('Script error:', e);
    }
}

applyMigration();
