import { NextResponse } from 'next/server'
import { analyzeSuppliers } from '@/lib/business-analytics'

/**
 * GET /api/analytics/suppliers
 * Get supplier analytics data
 */
export async function GET() {
    try {
        // In production, get companyId from authenticated session
        const companyId = '4cdfc253-4207-4af3-b865-d82c5bcb1167' // Demo company

        const suppliers = await analyzeSuppliers(companyId)

        return NextResponse.json({
            success: true,
            data: suppliers
        })
    } catch (error) {
        console.error('Supplier Analytics API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch supplier analytics' },
            { status: 500 }
        )
    }
}
