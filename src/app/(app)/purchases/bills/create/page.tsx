'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { useState } from 'react'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Wand2 } from 'lucide-react'
import Link from 'next/link'

interface BillItem {
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
}

export default function CreateBillPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisComplete, setAnalysisComplete] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    // Form State
    const [vendor, setVendor] = useState('')
    const [billDate, setBillDate] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [billNumber, setBillNumber] = useState('')
    const [items, setItems] = useState<BillItem[]>([
        { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setAnalysisComplete(false)
        }
    }

    const analyzeBill = async () => {
        if (!file) return

        setIsAnalyzing(true)

        // Simulate AI Processing Delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock AI Extraction Data
        setVendor('TechCorp Solutions')
        setBillDate('2024-03-15')
        setDueDate('2024-04-15')
        setBillNumber('INV-2024-001')
        setItems([
            { id: '1', description: 'Cloud Server Hosting - March', quantity: 1, rate: 150.00, amount: 150.00 },
            { id: '2', description: 'Premium Support Plan', quantity: 1, rate: 50.00, amount: 50.00 },
        ])

        setIsAnalyzing(false)
        setAnalysisComplete(true)
    }

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0, amount: 0 }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value }
                if (field === 'quantity' || field === 'rate') {
                    updatedItem.amount = updatedItem.quantity * updatedItem.rate
                }
                return updatedItem
            }
            return item
        }))
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <PageHeader
                title="New Bill"
                description="Record a bill from your vendor"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Purchases' },
                    { label: 'Bills', href: '/purchases/bills' },
                    { label: 'New' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: AI Upload */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Wand2 className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">AI Bill Extractor</h3>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                                {file ? file.name : 'Drop bill or click to upload'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                        </div>

                        {file && (
                            <button
                                onClick={analyzeBill}
                                disabled={isAnalyzing || analysisComplete}
                                className={`w-full mt-4 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${analysisComplete
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : analysisComplete ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Extraction Complete
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Auto-fill with AI
                                    </>
                                )}
                            </button>
                        )}

                        {analysisComplete && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    AI has extracted details from your document. Please verify the information before saving.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Bill Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Bill Details</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Vendor Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                                    <input
                                        type="text"
                                        value={vendor}
                                        onChange={(e) => setVendor(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="Select or type vendor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                                    <input
                                        type="text"
                                        value={billNumber}
                                        onChange={(e) => setBillNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                                    <input
                                        type="date"
                                        value={billDate}
                                        onChange={(e) => setBillDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mt-8">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Item Details</h4>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-gray-500 w-1/2">Description</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 w-24">Qty</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 w-32">Rate</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 w-32 text-right">Amount</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none"
                                                            placeholder="Item description"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-right font-medium text-gray-900">
                                                        ${item.amount.toFixed(2)}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={addItem}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Line Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sub Total</span>
                                        <span className="font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Tax (0%)</span>
                                        <span className="font-medium text-gray-900">$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <Link
                                    href="/purchases/bills"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    Save as Draft
                                </button>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                                    Save and Open
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
