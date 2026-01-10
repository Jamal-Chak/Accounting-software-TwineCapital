'use server'

import { getAuthenticatedClient } from '@/lib/auth/database-helpers'
import type { Invoice, Client, Expense, BankConnection, Transaction } from '@/lib/database'

/**
 * Get all invoices for the current user's company
 */
export async function getInvoices(): Promise<Invoice[]> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      client:clients(*)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching invoices:', error)
        return []
    }

    return data || []
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(id: string): Promise<Invoice | null> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return null

    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      client:clients(*),
      items:invoice_items(*)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching invoice:', error)
        return null
    }

    return data
}

/**
 * Get all clients for the current user's company
 */
export async function getClients(): Promise<Client[]> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }

    return data || []
}

/**
 * Get a single client by ID
 */
export async function getClient(id: string): Promise<Client | null> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return null

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching client:', error)
        return null
    }

    return data
}

/**
 * Get all expenses for the current user's company
 */
export async function getExpenses(): Promise<Expense[]> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching expenses:', error)
        return []
    }

    return data || []
}

/**
 * Get all bank connections for the current user's company
 */
export async function getBankConnections(): Promise<BankConnection[]> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    const { data, error } = await supabase
        .from('bank_connections')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching bank connections:', error)
        return []
    }

    return data || []
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    return data || []
}

/**
 * Get the current user's company
 */
export async function getCompany() {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return null

    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching company:', error)
        return null
    }

    return data
}

/**
 * Get tax rates for the current user's company
 */
export async function getTaxRates() {
    const { supabase, user } = await getAuthenticatedClient()
    if (!supabase || !user) return []

    // Get company first
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!company) return []

    const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching tax rates:', error)
        return []
    }

    return data || []
}
