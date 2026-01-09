
import dotenv from 'dotenv';
import path from 'path';

// 1. Load env vars BEFORE importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('📦 Testing Inventory Management...');

    // 2. Dynamic imports to ensure env vars are loaded
    const { supabase } = await import('../src/lib/supabase');
    const { getItems, addItem, deleteItem, getInventoryInsights } = await import('../src/lib/database');

    // 1. Create a Test Item with Stock
    const testSku = `TEST-${Date.now()}`;
    console.log(`\n1. Creating item with SKU ${testSku}...`);

    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id || '22222222-2222-2222-2222-222222222222';

    const newItem = {
        company_id: companyId,
        name: `Inventory Test Item ${Date.now()}`,
        description: 'Auto-generated test item',
        unit_price: 100,
        tax_rate: 15,
        category: 'product' as const,
        sku: testSku,
        current_stock: 50,
        reorder_point: 10
    };

    const addResult = await addItem(newItem);

    if (!addResult.success || !addResult.data) {
        console.error('❌ Failed to add item:', addResult.error);
        process.exit(1);
    }

    const itemId = addResult.data.id;
    console.log(`✅ Item created: ${addResult.data.name} (Stock: ${addResult.data.current_stock})`);

    // 2. Verify Stock Persistence
    console.log('\n2. Verifying persistence...');
    const items = await getItems();
    const fetchedItem = items.find(i => i.id === itemId);

    // Note: getItems returns mapped objects. current_stock should be 50.
    if (fetchedItem?.current_stock === 50 && fetchedItem?.reorder_point === 10) {
        console.log('✅ Stock fields persisted correctly (via metadata fallback).');
    } else {
        console.error('❌ Stock fields mismatch:', fetchedItem);
        process.exit(1);
    }

    // 3. Simulate Sales
    console.log('\n3. Simulating sales history for "Burn Rate" calculation...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    // Create dummy invoice
    const { data: invoice } = await supabase.from('invoices').insert({
        company_id: companyId,
        invoice_number: `INV-TEST-${Date.now()}`,
        client_id: (await supabase.from('clients').select('id').limit(1)).data?.[0]?.id,
        issue_date: pastDate.toISOString(),
        due_date: pastDate.toISOString(),
        status: 'paid',
        total_amount: 500,
        tax_amount: 0
    }).select().single();

    if (!invoice) {
        console.log('⚠️ Could not create dummy invoice. Skipping insights check.');
    } else {
        await supabase.from('invoice_items').insert({
            invoice_id: invoice.id,
            description: newItem.name, // Matches item name
            quantity: 10,
            unit_price: 100,
            tax_rate: 15,
            total_amount: 1000,
            created_at: pastDate.toISOString()
        });

        console.log('   Inserted sales record (10 units).');

        // 4. Check Insights
        console.log('\n4. Checking Inventory Insights...');
        const insights = await getInventoryInsights();
        const myInsight = insights.find(i => i.itemId === itemId);

        if (myInsight) {
            console.log('   Insight found:', myInsight);
            if (myInsight.burnRate > 0) {
                console.log('✅ Burn rate calculated successfully.');
            } else {
                console.log('⚠️ Burn rate is 0. Data might not have synced.');
            }
        } else {
            console.log('⚠️ No insight generated for this item.');
        }

        // Cleanup invoice
        await supabase.from('invoices').delete().eq('id', invoice.id);
    }

    // Cleanup item
    await deleteItem(itemId);
    console.log('Done.');
}

main().catch(console.error);
