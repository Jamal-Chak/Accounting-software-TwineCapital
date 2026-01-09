import { NextResponse } from 'next/server'
import { analyzeProducts } from '@/lib/business-analytics'

/**
 * GET /api/analytics/products
 * Get product/service analytics data
 */
export async function GET() {
    try {
        // In production, get companyId from authenticated session
        // For demo, use the consistent helper
        const { getCompanyId } = await import('@/lib/database')
        const companyId = await getCompanyId()

        if (!companyId) {
            return NextResponse.json({ success: true, data: [] })
        }

        const products = await analyzeProducts(companyId)

        return NextResponse.json({
            success: true,
            data: products
        })
    } catch (error) {
        console.error('Product Analytics API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product analytics' },
            { status: 500 }
        )
    }
}
