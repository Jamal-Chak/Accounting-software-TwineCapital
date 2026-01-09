import { NextResponse } from 'next/server'
import { analyzeCustomers } from '@/lib/business-analytics'

/**
 * GET /api/analytics/customers
 * Get customer analytics data
 */
export async function GET() {
    try {
        // In production, get companyId from authenticated session
        const companyId = '4cdfc253-4207-4af3-b865-d82c5bcb1167' // Demo company

        const customers = await analyzeCustomers(companyId)

        return NextResponse.json({
            success: true,
            data: customers
        })
    } catch (error) {
        console.error('Customer Analytics API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customer analytics' },
            { status: 500 }
        )
    }
}
