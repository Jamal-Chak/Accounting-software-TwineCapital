
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/reconcile/auto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threshold: 0.85 })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
