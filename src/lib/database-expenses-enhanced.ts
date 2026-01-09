// Enhanced Database Functions - Expenses Fix
// This file contains improved error handling for the expenses functionality

import { supabase } from './supabase'

export interface Expense {
  id: string
  company_id: string
  description: string
  amount: number
  category: string
  date: string
  vendor: string | null
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: 'pending' | 'approved' | 'reimbursed'
  created_at: string
  updated_at: string
}

// Enhanced getExpenses function with detailed error logging
export async function getExpenses(): Promise<Expense[]> {
  try {
    console.log('🔍 Starting expenses fetch...')
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      })
      
      // If the error is because the table doesn't exist, provide helpful info
      if (error.code === 'PGRST116' || error.message.includes('relation "public.expenses" does not exist')) {
        console.error('💡 The expenses table does not exist. Please run the SQL schema from supabase_setup.sql')
      }
      
      return []
    }

    console.log('✅ Expenses fetched successfully:', data?.length || 0, 'records')
    if (data && data.length > 0) {
      console.log('📊 Sample expense:', data[0].description)
    }
    
    return data || []
  } catch (error) {
    console.error('💥 Unexpected error in getExpenses:', {
      error: error,
      type: typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return []
  }
}

// Create sample expenses for testing
export async function createSampleExpenses(companyId: string = '00000000-0000-0000-0000-000000000000') {
  try {
    console.log('📝 Creating sample expenses for testing...')
    
    const sampleExpenses = [
      {
        company_id: companyId,
        description: 'Office Supplies - Stationery',
        amount: 250.00,
        category: 'Office Supplies',
        date: '2025-11-15',
        vendor: 'Office Depot',
        tax_rate: 15.00,
        tax_amount: 37.50,
        total_amount: 287.50,
        status: 'approved'
      },
      {
        company_id: companyId,
        description: 'Software Subscription - Design Tools',
        amount: 750.00,
        category: 'Software',
        date: '2025-11-10',
        vendor: 'Adobe Creative Cloud',
        tax_rate: 15.00,
        tax_amount: 112.50,
        total_amount: 862.50,
        status: 'pending'
      },
      {
        company_id: companyId,
        description: 'Business Lunch - Client Meeting',
        amount: 180.00,
        category: 'Meals & Entertainment',
        date: '2025-11-08',
        vendor: 'The Capital Hotel',
        tax_rate: 15.00,
        tax_amount: 27.00,
        total_amount: 207.00,
        status: 'reimbursed'
      }
    ]

    const { data, error } = await supabase
      .from('expenses')
      .insert(sampleExpenses)
      .select()

    if (error) {
      console.error('❌ Error creating sample expenses:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return null
    }

    console.log('✅ Sample expenses created successfully:', data?.length || 0, 'records')
    return data
  } catch (error) {
    console.error('💥 Unexpected error in createSampleExpenses:', error)
    return null
  }
}

// Quick test function to verify database connection
export async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...')
    
    // Try to query the expenses table
    const { data, error } = await supabase
      .from('expenses')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Database connection test failed:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return false
    }

    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('💥 Database connection test error:', error)
    return false
  }
}
