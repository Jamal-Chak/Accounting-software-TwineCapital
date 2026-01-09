
export interface FinancialMetrics {
    revenue: number
    expenses: number
    netProfit: number
    margin: number
    prevRevenue?: number // Optional for trend comparison
    prevExpenses?: number
}

export interface CFOInsight {
    summary: string
    keyDrivers: string[]
    recommendations: string[]
    tone: 'positive' | 'neutral' | 'concerned'
}

/**
 * AI CFO Engine
 * Generates narrative insights based on financial data.
 * Currently uses Heuristic Expert System logic.
 * Ready to be replaced by LLM (OpenAI/Gemini) call.
 */
export async function generateCFOReport(metrics: FinancialMetrics): Promise<CFOInsight> {
    // Simulate AI thinking time
    // await new Promise(resolve => setTimeout(resolve, 500)); 

    const { revenue, expenses, netProfit, margin } = metrics;
    const insights: CFOInsight = {
        summary: '',
        keyDrivers: [],
        recommendations: [],
        tone: 'neutral'
    };

    // 1. Analyze Core Performance
    if (netProfit > 0) {
        if (margin > 20) {
            insights.summary = "Excellent period. The group is operating at high efficiency with strong profit retention.";
            insights.tone = 'positive';
        } else {
            insights.summary = "Profitable, but margins are tight. We are seeing volume but operating costs are consuming a significant portion of revenue.";
            insights.tone = 'neutral';
        }
    } else {
        insights.summary = "The group is currently running at a loss. Immediate attention is required to control operating heavy expenses.";
        insights.tone = 'concerned';
    }

    // 2. Identify Drivers (Heuristic)
    if (revenue > 1000000) {
        insights.keyDrivers.push("High revenue volume suggests strong market fit.");
    }

    // Check Expense Ratio
    const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
    if (expenseRatio > 80) {
        insights.keyDrivers.push(`Operating expenses are high (${expenseRatio.toFixed(0)}% of revenue), limiting profitability.`);
        insights.recommendations.push("Conduct a vendor audit to reduce procurement costs.");
    } else if (expenseRatio < 50) {
        insights.keyDrivers.push("Lean cost structure is driving superior margins.");
    }

    // Check Margin health
    if (margin < 10 && margin > 0) {
        insights.recommendations.push("Review pricing strategy. Margins are below industry standard (15%).");
    }

    // 3. Add Strategic Advice
    if (netProfit > 50000) {
        insights.recommendations.push("Consider reinvesting surplus cash into inventory expansion or marketing.");
    }

    // 4. Fallback if little data
    if (revenue === 0) {
        insights.summary = "No significant revenue recorded for this period.";
        insights.keyDrivers = ["Lack of sales activity."];
        insights.recommendations = ["Focus on sales activation and lead generation."];
        insights.tone = 'neutral';
    }

    return insights;
}
