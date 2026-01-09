
import { NextResponse } from 'next/server';
import { processDueProfiles } from '@/lib/recurring';

export async function POST() {
    try {
        const result = await processDueProfiles();
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error processing recurring invoices:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
