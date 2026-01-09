'use server'

import { addSampleTransactions } from '@/lib/database'
import { revalidatePath } from 'next/cache'

export async function generateSampleDataAction() {
    try {
        const result = await addSampleTransactions()

        if (!result) {
            return { success: false, error: 'Failed to generate sample data' }
        }

        revalidatePath('/reports')
        return { success: true }
    } catch (error) {
        console.error('Error in generateSampleDataAction:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
