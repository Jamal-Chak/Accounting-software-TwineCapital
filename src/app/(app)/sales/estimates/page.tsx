'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EstimateForm } from '@/components/estimates/EstimateForm'
import { Plus, Search, Filter, Edit2, Trash2, Calendar, DollarSign, FileText } from 'lucide-react'
import { getEstimates, deleteEstimate, type Estimate } from '@/lib/database'

export default function EstimatesPage() {
    const [estimates, setEstimates] = useState<Estimate[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingEstimate, setEditingEstimate] = useState<Estimate | undefined>()
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadEstimates()
    }, [])

    const loadEstimates = async () => {
        setLoading(true)
        const data = await getEstimates()
        setEstimates(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this estimate?')) return

        const result = await deleteEstimate(id)
        if (result.success) {
            loadEstimates()
        } else {
            alert(`Error: ${result.error}`)
        }
    }

    const filteredEstimates = estimates.filter(estimate =>
        estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'sent': return 'bg-blue-100 text-blue-800'
            case 'accepted': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'expired': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    return (
        <div>
            <PageHeader
                title="Estimates"
                description="Create and manage quotes for your clients"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Sales' },
                    { label: 'Estimates' }
                ]}
                action={
                    <button
                        onClick={() => {
                            setEditingEstimate(undefined)
                            setShowForm(true)
                        }}
                        className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Estimate</span>
                    </button>
                }
            />

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search estimates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : filteredEstimates.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <FileText className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No estimates yet</p>
                        <p className="text-gray-400 mb-6">Create your first estimate to send to a client</p>
                        <button
                            onClick={() => {
                                setEditingEstimate(undefined)
                                setShowForm(true)
                            }}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create New Estimate</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredEstimates.map((estimate) => (
                            <div key={estimate.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{estimate.estimate_number}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                                                {estimate.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-gray-900 font-medium">{estimate.client?.name || 'Unknown Client'}</p>
                                            {estimate.notes && <p className="text-sm text-gray-500 truncate max-w-md">{estimate.notes}</p>}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="font-medium text-gray-900">{formatCurrency(estimate.total_amount)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Issued: {new Date(estimate.issue_date).toLocaleDateString()}</span>
                                            </div>
                                            {estimate.expiry_date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Expires: {new Date(estimate.expiry_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setEditingEstimate(estimate)
                                                setShowForm(true)
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(estimate.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <EstimateForm
                    estimate={editingEstimate}
                    onClose={() => {
                        setShowForm(false)
                        setEditingEstimate(undefined)
                    }}
                    onSuccess={loadEstimates}
                />
            )}
        </div>
    )
}
