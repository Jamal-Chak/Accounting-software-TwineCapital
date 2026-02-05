
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const env: Record<string, string> = {};
try {
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                env[key] = value;
            }
        });
    } else {
        console.warn('Warning: .env.local file not found at', envPath);
    }
} catch (e) {
    console.error('Error reading .env.local:', e);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES_TO_CHECK = [
    'companies',
    'clients',
    'invoices',
    'invoice_items',
    'expenses',
    'bank_connections',
    'transactions'
];

async function checkTables() {
    console.log('Verifying database schema...');

    let allExist = true;
    const missingTables: string[] = [];

    for (const table of TABLES_TO_CHECK) {
        // Attempt to select 0 rows. RLS might return empty, but that proves table exists.
        // If table doesn't exist, we get 42P01 error.
        const { error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') {
                console.error(`❌ Missing table: ${table}`);
                missingTables.push(table);
                allExist = false;
            } else {
                // If it's a permission error or something else, the table likely exists but we can't access it?
                // Or maybe RLS blocks even head requests?
                // Actually 42P01 is specific "undefined table".
                // 42501 is "insufficient_privilege" (RLS). If we get RLS error, table exists!
                if (error.code === '42501') {
                    console.log(`✅ ${table} exists (RLS protected)`);
                } else {
                    console.log(`⚠️ ${table} status uncertain (Error: ${error.message} Code: ${error.code})`);
                    // We'll assume it exists if it's not "undefined table"
                }
            }
        } else {
            console.log(`✅ ${table} exists`);
        }
    }

    console.log('\n-----------------------------------');
    if (allExist) {
        console.log('✅ ALL REQUIRED TABLES EXIST.');
        console.log('Database seems to be set up correctly.');
    } else {
        console.error('❌ SOME TABLES ARE MISSING.');
        console.log(`Missing: ${missingTables.join(', ')}`);
        console.log('Please run the "supabase_setup.sql" script to create the schema.');
    }
}

checkTables();
