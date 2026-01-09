
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) { }

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function clean() {
    console.log('🧹 Force cleaning...');

    // We send one big block. Postgres usually handles this if implicit transaction.
    const sql = `
        DELETE FROM clients WHERE name LIKE '%Test Client%';
        DELETE FROM clients WHERE name LIKE '%Fraudster Ltd%';
        DELETE FROM clients WHERE name LIKE '%High Value Corp%';
        DELETE FROM clients WHERE name LIKE '%Recurring Client%';
        DELETE FROM expenses WHERE vendor LIKE '%Fuel Station A%';
        DELETE FROM expenses WHERE vendor LIKE '%Shell%';
        DELETE FROM expenses WHERE vendor LIKE '%Test Vendor%';
        DELETE FROM items WHERE name LIKE '%Inventory Item%';
    `;

    const { error } = await supabase.rpc('execute_raw_sql', { sql });

    if (error) {
        console.error('❌ Cleanup failed:', error);
    } else {
        console.log('✅ Cleanup successful!');
    }
}

clean();
