import { supabase } from './supabase'

// ===== BANKING INTERFACES =====
export interface User {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  inventory?: {
    valuationMethod: 'fifo' | 'weighted-avg'
    trackCost: boolean
    allowNegative: boolean
  }
  notifications?: {
    failedSync?: boolean
    vatThreshold?: boolean
    lowRunway?: boolean
    periodLock?: boolean
    intelligence?: boolean
    emailDigest?: boolean
  }
  intelligence?: {
    forecastHorizon: 30 | 60 | 90
    confidenceLevel: number
    benchmarkType: 'industry' | 'historical' | 'custom'
    forecastEnabled: boolean
    marginAlerts?: boolean
    cashRunwayAlerts?: boolean
    anomalyDetection?: boolean
    velocityTracking?: boolean
  }
}

export interface Company {
  id: string
  user_id: string
  name: string
  vat_number: string | null
  country: string
  currency: string
  settings: CompanySettings | null // JSONB settings
  created_at: string
  updated_at: string
}

export interface BankConnection {
  id: string
  company_id: string
  bank_name: 'fnb' | 'standard-bank' | 'absa' | 'nedbank' | 'capitec'
  account_name: string
  account_number: string | null
  access_token: string | null
  is_active: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  bank_connection_id: string
  external_id: string
  date: string
  amount: number
  description: string
  merchant: string | null
  category: string | null
  is_reconciled: boolean
  created_at: string
}

// ===== INVOICE INTERFACES =====
export interface Client {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  tax_number: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  company_id: string
  invoice_number: string
  client_id: string
  issue_date: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total_amount: number
  tax_amount: number
  currency?: string
  exchange_rate?: number
  notes: string | null
  created_at: string
  updated_at: string
  client?: Client
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total_amount: number
  created_at: string
}

// ===== EXPENSE INTERFACES =====
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
  currency?: string
  exchange_rate?: number
  status: 'pending' | 'approved' | 'reimbursed'
  created_at: string
  updated_at: string
}

// ===== BANKING FUNCTIONS =====

// Get all bank connections for the current user
export async function getBankConnections(): Promise<BankConnection[]> {
  try {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bank connections:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBankConnections:', error)
    return []
  }
}

// Get recent transactions
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  try {
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
  } catch (error) {
    console.error('Error in getRecentTransactions:', error)
    return []
  }
}

// Add a new bank connection
export async function addBankConnection(connection: Omit<BankConnection, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('bank_connections')
      .insert([connection])
      .select()

    if (error) {
      console.error('Error adding bank connection:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error in addBankConnection:', error)
    return null
  }
}

// Helper function to add transactions to a connection
async function addTransactionsToConnection(connectionId: string) {
  const sampleTransactions = [
    {
      bank_connection_id: connectionId,
      external_id: 'txn-' + Date.now() + '-001',
      date: new Date().toISOString().split('T')[0],
      amount: -345.67,
      description: 'Pick n Pay - Groceries',
      merchant: 'Pick n Pay',
      category: 'groceries',
      is_reconciled: true
    },
    {
      bank_connection_id: connectionId,
      external_id: 'txn-' + Date.now() + '-002',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      amount: 5000.00,
      description: 'Client Payment - ABC Corp',
      merchant: 'ABC Corp',
      category: 'income',
      is_reconciled: false
    },
    {
      bank_connection_id: connectionId,
      external_id: 'txn-' + Date.now() + '-003',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      amount: -899.00,
      description: 'Internet Bill - Telkom',
      merchant: 'Telkom',
      category: 'utilities',
      is_reconciled: true
    }
  ]

  const { data, error } = await supabase
    .from('transactions')
    .insert(sampleTransactions)
    .select()

  if (error) {
    console.error('Error adding sample transactions:', error)
    return null
  }

  console.log('Sample transactions added successfully!')
  return data
}

// Helper to get the current user's company ID
export async function getCompanyId() {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('No authenticated user:', authError)
      return null
    }

    // Try to get the user's company
    // RLS will automatically filter to only return companies where auth.uid() = user_id
    const { data: existingCompanies, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    if (companyError) {
      console.error('Error fetching user companies:', companyError)
      return null
    }

    if (existingCompanies && existingCompanies.length > 0) {
      return existingCompanies[0].id
    }

    // If no company exists, CREATE one automatically
    console.log('No company found, creating default company...')

    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert([{
        user_id: user.id,
        name: user.user_metadata?.company_name || 'My Company',
        country: 'South Africa',
        currency: 'ZAR'
      }])
      .select()
      .single()

    if (createError) {
      console.error('Error creating default company:', createError)
      return null
    }

    return newCompany.id
  } catch (error) {
    console.error('Error getting company:', error)
    return null
  }
}

/**
 * Get all companies for the current user
 */
export async function getUserCompanies(): Promise<Company[]> {
  try {
    // In a real app, filtering by auth.uid()
    // For demo, we return all companies or just the ones we created
    // We'll fetch all companies for now since likely they belong to the demo user or we want to simulate a group
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching companies:', error)
      return []
    }

    return companies || []
  } catch (error) {
    console.error('Error in getUserCompanies:', error)
    return []
  }
}

export async function addSampleTransactions() {
  try {
    console.log('Starting to add sample data...')

    // First, get or create a company for the CURRENT USER
    const companyId = await getCompanyId()

    if (!companyId) {
      console.error('Could not get or create company for sample data')
      return null
    }

    console.log('Using company:', companyId)

    // Get or create bank connection
    let connectionId: string

    const { data: existingConnections } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('company_id', companyId)
      .limit(1)

    if (existingConnections && existingConnections.length > 0) {
      connectionId = existingConnections[0].id
      console.log('Using existing bank connection:', connectionId)
    } else {
      // Create a new bank connection
      const demoConnection = {
        company_id: companyId,
        bank_name: 'fnb' as const,
        account_name: 'Business Cheque Account',
        account_number: '6283998475001',
        access_token: null,
        is_active: true,
        last_synced_at: new Date().toISOString()
      }

      const { data: connectionData, error: connectionError } = await supabase
        .from('bank_connections')
        .insert([demoConnection])
        .select()

      if (connectionError) {
        console.error('Error creating demo bank connection:', connectionError)
        return null
      }

      const newConnection = connectionData?.[0]
      if (!newConnection?.id) {
        console.error('Failed to get connection ID after creation')
        return null
      }
      connectionId = newConnection.id
      console.log('Demo bank connection created:', connectionId)
    }

    // Add sample transactions
    return await addTransactionsToConnection(connectionId)

  } catch (error) {
    console.error('Unexpected error in addSampleTransactions:', error)
    return null
  }
}


// Helper to create bank connection without company (last resort)
async function createBankConnectionWithoutCompany() {
  console.log('Trying to create bank connection without company...')

  // Try to insert with null company_id
  const demoConnection = {
    company_id: null,
    bank_name: 'fnb' as const,
    account_name: 'Demo Business Account',
    account_number: '6283998475001',
    access_token: null,
    is_active: true,
    last_synced_at: new Date().toISOString()
  }

  const { data: connectionData, error: connectionError } = await supabase
    .from('bank_connections')
    .insert([demoConnection])
    .select()

  if (connectionError) {
    console.error('Error creating bank connection without company:', connectionError)
    console.log('Database constraints are too strict for demo data.')
    console.log('Please run the SQL to disable foreign key constraints temporarily.')
    return null
  }

  const connection = connectionData?.[0]
  if (!connection?.id) {
    console.error('Failed to get connection ID after creation')
    return null
  }
  const connectionId = connection.id
  console.log('Bank connection created without company:', connectionId)

  return await addTransactionsToConnection(connectionId)
}

// ===== INVOICE FUNCTIONS =====

// Helper to pack currency into notes
function packCurrencyMetadata(notes: string | null, currency: string, rate: number): string {
  const metadata = JSON.stringify({ currency, rate });
  const separator = '\n\n--- META ---\n';
  return (notes || '') + separator + metadata;
}

// Helper to unpack currency from notes
function unpackCurrencyMetadata(notes: string | null): { notes: string | null, currency: string, rate: number } {
  if (!notes || !notes.includes('--- META ---')) {
    return { notes, currency: 'ZAR', rate: 1.0 };
  }

  try {
    const parts = notes.split('\n\n--- META ---\n');
    const content = parts[0];
    const metaStr = parts[1];
    const meta = JSON.parse(metaStr);
    return {
      notes: content || null,
      currency: meta.currency || 'ZAR',
      rate: meta.rate || 1.0
    };
  } catch (e) {
    return { notes, currency: 'ZAR', rate: 1.0 };
  }
}

// Get all invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
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

    // Unpack metadata
    return (data || []).map((inv: any) => {
      const { currency, rate, notes } = unpackCurrencyMetadata(inv.notes);
      return {
        ...inv,
        notes,
        currency: inv.currency || currency, // Prefer DB column if exists, else meta
        exchange_rate: inv.exchange_rate || rate
      };
    });
  } catch (error) {
    console.error('Error in getInvoices:', error)
    return []
  }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return null
    }

    const { currency, rate, notes } = unpackCurrencyMetadata(data.notes);
    return {
      ...data,
      notes,
      currency: data.currency || currency,
      exchange_rate: data.exchange_rate || rate
    };
  } catch (error) {
    console.error('Error in getInvoice:', error)
    return null
  }
}

// ... existing code ...

// Create a new invoice
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]) {
  try {
    // Pack metadata if currency is not ZAR or rate is not 1.0
    // We modify the 'invoice' object passed to the insert
    const dbInvoice = { ...invoice };

    // Check if we need to pack metadata (if columns don't exist, we MUST pack it)
    // We assume columns might NOT exist, so we always pack it for safety in this fallback mode.
    // If the columns DO exist later, this redundant data in notes is harmless.
    if (invoice.currency && invoice.currency !== 'ZAR') {
      dbInvoice.notes = packCurrencyMetadata(invoice.notes, invoice.currency, invoice.exchange_rate || 1.0);
      // Remove virtual fields from the insert object to avoid 'column does not exist' error
      delete (dbInvoice as any).currency;
      delete (dbInvoice as any).exchange_rate;
      // BUT wait, TypeScript interface says they are optional. 
      // If we delete them, they won't be sent to DB. 
      // If we don't delete them, and column is missing, insert fails.
      // SAFE BET: Delete them from the object sent to supabase.
    } else {
      delete (dbInvoice as any).currency;
      delete (dbInvoice as any).exchange_rate;
    }

    // First create the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert([dbInvoice])
      .select()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return { success: false, error: invoiceError.message || JSON.stringify(invoiceError) }
    }

    const createdInvoice = invoiceData?.[0]
    if (!createdInvoice) return { success: false, error: 'Failed to retrieve created invoice' }

    // Restore the currency data for the return value
    const { currency, rate, notes } = unpackCurrencyMetadata(createdInvoice.notes);
    const returnedInvoice = {
      ...createdInvoice,
      notes, // Clean notes
      currency,
      exchange_rate: rate
    };

    // Then create the invoice items
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: createdInvoice.id
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)
      .select()

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
      return { success: true, data: returnedInvoice, warning: 'Invoice created but items failed: ' + itemsError.message }
    }

    // Post to journal
    const { postInvoiceJournal } = await import('./journal')
    const journalResult = await postInvoiceJournal(
      invoice.company_id,
      createdInvoice.id,
      invoice.issue_date,
      createdInvoice.total_amount - createdInvoice.tax_amount, // Subtotal
      createdInvoice.tax_amount,
      createdInvoice.total_amount,
      createdInvoice.invoice_number
    )

    if (!journalResult.success) {
      console.error('Error posting invoice journal:', journalResult.error)
      return {
        success: true,
        data: returnedInvoice,
        warning: 'Invoice created but journal entry failed: ' + journalResult.error
      }
    }

    return { success: true, data: returnedInvoice }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update invoice status
export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating invoice status:', error)
    return { success: false, error: error.message }
  }
}

// Get all clients
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getClients:', error)
    return []
  }
}

// Add sample clients for demo
export async function addSampleClients() {
  try {
    const sampleClients = [
      {
        company_id: '22222222-2222-2222-2222-222222222222',
        name: 'ABC Corporation',
        email: 'billing@abccorp.com',
        phone: '+27 11 123 4567',
        address: '123 Main St, Johannesburg',
        tax_number: 'VAT123456789'
      },
      {
        company_id: '22222222-2222-2222-2222-222222222222',
        name: 'XYZ Enterprises',
        email: 'accounts@xyz.co.za',
        phone: '+27 11 987 6543',
        address: '456 Oak Ave, Cape Town',
        tax_number: 'VAT987654321'
      },
      {
        company_id: '22222222-2222-2222-2222-222222222222',
        name: 'Demo Client SA',
        email: 'info@democlient.co.za',
        phone: '+27 11 555 1234',
        address: '789 Pine Rd, Durban',
        tax_number: 'VAT555666777'
      }
    ]

    const { data, error } = await supabase
      .from('clients')
      .insert(sampleClients)
      .select()

    if (error) {
      console.error('Error adding sample clients:', error)
      return null
    }

    console.log('Sample clients added successfully!')
    return data
  } catch (error) {
    console.error('Error in addSampleClients:', error)
    return null
  }
}

/**
 * Add a new client
 */
export async function addClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) {
      console.error('Error adding client:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in addClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get a single client by ID
 */
export async function getClient(id: string): Promise<Client | null> {
  try {
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
  } catch (error) {
    console.error('Error in getClient:', error)
    return null
  }
}

/**
 * Update a client
 */
export async function updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'company_id' | 'created_at' | 'updated_at'>>) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string) {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== EXPENSE FUNCTIONS =====

// Get all expenses
export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error.message || JSON.stringify(error) || error)
      return []
    }

    // Unpack metadata from description
    return (data || []).map((exp: any) => {
      // Use the same helper but targeting 'description'
      const { notes: cleanDescription, currency, rate } = unpackCurrencyMetadata(exp.description);
      return {
        ...exp,
        description: cleanDescription || exp.description,
        currency: exp.currency || currency,
        exchange_rate: exp.exchange_rate || rate
      };
    });
  } catch (error) {
    console.error('Error in getExpenses:', error)
    return []
  }
}

// Add a new expense
export async function addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Pack metadata into description
    const dbExpense = { ...expense };

    if (expense.currency && expense.currency !== 'ZAR') {
      dbExpense.description = packCurrencyMetadata(expense.description, expense.currency, expense.exchange_rate || 1.0);
      delete (dbExpense as any).currency;
      delete (dbExpense as any).exchange_rate;
    } else {
      delete (dbExpense as any).currency;
      delete (dbExpense as any).exchange_rate;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([dbExpense])
      .select()

    if (error) {
      console.error('Error adding expense:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    const createdExpense = data?.[0]
    if (!createdExpense) return { success: false, error: 'Failed to retrieve created expense' }

    // Restore clean description
    const { notes: cleanDesc, currency, rate } = unpackCurrencyMetadata(createdExpense.description);
    const returnedExpense = {
      ...createdExpense,
      description: cleanDesc || createdExpense.description,
      currency,
      exchange_rate: rate
    };

    // Post to journal
    // We treat expenses as bills for now (Debit Expense, Credit AP)
    // In a full system, we might distinguish between "Bill" (AP) and "Expense Claim" (Liability/Bank)
    const { postBillJournal } = await import('./journal')

    // Map category to account code if possible, otherwise use default
    // This is a simplification. Ideally we'd look up the account by category name.
    const expenseAccountCode = '5200' // Operating Expenses

    const journalResult = await postBillJournal(
      expense.company_id,
      createdExpense.id,
      expense.date,
      createdExpense.amount, // Subtotal (excl tax)
      createdExpense.tax_amount,
      createdExpense.total_amount,
      `EXP-${createdExpense.id.substring(0, 8)}`, // Reference
      expenseAccountCode
    )

    if (!journalResult.success) {
      console.error('Error posting expense journal:', journalResult.error)
      return {
        success: true,
        data: returnedExpense,
        warning: 'Expense created but journal entry failed: ' + journalResult.error
      }
    }

    return { success: true, data: returnedExpense }
  } catch (error) {
    console.error('Error in addExpense:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get unreconciled transactions
export async function getUnreconciledTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_reconciled', false)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching unreconciled transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUnreconciledTransactions:', error)
    return []
  }
}

// Reconcile a transaction
export async function reconcileTransaction(id: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ is_reconciled: true })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error reconciling transaction:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error in reconcileTransaction:', error)
    return null
  }
}

// ===== ITEMS INTERFACES =====
export interface Item {
  id: string
  company_id: string
  name: string
  description: string | null
  unit_price: number
  tax_rate: number
  category: 'product' | 'service'
  sku: string | null
  current_stock: number
  reorder_point: number
  created_at: string
  updated_at: string
}

// ===== ITEMS FUNCTIONS =====



// Get all items
export async function getItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getItems:', error)
    return []
  }
}

// Add a new item
export async function addItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()

    if (error) {
      console.error('Error adding item:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in addItem:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update an item
export async function updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at' | 'company_id'>>) {
  try {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating item:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in updateItem:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete an item
export async function deleteItem(id: string) {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting item:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteItem:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== INVENTORY INTELLIGENCE =====

export interface InventoryInsight {
  itemId: string;
  burnRate: number; // Avg units sold per day (last 30 days)
  daysRemaining: number | string; // Infinity if burn rate is 0
  stockoutDate: string | null;
}

export async function getInventoryInsights(): Promise<InventoryInsight[]> {
  try {
    const items = await getItems();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch invoice items from last 30 days to calculate sales velocity
    const { data: recentSales, error } = await supabase
      .from('invoice_items')
      .select('quantity, description, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching sales for insights:', error);
      return [];
    }

    const insights: InventoryInsight[] = [];

    for (const item of items) {
      if (item.category === 'service') continue; // Only track products

      // Calculate total sold in 30 days
      const sold = recentSales?.filter(s => s.description === item.name).reduce((sum, s) => sum + s.quantity, 0) || 0;
      const burnRate = sold / 30; // units per day

      let daysRemaining: number | string = 'Infinity';
      let stockoutDate: string | null = null;

      if (burnRate > 0) {
        const days = item.current_stock / burnRate;
        daysRemaining = Math.floor(days);

        const d = new Date();
        d.setDate(d.getDate() + days);
        stockoutDate = d.toISOString().split('T')[0];
      }

      insights.push({
        itemId: item.id,
        burnRate,
        daysRemaining,
        stockoutDate
      });
    }

    return insights;

  } catch (e) {
    console.error('Error generating inventory insights:', e);
    return [];
  }
}

// ===== BILLS INTERFACES =====
export interface Bill {
  id: string
  company_id: string
  bill_number: string
  vendor_name: string
  bill_date: string
  due_date: string
  status: 'draft' | 'pending' | 'paid' | 'overdue'
  total_amount: number
  tax_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  items?: BillItem[]
}

export interface BillItem {
  id: string
  bill_id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total_amount: number
  created_at: string
}

// ===== BILLS FUNCTIONS =====

// Get all bills
export async function getBills(): Promise<Bill[]> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bills:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBills:', error)
    return []
  }
}

export async function getBill(id: string): Promise<Bill | null> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        items:bill_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching bill:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getBill:', error)
    return null
  }
}

// Create a new bill
export async function createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>, items: Omit<BillItem, 'id' | 'bill_id' | 'created_at'>[]) {
  try {
    // First create the bill
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert([bill])
      .select()

    if (billError) {
      console.error('Error creating bill:', billError)
      return { success: false, error: billError.message || JSON.stringify(billError) }
    }

    const createdBill = billData?.[0]
    if (!createdBill) return { success: false, error: 'Failed to retrieve created bill' }

    // Then create the bill items
    const itemsWithBillId = items.map(item => ({
      ...item,
      bill_id: createdBill.id
    }))

    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(itemsWithBillId)
      .select()

    if (itemsError) {
      console.error('Error creating bill items:', itemsError)
      return { success: true, data: createdBill, warning: 'Bill created but items failed: ' + itemsError.message }
    }

    // Post to journal
    const { postBillJournal } = await import('./journal')
    const journalResult = await postBillJournal(
      bill.company_id,
      createdBill.id,
      bill.bill_date,
      createdBill.total_amount - createdBill.tax_amount, // Subtotal
      createdBill.tax_amount,
      createdBill.total_amount,
      createdBill.bill_number
    )

    if (!journalResult.success) {
      console.error('Error posting bill journal:', journalResult.error)
      return {
        success: true,
        data: createdBill,
        warning: 'Bill created but journal entry failed: ' + journalResult.error
      }
    }

    return { success: true, data: createdBill }
  } catch (error) {
    console.error('Error in createBill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update a bill
export async function updateBill(id: string, updates: Partial<Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'company_id'>>) {
  try {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating bill:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in updateBill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a bill
export async function deleteBill(id: string) {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bill:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }


    return { success: true }
  } catch (error) {
    console.error('Error in deleteBill:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== PROJECTS INTERFACES =====
export interface Project {
  id: string
  company_id: string
  name: string
  description: string | null
  client_id: string | null
  status: 'active' | 'on_hold' | 'completed' | 'cancelled'
  budget: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

// ===== PROJECTS FUNCTIONS =====

// Get all projects
export async function getProjects(): Promise<Project[]> {
  try {
    const companyId = await getCompanyId()
    if (!companyId) {
      console.error('No company ID found')
      return []
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getProjects:', error)
    return []
  }
}

// Create a new project
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'company_id'>) {
  try {
    const companyId = await getCompanyId()
    if (!companyId) {
      return { success: false, error: 'No company ID found' }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, company_id: companyId }])
      .select()

    if (error) {
      console.error('Error creating project:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in createProject:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update a project
export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'company_id'>>) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating project:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in updateProject:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.message || JSON.stringify(error) }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteProject:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== ESTIMATES INTERFACES =====
export interface Estimate {
  id: string
  company_id: string
  client_id: string | null
  estimate_number: string
  issue_date: string
  expiry_date: string | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  subtotal: number
  tax_amount: number
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  client?: {
    name: string
    email: string
  }
  items?: EstimateItem[]
}

export interface EstimateItem {
  id: string
  estimate_id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total_amount: number
  created_at: string
}

// ===== ESTIMATES FUNCTIONS =====

// Get all estimates
export async function getEstimates(): Promise<Estimate[]> {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return []

    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        client:clients(name, email),
        items:estimate_items(*)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching estimates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getEstimates:', error)
    return []
  }
}

// Create a new estimate
export async function createEstimate(
  estimate: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'client' | 'items'>,
  items: Omit<EstimateItem, 'id' | 'created_at' | 'estimate_id'>[]
) {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return { success: false, error: 'No company ID found' }

    // Start a transaction-like operation
    // 1. Create the estimate
    const { data: estimateData, error: estimateError } = await supabase
      .from('estimates')
      .insert([{ ...estimate, company_id: companyId }])
      .select()
      .single()

    if (estimateError) {
      console.error('Error creating estimate:', estimateError)
      return { success: false, error: estimateError.message }
    }

    // 2. Create items if any
    if (items.length > 0) {
      const itemsWithEstimateId = items.map(item => ({
        ...item,
        estimate_id: estimateData.id
      }))

      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(itemsWithEstimateId)

      if (itemsError) {
        console.error('Error creating estimate items:', itemsError)
        // Note: In a real app we might want to rollback here
        return { success: false, error: itemsError.message }
      }
    }

    return { success: true, data: estimateData }
  } catch (error) {
    console.error('Error in createEstimate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update an estimate
export async function updateEstimate(
  id: string,
  updates: Partial<Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'client' | 'items'>>,
  items?: Omit<EstimateItem, 'id' | 'created_at' | 'estimate_id'>[]
) {
  try {
    // 1. Update estimate details
    const { data: estimateData, error: estimateError } = await supabase
      .from('estimates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (estimateError) {
      return { success: false, error: estimateError.message }
    }

    // 2. Update items if provided
    if (items) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('estimate_items')
        .delete()
        .eq('estimate_id', id)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      // Insert new items
      if (items.length > 0) {
        const itemsWithEstimateId = items.map(item => ({
          ...item,
          estimate_id: id
        }))

        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(itemsWithEstimateId)

        if (itemsError) {
          return { success: false, error: itemsError.message }
        }
      }
    }

    return { success: true, data: estimateData }
  } catch (error) {
    console.error('Error in updateEstimate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete an estimate
export async function deleteEstimate(id: string) {
  try {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteEstimate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== TIMESHEETS INTERFACES =====
export interface Timesheet {
  id: string
  company_id: string
  project_id: string | null
  user_id: string | null
  date: string
  duration: number
  description: string
  billable: boolean
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  project?: {
    name: string
  }
}

// ===== TIMESHEETS FUNCTIONS =====

// Get all timesheets
export async function getTimesheets(): Promise<Timesheet[]> {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return []

    const { data, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        project:projects(name)
      `)
      .eq('company_id', companyId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching timesheets:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTimesheets:', error)
    return []
  }
}

// Create a new timesheet
export async function createTimesheet(
  timesheet: Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'project'>
) {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return { success: false, error: 'No company ID found' }

    const { data, error } = await supabase
      .from('timesheets')
      .insert([{ ...timesheet, company_id: companyId }])
      .select()
      .single()

    if (error) {
      console.error('Error creating timesheet:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createTimesheet:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update a timesheet
export async function updateTimesheet(
  id: string,
  updates: Partial<Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'project'>>
) {
  try {
    const { data, error } = await supabase
      .from('timesheets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateTimesheet:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a timesheet
export async function deleteTimesheet(id: string) {
  try {
    const { error } = await supabase
      .from('timesheets')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteTimesheet:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== DOCUMENTS INTERFACES =====
export interface Document {
  id: string
  company_id: string
  name: string
  storage_path: string
  size: number
  type: string
  folder: string
  entity_type: string | null
  entity_id: string | null
  created_at: string
}

// ===== DOCUMENTS FUNCTIONS =====

// Get documents (optionally filtered)
export async function getDocuments(
  folder?: string,
  entityType?: string,
  entityId?: string
): Promise<Document[]> {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return []

    let query = supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (folder) {
      query = query.eq('folder', folder)
    }

    if (entityType && entityId) {
      query = query.eq('entity_type', entityType).eq('entity_id', entityId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getDocuments:', error)
    return []
  }
}

// Upload a document
export async function uploadDocument(
  file: File,
  folder: string = 'General',
  entityType?: string,
  entityId?: string
) {
  try {
    const companyId = await getCompanyId()
    if (!companyId) return { success: false, error: 'No company ID found' }

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${companyId}/${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // 2. Create DB Record
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([
        {
          company_id: companyId,
          name: file.name,
          storage_path: filePath,
          size: file.size,
          type: file.type,
          folder: folder,
          entity_type: entityType || null,
          entity_id: entityId || null
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Error creating document record:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in uploadDocument:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a document
export async function deleteDocument(id: string, storagePath: string) {
  try {
    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([storagePath])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      return { success: false, error: storageError.message }
    }

    // 2. Delete from DB
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Error deleting document record:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get public URL for a document
export function getDocumentUrl(storagePath: string) {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  return data.publicUrl
}

// ===== TAX RATE INTERFACES =====
export interface TaxRate {
  id: string
  company_id: string
  name: string
  rate: number
  is_default: boolean
  created_at: string
  updated_at: string
}

// ===== COMPANY SETTINGS FUNCTIONS =====

// Get company by ID
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCompany:', error)
    return null
  }
}

// Update company information
export async function updateCompany(companyId: string, updates: Partial<Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()

    if (error) {
      console.error('Error updating company:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in updateCompany:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ===== TAX RATE FUNCTIONS =====

// Get all tax rates for a company
export async function getTaxRates(companyId: string): Promise<TaxRate[]> {
  try {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tax rates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTaxRates:', error)
    return []
  }
}

// Add a new tax rate
export async function addTaxRate(taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('tax_rates')
      .insert([taxRate])
      .select()

    if (error) {
      console.error('Error adding tax rate:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in addTaxRate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update a tax rate
export async function updateTaxRate(id: string, updates: Partial<Omit<TaxRate, 'id' | 'company_id' | 'created_at' | 'updated_at'>>) {
  try {
    const { data, error } = await supabase
      .from('tax_rates')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating tax rate:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.[0] }
  } catch (error) {
    console.error('Error in updateTaxRate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a tax rate
export async function deleteTaxRate(id: string) {
  try {
    const { error } = await supabase
      .from('tax_rates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tax rate:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteTaxRate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
