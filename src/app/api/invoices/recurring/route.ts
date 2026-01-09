
import { NextResponse } from 'next/server';
import { getRecurringProfiles } from '@/lib/recurring';

export async function GET() {
    try {
        const data = await getRecurringProfiles();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching recurring profiles:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
