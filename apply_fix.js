
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
        const sqlPath = path.join(__dirname, 'migrations', 'fix_items_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying migration...');

        // Split by semicolon, but simple split might break if semicolons are in strings.
        // For this simple migration file, simple split is safe enough.
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
                // Don't throw, try next. DROPs might fail if not exist.
            } else {
                console.log('SUCCESS');
            }
        }

        console.log('✅ Migration process complete.');
    } catch (e) {
        console.error('Script error:', e);
    }
}

applyMigration();
