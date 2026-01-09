const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e);
    process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('🔧 Setting up authentication database...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuth() {
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', 'setup_auth.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Running migration: setup_auth.sql\n');

        // Split into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => {
                // Filter out comments and empty statements
                return s.length > 0 &&
                    !s.startsWith('--') &&
                    !s.match(/^--/);
            });

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const [index, stmt] of statements.entries()) {
            // Skip pure comment blocks
            if (stmt.includes('============') || stmt.startsWith('COMPLETE!')) {
                continue;
            }

            const stmtPreview = stmt.substring(0, 60).replace(/\s+/g, ' ');
            process.stdout.write(`[${index + 1}/${statements.length}] ${stmtPreview}...`);

            try {
                const { data, error } = await supabase.rpc('exec_sql', { sql_query: stmt });

                if (error) {
                    // Check if it's a "already exists" error
                    if (error.code === '42P07' ||
                        error.message?.includes('already exists') ||
                        error.message?.includes('duplicate')) {
                        console.log(' ⏭️  (already exists)');
                        skipCount++;
                    } else if (error.code === '42883' && error.message?.includes('exec_sql')) {
                        // RPC function doesn't exist, try direct query
                        console.log('\n⚠️  RPC not available, trying alternative method...\n');
                        throw new Error('NEED_MANUAL_SETUP');
                    } else {
                        console.log(` ❌`);
                        console.error(`   Error: ${error.message}`);
                        errorCount++;
                    }
                } else {
                    console.log(' ✅');
                    successCount++;
                }
            } catch (err) {
                if (err.message === 'NEED_MANUAL_SETUP') {
                    throw err;
                }
                console.log(` ❌`);
                console.error(`   Exception: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skipCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

        if (errorCount > 0) {
            console.log('\n⚠️  Some statements failed. Check the errors above.');
        } else {
            console.log('\n✨ Database setup complete!');
        }

    } catch (error) {
        if (error.message === 'NEED_MANUAL_SETUP') {
            console.log('\n📋 Manual Setup Required\n');
            console.log('The automatic migration requires a custom RPC function.');
            console.log('Please run the SQL migration manually:\n');
            console.log('1. Go to Supabase Dashboard → SQL Editor');
            console.log('2. Open: migrations/setup_auth.sql');
            console.log('3. Copy and paste the contents');
            console.log('4. Click "Run"\n');
            console.log('This is normal and only needs to be done once.');
            process.exit(0);
        } else {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        }
    }
}

setupAuth();
