import { NextRequest, NextResponse } from 'next/server'
import { calculateHealthScore } from '@/lib/health'
import { getCompanyId } from '@/lib/database'

/**
 * GET /api/analytics/health
 * Get business health score and metrics
 */
export async function GET(request: NextRequest) {
    try {
        const companyId = await getCompanyId()
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            )
        }

        const healthData = await calculateHealthScore(companyId)

        return NextResponse.json({
            success: true,
            data: healthData
        })
    } catch (error) {
        console.error('Health Score API error:', error)
        return NextResponse.json(
            { error: 'Failed to calculate health score' },
            { status: 500 }
        )
    }
}
