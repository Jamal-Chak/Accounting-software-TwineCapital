import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Parse natural language text into invoice data
 */
export async function parseInvoiceFromText(text: string): Promise<{
    customer: string
    amount: number
    description: string
    items: Array<{ description: string; quantity: number; unit_price: number }>
    due_date?: string
    notes?: string
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `You are an AI invoice parser. Extract invoice details from this natural language text:

"${text}"

Return a JSON object with this EXACT structure (no additional text, just valid JSON):
{
  "customer": "customer name or company",
  "amount": total_amount_as_number,
  "description": "brief description of service/product",
  "items": [
    {
      "description": "item description",
      "quantity": number,
      "unit_price": number
    }
  ],
  "due_date": "YYYY-MM-DD or null",
  "notes": "any additional notes or null"
}

Rules:
- If no customer is mentioned, use "Unknown Customer"
- Calculate total amount from items or use mentioned amount
- If no items specified, create one item with the full amount
- Dates should be in YYYY-MM-DD format
- Return ONLY the JSON object, no markdown formatting`

    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // Clean the response (remove markdown code blocks if present)
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        const parsed = JSON.parse(cleanResponse)
        return parsed
    } catch (error) {
        console.error('Error parsing invoice:', error)
        throw new Error('Failed to parse invoice from natural language')
    }
}

/**
 * Suggest discounts based on customer history and invoice context
 */
export async function suggestDiscount(customerId: string, invoiceAmount: number, context: {
    customerHistory?: { totalInvoices: number; avgAmount: number; onTimePaymentRate: number }
    isRepeatCustomer?: boolean
    invoiceDate?: string
}): Promise<{
    shouldOffer: boolean
    discountPercent: number
    reasoning: string
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `You are a business advisor. Should I offer a discount on this invoice?

Context:
- Invoice Amount: R${invoiceAmount.toLocaleString()}
- Customer Total Invoices: ${context.customerHistory?.totalInvoices || 0}
- Average Invoice Amount: R${context.customerHistory?.avgAmount.toLocaleString() || 0}
- On-Time Payment Rate: ${context.customerHistory?.onTimePaymentRate || 0}%
- Is Repeat Customer: ${context.isRepeatCustomer ? 'Yes' : 'No'}

Analyze this and return a JSON object with this EXACT structure:
{
  "shouldOffer": true or false,
  "discountPercent": number (0-20),
  "reasoning": "brief explanation"
}

Guidelines:
- Loyal customers (5+ invoices, 90%+ on-time) may deserve 5-10% discount
- Large orders (2x average) could get 3-5% volume discount
- First-time customers usually don't get discounts
- Small invoices (<R1000) rarely need discounts
- Consider building long-term relationships

Return ONLY the JSON object.`

    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(cleanResponse)
        return parsed
    } catch (error) {
        console.error('Error suggesting discount:', error)
        return { shouldOffer: false, discountPercent: 0, reasoning: 'Unable to analyze' }
    }
}

/**
 * Predict late payment risk for a customer
 */
export async function predictLatePayment(customerId: string, context: {
    paymentHistory: Array<{ dueDate: string; paidDate: string | null; amount: number }>
    currentInvoiceAmount: number
    dueDate: string
}): Promise<{
    riskLevel: 'low' | 'medium' | 'high'
    probability: number
    factors: string[]
    recommendations: string[]
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    // Calculate payment stats
    const totalInvoices = context.paymentHistory.length
    const latePayments = context.paymentHistory.filter(p => {
        if (!p.paidDate) return true
        return new Date(p.paidDate) > new Date(p.dueDate)
    }).length
    const avgDaysLate = context.paymentHistory.reduce((sum, p) => {
        if (!p.paidDate) return sum + 30
        const late = Math.max(0, Math.floor((new Date(p.paidDate).getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        return sum + late
    }, 0) / totalInvoices

    const prompt = `Predict the risk of late payment for this invoice:

Payment History:
- Total Invoices: ${totalInvoices}
- Late Payments: ${latePayments}
- Average Days Late: ${avgDaysLate.toFixed(1)}
- Current Invoice: R${context.currentInvoiceAmount.toLocaleString()}

Return JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "probability": number (0-100),
  "factors": ["factor 1", "factor 2"],
  "recommendations": ["action 1", "action 2"]
}

Risk Guidelines:
- Low: <20% late rate, <5 days average late
- Medium: 20-50% late rate, 5-15 days average late  
- High: >50% late rate, >15 days average late

Provide 2-3 factors and 2-3 actionable recommendations.`

    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(cleanResponse)
        return parsed
    } catch (error) {
        console.error('Error predicting late payment:', error)
        return {
            riskLevel: 'medium',
            probability: 50,
            factors: ['Insufficient data'],
            recommendations: ['Monitor payment closely']
        }
    }
}

/**
 * Generate personalized follow-up email for overdue invoice
 */
export async function generateFollowUpEmail(context: {
    customerName: string
    invoiceNumber: string
    amount: number
    daysOverdue: number
    previousFollowups: number
}): Promise<{
    subject: string
    body: string
    tone: 'friendly' | 'firm' | 'urgent'
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `Generate a professional follow-up email for an overdue invoice:

Context:
- Customer: ${context.customerName}
- Invoice: #${context.invoiceNumber}
- Amount: R${context.amount.toLocaleString()}
- Days Overdue: ${context.daysOverdue}
- Previous Follow-ups: ${context.previousFollowups}

Return JSON:
{
  "subject": "email subject line",
  "body": "email body text",
  "tone": "friendly" | "firm" | "urgent"
}

Email Guidelines:
- First follow-up (0 previous): Friendly reminder, assume oversight
- Second follow-up (1 previous): Firmer, mention payment terms
- Third+ follow-up (2+ previous): Urgent, mention consequences

Keep it professional, concise, and South African business context.`

    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(cleanResponse)
        return parsed
    } catch (error) {
        console.error('Error generating follow-up:', error)
        return {
            subject: `Payment Reminder: Invoice #${context.invoiceNumber}`,
            body: `Dear ${context.customerName},\n\nThis is a friendly reminder that Invoice #${context.invoiceNumber} for R${context.amount.toLocaleString()} is now ${context.daysOverdue} days overdue.\n\nPlease arrange payment at your earliest convenience.\n\nBest regards`,
            tone: 'friendly'
        }
    }
}

/**
 * Invoice chat assistant - answers questions about invoices
 */
export async function chatAboutInvoice(question: string, invoiceContext: {
    invoiceNumber: string
    customer: string
    amount: number
    status: string
    items: string
    dueDate: string
    createdDate: string
}): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `You are a helpful invoice assistant. Answer this question about an invoice:

Question: "${question}"

Invoice Details:
- Invoice Number: ${invoiceContext.invoiceNumber}
- Customer: ${invoiceContext.customer}
- Amount: R${invoiceContext.amount.toLocaleString()}
- Status: ${invoiceContext.status}
- Items: ${invoiceContext.items}
- Due Date: ${invoiceContext.dueDate}
- Created: ${invoiceContext.createdDate}

Provide a helpful, concise answer. If asked about actions (send, void, edit), suggest the appropriate action.
Keep responses under 100 words.`

    try {
        const result = await model.generateContent(prompt)
        return result.response.text()
    } catch (error) {
        console.error('Error in chat:', error)
        return 'I apologize, but I encountered an error. Please try rephrasing your question.'
    }
}
/**
 * General AI Accountant Chat
 */
export async function chatWithAccountant(question: string, context: {
    healthScore?: number
    companyName?: string
    recentRevenue?: number
    cashBalance?: number
}): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `You are a helpful, professional, and friendly AI Accountant for a South African business named "${context.companyName || 'the company'}".
    
Context:
- Business Health Score: ${context.healthScore ? context.healthScore + '/100' : 'Unknown'}
- Recent Revenue: ${context.recentRevenue ? 'R' + context.recentRevenue.toLocaleString() : 'Unknown'}
- Cash Balance: ${context.cashBalance ? 'R' + context.cashBalance.toLocaleString() : 'Unknown'}

User Question: "${question}"

Instructions:
- Provide helpful accounting, tax (SARS context), or business advice.
- If asked about specific data you don't have, explain that you only have access to high-level summaries right now.
- Be concise (under 3 paragraphs).
- Use a professional yet approachable tone.
- If the health score is low, offer encouraging advice.
`

    try {
        const result = await model.generateContent(prompt)
        return result.response.text()
    } catch (error) {
        console.error('Error in general chat:', error)
        return 'I am having trouble connecting to my accounting knowledge base right now. Please try again in a moment.'
    }
}

/**
 * Categorize a bank transaction using AI
 */
export async function categorizeTransaction(description: string, amount: number, context: { industry?: string }): Promise<{
    category: string
    confidence: number
    reasoning: string
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

    const prompt = `You are an expert AI accountant. Categorize this bank transaction:

Transaction: "${description}"
Amount: ${amount}
Industry: ${context.industry || 'General Business'}

Available Categories:
- Advertising & Marketing
- Bank Fees & Charges
- Consulting & Accounting
- Entertainment
- Equipment
- Insurance
- Legal Expenses
- Meals & Entertainment
- Office Supplies
- Payroll & Wages
- Rent & Lease
- Repairs & Maintenance
- Software & SaaS
- Subscriptions
- Taxes & Licenses
- Telephone & Internet
- Travel
- Utilities
- Vehicles & Fuel

Return JSON:
{
  "category": "Exact Category Name from list above",
  "confidence": number (0.0 - 1.0),
  "reasoning": "brief explanation"
}

Rules:
- If unsure, use "Uncategorized Expenses"
- Return ONLY the JSON object.`

    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(cleanResponse)
        return parsed
    } catch (error) {
        console.error('Error categorizing transaction:', error)
        return {
            category: 'Uncategorized Expenses',
            confidence: 0,
            reasoning: 'AI categorization failed'
        }
    }
}
