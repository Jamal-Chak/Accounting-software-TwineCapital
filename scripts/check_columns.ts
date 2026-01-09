
import { supabase } from '../src/lib/supabase';

async function main() {
    console.log('Checking items table columns...');
    // Try to insert a dummy item with the new column, if it fails, column is missing.
    // Or just select and see if error.

    // We can't query information_schema easily via supabase-js without RPC.
    // So we'll try a dry run insert.

    const { error } = await supabase.from('items').select('current_stock').limit(1);

    if (error) {
        console.error('❌ Error selecting current_stock:', error.message);
        console.log('Migration likely failed.');
    } else {
        console.log('✅ Column current_stock exists.');
    }
}

main();
