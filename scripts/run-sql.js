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
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSql() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide the path to the SQL file as an argument.');
        return;
    }

    const relativePath = args[0];
    const sqlPath = path.isAbsolute(relativePath) ? relativePath : path.join(__dirname, '..', relativePath);

    console.log(`Reading SQL file from: ${sqlPath}`);

    try {
        if (!fs.existsSync(sqlPath)) {
            console.error(`File not found: ${sqlPath}`);
            return;
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Remove comments and split by semicolon
        const cleanerSql = sqlContent.replace(/--.*$/gm, '');
        const statements = cleanerSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const [index, stmt] of statements.entries()) {
            console.log(`Executing statement ${index + 1}...`);
            const { error } = await supabase.rpc('execute_raw_sql', { sql: stmt });

            if (error) {
                if (error.code === '42P07' || error.message?.includes('already exists')) {
                    console.log(`Statement ${index + 1} noted: Object already exists (ignoring).`);
                } else {
                    console.error(`Error executing statement ${index + 1}:`, error);
                    console.error('Statement:', stmt);
                    return;
                }
            } else {
                console.log(`Statement ${index + 1} succeeded.`);
            }
        }

        console.log('All statements executed successfully.');
    } catch (e) {
        console.error('Exception:', e);
    }
}

runSql();
