
import { NextResponse } from 'next/server';
import { createRecurringProfile } from '@/lib/recurring';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, interval, startDate, items } = body;

        if (!clientId || !interval || !startDate || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await createRecurringProfile(clientId, interval, startDate, items);

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error creating recurring profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
