
import { MARKETPLACE_APPS } from '../src/lib/marketplace-data';
import fs from 'fs';
import path from 'path';

// Mock Lucide icons for node env
// We just need to ensure the file imports correctly
console.log('Verifying Marketplace Data...');

if (MARKETPLACE_APPS.length > 0) {
    console.log(`✅ Loaded ${MARKETPLACE_APPS.length} apps.`);

    // Check key apps exist
    const required = ['ai_accountant', 'smart_invoicing', 'multi_currency'];
    const found = required.every(id => MARKETPLACE_APPS.find(a => a.id === id));

    if (found) {
        console.log('✅ Required core apps found.');
    } else {
        console.error('❌ Missing core apps.');
    }

    // Check links
    const brokenLinks = MARKETPLACE_APPS.filter(a => a.link && !a.link.startsWith('/'));
    if (brokenLinks.length === 0) {
        console.log('✅ All links are valid internal paths.');
    } else {
        console.error('❌ Invalid links found:', brokenLinks.map(a => a.title));
    }

} else {
    console.error('❌ No apps loaded.');
}

// Verify page file existence
const pagePath = path.join(__dirname, '../src/app/marketplace/page.tsx');
if (fs.existsSync(pagePath)) {
    console.log('✅ Marketplace page component exists.');
} else {
    console.error('❌ Marketplace page component missing.');
}
