import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Logout error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Signed out successfully',
        })
    } catch (error: any) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
