import { z } from 'zod'

// Invoice item schema for line items
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').max(999999, 'Quantity too large'),
  unit_price: z.number().min(0, 'Price must be positive').max(99999999, 'Price too high'),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').default(15.00)
})

// Client selection schema
export const clientSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  client_name: z.string().optional()
})

// New client schema for inline client creation
export const newClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional()
})

// Main invoice creation schema
export const invoiceSchema = z.object({
  client_id: z.string().uuid('Please select a client').or(z.literal('new')),
  // Client information (used when client_id is 'new')
  client: z.object({
    name: z.string().min(1, 'Client name is required').optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    tax_number: z.string().optional()
  }).optional(),
  
  // Invoice dates
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  
  // Notes
  notes: z.string().optional(),
  
  // Line items
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required')
}).refine((data) => {
  // If client_id is 'new', we need client data
  if (data.client_id === 'new' && (!data.client || !data.client.name)) {
    return false
  }
  return true
}, {
  message: 'Client name is required when creating a new client',
  path: ['client', 'name']
}).refine((data) => {
  // Ensure due date is not before issue date
  const issueDate = new Date(data.issue_date)
  const dueDate = new Date(data.due_date)
  return dueDate >= issueDate
}, {
  message: 'Due date cannot be before issue date',
  path: ['due_date']
})

// Type inference from schemas
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type Client = z.infer<typeof clientSchema>
export type NewClient = z.infer<typeof newClientSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
