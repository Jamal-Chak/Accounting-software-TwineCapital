
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

async function inspectInvoice() {
    console.log('Inspecting Invoice Structure...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching invoice:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Invoice Keys:', Object.keys(data[0]));
        } else {
            console.log('No invoices found to inspect.');
        }
    }
}

inspectInvoice();
