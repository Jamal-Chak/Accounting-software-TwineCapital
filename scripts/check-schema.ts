
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

async function checkSchema() {
    console.log('Checking Schema...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to just select the new columns from invoices to see if it errors
    const { data, error } = await supabase
        .from('invoices')
        .select('currency, exchange_rate')
        .limit(1);

    if (error) {
        console.error('Schema check failed:', error);
    } else {
        console.log('✅ Columns currency and exchange_rate exist on invoices.');
    }
}

checkSchema();
