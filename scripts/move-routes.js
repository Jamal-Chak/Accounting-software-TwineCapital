const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/app');
const targetDir = path.join(srcDir, '(app)');
const exclude = ['(app)', 'api', 'login', 'layout.tsx', 'page.tsx', 'globals.css'];

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const items = fs.readdirSync(srcDir);

items.forEach(item => {
    if (exclude.includes(item)) return;

    const sourcePath = path.join(srcDir, item);
    const destPath = path.join(targetDir, item);

    try {
        fs.renameSync(sourcePath, destPath);
        console.log(`Moved ${item} to (app)/${item}`);
    } catch (err) {
        console.error(`Failed to move ${item}:`, err.message);
    }
});
