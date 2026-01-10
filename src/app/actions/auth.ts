'use server'

import { createClient } from '@/lib/auth/supabase-server'
import { initializeChartOfAccounts } from '@/lib/journal'

/**
 * Create a company for a newly registered user
 * This should be called immediately after successful signup
 */
export async function createCompanyForNewUser(
    userId: string,
    companyData: {
        name: string
        vat_number?: string
        country: string
        currency: string
    }
) {
    const supabase = await createClient()

    try {
        // Create company
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert([{
                user_id: userId,
                name: companyData.name,
                vat_number: companyData.vat_number || null,
                country: companyData.country,
                currency: companyData.currency,
                settings: {} // Initialize with empty settings
            }])
            .select()
            .single()

        if (companyError) {
            console.error('Error creating company:', companyError)
            return { success: false, error: companyError.message }
        }

        // Initialize chart of accounts
        try {
            await initializeChartOfAccounts(company.id)
        } catch (chartError) {
            console.error('Error initializing chart of accounts:', chartError)
            // Don't fail the whole operation if chart initialization fails
        }

        // Create default subscription (14-day trial)
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 14)

        const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert([{
                company_id: company.id,
                plan: 'trial',
                status: 'active',
                trial_ends_at: trialEndsAt.toISOString()
            }])

        if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError)
            // Don't fail the whole operation if subscription creation fails
        }

        return { success: true, data: company }
    } catch (error) {
        console.error('Unexpected error in createCompanyForNewUser:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
