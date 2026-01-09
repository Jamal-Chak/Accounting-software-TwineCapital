// Quick fix for expenses error handling
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src/lib/database.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// Replace the old error handling with the new one
content = content.replace(
  /console\.error\('Error fetching expenses:', error\)/g,
  `console.error('Error fetching expenses:', error.message || JSON.stringify(error) || error)`
);

fs.writeFileSync(dbPath, content);
console.log('✅ Fixed expenses error handling in database.ts');
