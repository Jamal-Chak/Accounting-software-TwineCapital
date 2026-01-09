import { useState } from 'react'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface LineItemsProps {
  items: LineItem[]
  onItemsChange: (items: LineItem[]) => void
  error?: string
}

export function LineItems({ items, onItemsChange, error }: LineItemsProps) {
  const [nextId, setNextId] = useState(1)

  const calculateItemTotal = (quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice
    const taxAmount = subtotal * (taxRate / 100)
    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }

  const calculateInvoiceTotals = () => {
    let subtotal = 0
    let taxTotal = 0
    let grandTotal = 0

    items.forEach(item => {
      const { subtotal: itemSubtotal, taxAmount, total } = calculateItemTotal(
        item.quantity,
        item.unit_price,
        item.tax_rate
      )
      subtotal += itemSubtotal
      taxTotal += taxAmount
      grandTotal += total
    })

    return { subtotal, taxTotal, grandTotal }
  }

  const addItem = () => {
    const newItem: LineItem = {
      id: `item-${nextId}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 15.00 // Default South African VAT rate
    }
    onItemsChange([...items, newItem])
    setNextId(nextId + 1)
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onItemsChange(items.map(item =>
      item.id === id
        ? { ...item, [field]: field === 'description' ? value : Number(value) }
        : item
    ))
  }

  const { subtotal, taxTotal, grandTotal } = calculateInvoiceTotals()
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Line Items <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-2">No line items yet</p>
          <p className="text-gray-400 text-sm mb-4">Add your first item to start building the invoice</p>
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors duration-200"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const { total: itemTotal } = calculateItemTotal(
                    item.quantity,
                    item.unit_price,
                    item.tax_rate
                  )

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-gray-900 bg-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-gray-900 bg-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.tax_rate}
                          onChange={(e) => updateItem(item.id, 'tax_rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-gray-900 bg-white"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (VAT):</span>
                  <span className="font-medium">{formatCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
