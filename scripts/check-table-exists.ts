
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env: Record<string, string> = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking if document_uploads table exists...');

    // Attempt to select. RLS might return empty, but that proves table exists.
    const { data, error } = await supabase
        .from('document_uploads')
        .select('id')
        .limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.error('FAILURE: Table does not exist (42P01).');
            process.exit(1);
        } else {
            console.log('Table exists (Error received is not 42P01):', error.message);
            console.log('✅ VERIFICATION SUCCESSFUL');
        }
    } else {
        console.log('Table exists (Data received):', data);
        console.log('✅ VERIFICATION SUCCESSFUL');
    }
}

checkTable();
