import { NextRequest, NextResponse } from 'next/server'
import { generateCashflowProjection } from '@/lib/analytics'
import { getCompanyId } from '@/lib/database'

/**
 * GET /api/analytics/cashflow
 * Get 13-week cashflow projection
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

        const projections = await generateCashflowProjection(companyId)

        return NextResponse.json({
            success: true,
            data: projections
        })
    } catch (error) {
        console.error('Cashflow API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate cashflow projection' },
            { status: 500 }
        )
    }
}
