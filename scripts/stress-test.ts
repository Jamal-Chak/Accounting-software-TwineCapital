
import { performance } from 'perf_hooks';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 200;

async function benchmarkEndpoint(endpoint: string, name: string) {
    console.log(`\n🚀 Starting stress test for: ${name} (${endpoint})`);
    console.log(`- Concurrency: ${CONCURRENT_REQUESTS}`);
    console.log(`- Total Requests: ${TOTAL_REQUESTS}`);

    const times: number[] = [];
    const errors: string[] = [];
    let completed = 0;

    const makeRequest = async () => {
        const start = performance.now();
        try {
            const res = await fetch(`${BASE_URL}${endpoint}`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            await res.text(); // consumes body
            const duration = performance.now() - start;
            times.push(duration);
        } catch (e: any) {
            errors.push(e.message);
        } finally {
            completed++;
            if (completed % 50 === 0) {
                process.stdout.write(`.`);
            }
        }
    };

    // Run in batches
    const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS);
    const startTime = performance.now();

    for (let i = 0; i < batches; i++) {
        const promises = [];
        const batchSize = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i * CONCURRENT_REQUESTS);
        for (let j = 0; j < batchSize; j++) {
            promises.push(makeRequest());
        }
        await Promise.all(promises);
    }

    const totalTime = (performance.now() - startTime) / 1000;
    console.log(`\n\n✅ Completed in ${totalTime.toFixed(2)}s`);

    // Stats
    if (times.length === 0) {
        console.log('No successful requests.');
        return;
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const rps = TOTAL_REQUESTS / totalTime;

    console.log(`📊 Results for ${name}:`);
    console.log(`- Successful: ${times.length}/${TOTAL_REQUESTS}`);
    console.log(`- Failed: ${errors.length}`);
    console.log(`- RPS: ${rps.toFixed(2)} req/sec`);
    console.log(`- Latency (Avg): ${avg.toFixed(2)}ms`);
    console.log(`- Latency (Min): ${min.toFixed(2)}ms`);
    console.log(`- Latency (Max): ${max.toFixed(2)}ms`);
    console.log(`- Latency (p95): ${p95.toFixed(2)}ms`);

    if (errors.length > 0) {
        console.log(`⚠️ Sample Errors: ${errors.slice(0, 3).join(', ')}`);
    }
}

async function main() {
    console.log('🔥 TWINE CAPITAL STRESS TEST 🔥');
    console.log('--------------------------------');

    try {
        // 1. Health Check (Lightweight)
        await benchmarkEndpoint('/api/health', 'Health API');

        // 2. Landing Page (SSR/Static)
        await benchmarkEndpoint('/', 'Landing Page');

        // 3. AI Endpoint (Single check only to verify it works under load)
        // We don't stress test this heavily to avoid costs/limits
        // await benchmarkEndpoint('/api/ai/chat', 'AI Chat (Mock)'); 

    } catch (error) {
        console.error('Stress test failed:', error);
    }
}

main();
