const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/app');
const targetDir = path.join(srcDir, '(app)');
// Explicit list of folders that failed to move
const toMove = [
    'analytics',
    'banking',
    'dashboard',
    'documents',
    'invoices',
    'purchases',
    'sales',
    'time-tracking'
];

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

toMove.forEach(item => {
    const sourcePath = path.join(srcDir, item);
    const destPath = path.join(targetDir, item);

    if (fs.existsSync(sourcePath)) {
        try {
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${item} to (app)/${item}`);
        } catch (err) {
            console.error(`Failed to move ${item}:`, err.message);
        }
    } else {
        console.log(`Skipping ${item}, not found in source.`);
    }
});
