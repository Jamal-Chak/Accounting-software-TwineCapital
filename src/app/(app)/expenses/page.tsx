'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getExpenses, addExpense, getCompanyId, type Expense } from '@/lib/database'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, X, Upload } from 'lucide-react'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

function ExpensesContent() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const searchParams = useSearchParams()

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Office Supplies',
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadExpenses()

    // Check for action param
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true)
    }
  }, [searchParams])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const expensesData = await getExpenses()
      setExpenses(expensesData)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const amount = parseFloat(formData.amount)
      const taxRate = 15 // Default VAT
      const taxAmount = amount * (taxRate / 100)
      const totalAmount = amount + taxAmount

      // Get a valid company ID (demo or real)
      const companyId = await getCompanyId()
      if (!companyId) {
        alert('Could not find or create a demo company. Please try again.')
        setSubmitting(false)
        return
      }

      const newExpense = {
        company_id: companyId,
        description: formData.description,
        amount: amount,
        category: formData.category,
        date: formData.date,
        vendor: formData.vendor || null,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending' as const
      }

      const result = await addExpense(newExpense)

      if (result.success) {
        setIsModalOpen(false)
        setFormData({
          description: '',
          amount: '',
          category: 'Office Supplies',
          vendor: '',
          date: new Date().toISOString().split('T')[0]
        })
        loadExpenses() // Reload list
      } else {
        console.error('Failed to add expense:', result.error)
        alert(`Failed to add expense: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting expense:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'reimbursed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryStats = () => {
    const categories = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.total_amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track and manage your business expenses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses' }
        ]}
        action={
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Receipt</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        }
      />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Receipt</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <DocumentUpload
              folder="Receipts"
              onUploadComplete={() => {
                setShowUpload(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {expenses.filter(e => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {expenses.filter(e => e.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(expenses.reduce((sum, e) => sum + e.total_amount, 0))}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {expenses.length > 0 && (
        <div className="card mb-8">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {getCategoryStats().map(({ category, amount }) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{category}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Expenses</h3>
              <p className="text-sm text-gray-500 mt-1">{expenses.length} expenses</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2 text-lg">No expenses yet</p>
            <p className="text-gray-400 mb-6">Start tracking your business expenses</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Expense</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        {expense.description}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(expense.status)}`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      {expense.vendor && (
                        <p className="text-sm text-gray-500">• {expense.vendor}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Date: {new Date(expense.date).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      incl. {formatCurrency(expense.tax_amount)} VAT
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Add New Expense</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g. Office Supplies"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (ZAR)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Software">Software</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Travel">Travel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor (Optional)</label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g. Office Depot"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    }>
      <ExpensesContent />
    </Suspense>
  )
}
