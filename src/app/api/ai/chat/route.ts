import { NextRequest, NextResponse } from 'next/server'
import { chatWithAccountant } from '@/lib/ai-service'
import { calculateHealthScore } from '@/lib/health'
import { getCompanyId } from '@/lib/database'

/**
 * POST /api/ai/chat
 * General chat with AI Accountant
 */
export async function POST(request: NextRequest) {
    try {
        const { question } = await request.json()

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            )
        }

        // Fetch context data
        const companyId = await getCompanyId()
        let healthScore = 0
        let recentRevenue = 0
        const cashBalance = 0

        if (companyId) {
            try {
                // Get health score
                const health = await calculateHealthScore(companyId)
                healthScore = health.totalScore

                // We could extract more granular data from the health object if needed
                recentRevenue = health.pillars.growth.metrics.revenueGrowth // This is growth %, not absolute revenue. 
                // Let's rely on health score for now as a proxy for "knowing" the business.
            } catch (e) {
                console.warn('Failed to fetch context for chat:', e)
            }
        }

        const answer = await chatWithAccountant(question, {
            healthScore,
            companyName: 'TwineCapital User', // We could fetch real name
            // recentRevenue, 
            // cashBalance
        })

        return NextResponse.json({
            success: true,
            data: { answer }
        })
    } catch (error: any) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
