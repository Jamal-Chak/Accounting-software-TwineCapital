
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Environment setup
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function checkTable() {
    console.log('Checking for recurring_invoices table...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('recurring_invoices')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error assessing table:', error.message);
        if (error.code === '42P01') { // undefined_table
            console.log('👉 Table does not exist.');
        }
    } else {
        console.log('✅ Table exists!');
    }
}

checkTable();
