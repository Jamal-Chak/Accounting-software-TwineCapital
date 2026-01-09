
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function debugSchema() {
    console.log('Debugging Schema via information_schema...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sql = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices'
        AND column_name IN ('currency', 'exchange_rate');
    `;

    const { data, error } = await supabase.rpc('execute_raw_sql', { sql });

    if (error) {
        console.error('Error querying information_schema:', error);
    } else {
        console.log('Query result:', data);
        if (Array.isArray(data) && data.length > 0) {
            console.log('✅ Columns found in information_schema.');
        } else {
            console.log('❌ Columns NOT found in information_schema.');
        }
    }

    // Attempt to reload schema if possible (usually requires superuser or specific setup)
    // trying standard method
    console.log('Attempting to reload schema cache...');
    const { error: reloadError } = await supabase.rpc('execute_raw_sql', {
        sql: "NOTIFY pgrst, 'reload schema';"
    });
    if (reloadError) console.log('Reload notify failed (expected if not superuser):', reloadError);
    else console.log('Reload notify sent.');
}

debugSchema();
