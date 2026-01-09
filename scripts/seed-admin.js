// Simple admin user seeding for quick setup
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
    console.log('\n💡 No worries! Use dev bypass instead:');
    console.log('   http://localhost:3000/dev-access\n');
    process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
    console.log('🌱 Seeding admin user...\n');

    const adminEmail = 'admin@twinecapital.com';
    const adminPassword = 'admin123'; // Change this!

    try {
        // Check if user exists
        const { data: existingUser } = await supabase.auth.admin.listUsers();

        if (existingUser?.users?.find(u => u.email === adminEmail)) {
            console.log('✅ Admin user already exists');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}\n`);
            return;
        }

        // Create admin user
        const { data, error } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
                data: {
                    full_name: 'Admin User',
                },
            },
        });

        if (error) {
            throw error;
        }

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('\n⚠️  Remember to change this password after first login!\n');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        console.log('\n💡 Alternative: Use dev bypass');
        console.log('   http://localhost:3000/dev-access\n');
    }
}

console.log('🚀 TwineCapital - Quick Setup\n');
seedAdmin();
