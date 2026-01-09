
import { getInvoices, getExpenses, Invoice, Expense, getItems } from './database';

export interface FraudAlert {
    id: string;
    type: 'duplicate' | 'outlier' | 'weekend' | 'round_number' | 'inventory_anomaly';
    severity: 'high' | 'medium' | 'low';
    description: string;
    sourceId: string;
    sourceType: 'invoice' | 'expense' | 'item';
    date: string;
    amount?: number;
}

// Helper: Check if date is weekend
function isWeekend(dateStr: string): boolean {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 || day === 6; // 0=Sun, 6=Sat
}

// 1. Duplicate Detection
function detectDuplicates(invoices: Invoice[], expenses: Expense[]): FraudAlert[] {
    const alerts: FraudAlert[] = [];
    const lookbackMap = new Map<string, string[]>(); // key: "amount|clientId", val: [ids]

    // Check Invoices
    for (const inv of invoices) {
        const key = `${inv.total_amount}|${inv.client_id}`;
        if (lookbackMap.has(key)) {
            // Check dates? simplified: flag all matches
            alerts.push({
                id: `fraud-dup-${inv.id}`,
                type: 'duplicate',
                severity: 'high',
                description: `Potential duplicate invoice for amount ${inv.total_amount}`,
                sourceId: inv.id,
                sourceType: 'invoice',
                date: inv.issue_date,
                amount: inv.total_amount
            });
        } else {
            lookbackMap.set(key, [inv.id]);
        }
    }

    // Check Expenses
    const expenseMap = new Map<string, string[]>();
    for (const exp of expenses) {
        const key = `${exp.total_amount}|${exp.vendor || 'unknown'}`;
        if (expenseMap.has(key)) {
            alerts.push({
                id: `fraud-dup-exp-${exp.id}`,
                type: 'duplicate',
                severity: 'medium', // Medium because recurring expenses are common
                description: `Potential duplicate expense for amount ${exp.total_amount}`,
                sourceId: exp.id,
                sourceType: 'expense',
                date: exp.date,
                amount: exp.total_amount
            });
        } else {
            expenseMap.set(key, [exp.id]);
        }
    }

    return alerts;
}

// 2. Outlier Detection
function detectOutliers(invoices: Invoice[]): FraudAlert[] {
    if (invoices.length < 5) return [];

    const amounts = invoices.map(i => i.total_amount);
    const sum = amounts.reduce((a, b) => a + b, 0);
    const avg = sum / amounts.length;
    const threshold = avg * 3; // 3x average

    const alerts: FraudAlert[] = [];
    for (const inv of invoices) {
        if (inv.total_amount > threshold) {
            alerts.push({
                id: `fraud-outlier-${inv.id}`,
                type: 'outlier',
                severity: 'medium',
                description: `Unusually high invoice amount (${inv.total_amount} vs avg ${avg.toFixed(2)})`,
                sourceId: inv.id,
                sourceType: 'invoice',
                date: inv.issue_date,
                amount: inv.total_amount
            });
        }
    }
    return alerts;
}

// 3. Weekend Activity
function detectWeekendActivity(invoices: Invoice[], expenses: Expense[]): FraudAlert[] {
    const alerts: FraudAlert[] = [];

    for (const inv of invoices) {
        if (isWeekend(inv.issue_date)) {
            alerts.push({
                id: `fraud-weekend-${inv.id}`,
                type: 'weekend',
                severity: 'low',
                description: `Invoice created on a weekend`,
                sourceId: inv.id,
                sourceType: 'invoice',
                date: inv.issue_date,
                amount: inv.total_amount
            });
        }
    }

    for (const exp of expenses) {
        if (isWeekend(exp.date)) {
            alerts.push({
                id: `fraud-weekend-exp-${exp.id}`,
                type: 'weekend',
                severity: 'low',
                description: `Expense passed on a weekend`,
                sourceId: exp.id,
                sourceType: 'expense',
                date: exp.date,
                amount: exp.total_amount
            });
        }
    }

    return alerts;
}

// 4. Round Numbers
function detectRoundNumbers(expenses: Expense[]): FraudAlert[] {
    const alerts: FraudAlert[] = [];
    for (const exp of expenses) {
        if (exp.total_amount > 100 && exp.total_amount % 1 === 0) {
            alerts.push({
                id: `fraud-round-${exp.id}`,
                type: 'round_number',
                severity: 'medium',
                description: `Round number expense detected (${exp.total_amount})`,
                sourceId: exp.id,
                sourceType: 'expense',
                date: exp.date,
                amount: exp.total_amount
            });
        }
    }
    return alerts;
}

// Main Analysis Function
export async function analyzeFraud(): Promise<FraudAlert[]> {
    try {
        const [invoices, expenses] = await Promise.all([
            getInvoices(),
            getExpenses()
        ]);

        const alerts = [
            ...detectDuplicates(invoices, expenses),
            ...detectOutliers(invoices),
            ...detectWeekendActivity(invoices, expenses),
            ...detectRoundNumbers(expenses)
        ];

        // Sort by severity (High > Medium > Low) and then date
        const severityWeight = { high: 3, medium: 2, low: 1 };
        return alerts.sort((a, b) => { // Descending
            const diff = severityWeight[b.severity] - severityWeight[a.severity];
            if (diff !== 0) return diff;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    } catch (e) {
        console.error("Error analyzing fraud:", e);
        return [];
    }
}
