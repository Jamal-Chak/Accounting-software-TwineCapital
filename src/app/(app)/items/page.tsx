
'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { getItems, addItem, updateItem, deleteItem, getCompanyId, type Item, getInventoryInsights, type InventoryInsight } from '@/lib/database'
import { Plus, Search, Edit2, Trash2, X, Package, AlertTriangle, TrendingUp } from 'lucide-react'

export default function ItemsPage() {
    const [items, setItems] = useState<Item[]>([])
    const [insights, setInsights] = useState<InventoryInsight[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit_price: '',
        tax_rate: '15',
        category: 'product' as 'product' | 'service',
        sku: '',
        current_stock: '0',
        reorder_point: '10'
    })

    useEffect(() => {
        loadItems()
    }, [])

    const loadItems = async () => {
        try {
            setLoading(true)
            const itemsData = await getItems()
            setItems(itemsData)

            // Load insights in parallel or after
            const insightsData = await getInventoryInsights();
            setInsights(insightsData);
        } catch (error) {
            console.error('Error loading items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const openModal = (item?: Item) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                name: item.name,
                description: item.description || '',
                unit_price: item.unit_price.toString(),
                tax_rate: item.tax_rate.toString(),
                category: item.category,
                sku: item.sku || '',
                current_stock: (item.current_stock ?? 0).toString(),
                reorder_point: (item.reorder_point ?? 10).toString()
            })
        } else {
            setEditingItem(null)
            setFormData({
                name: '',
                description: '',
                unit_price: '',
                tax_rate: '15',
                category: 'product',
                sku: '',
                current_stock: '0',
                reorder_point: '10'
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const companyId = await getCompanyId()
            if (!companyId) { // Should rarely happen if shimmed
                // Try one more time or just alert
                alert('Could not identify company context.');
                setSubmitting(false);
                return;
            }

            const payload = {
                company_id: companyId,
                name: formData.name,
                description: formData.description || null,
                unit_price: parseFloat(formData.unit_price),
                tax_rate: parseFloat(formData.tax_rate),
                category: formData.category,
                sku: formData.sku || null,
                current_stock: parseInt(formData.current_stock) || 0,
                reorder_point: parseInt(formData.reorder_point) || 10
            };

            if (editingItem) {
                const result = await updateItem(editingItem.id, payload)
                if (result.success) {
                    closeModal()
                    loadItems()
                } else {
                    alert(`Failed to update item: ${result.error}`)
                }
            } else {
                const result = await addItem(payload)
                if (result.success) {
                    closeModal()
                    loadItems()
                } else {
                    alert(`Failed to add item: ${result.error}`)
                }
            }
        } catch (error) {
            console.error('Error submitting item:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            const result = await deleteItem(id)
            if (result.success) loadItems()
            else alert(`Failed to delete item: ${result.error}`)
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount)
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Derived Insights
    const lowStockItems = items.filter(i => i.category === 'product' && i.current_stock <= i.reorder_point);
    const predictedStockouts = insights.filter(i =>
        i.daysRemaining !== 'Infinity' && typeof i.daysRemaining === 'number' && i.daysRemaining <= 7
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading inventory...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="Items & Inventory"
                description="Manage products, services, and stock levels."
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Items' }]}
                action={
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Item</span>
                    </button>
                }
            />

            {/* Inventory Health Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">Total Products</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.category === 'product').length}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Value: {formatCurrency(items.reduce((sum, i) => sum + (i.category === 'product' ? (i.unit_price * (i.current_stock || 0)) : 0), 0))}
                    </p>
                </div>

                <div className={`rounded-lg border p-6 shadow-sm ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                        <h3 className={`font-medium ${lowStockItems.length > 0 ? 'text-red-900' : 'text-gray-900'}`}>Low Stock Alerts</h3>
                    </div>
                    <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                        {lowStockItems.length}
                    </p>
                    <p className={`text-sm mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        Items below reorder point
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="font-medium text-gray-900">Stockout Forecast</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{predictedStockouts.length}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Items creating stockout risk in 7 days
                    </p>
                </div>
            </div>

            {/* Search & List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sm"
                        />
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No items found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredItems.map((item) => {
                            const insight = insights.find(i => i.itemId === item.id);
                            return (
                                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.category === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {item.category}
                                                </span>
                                                {item.category === 'product' && item.current_stock <= item.reorder_point && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        Low Stock ({item.current_stock})
                                                    </span>
                                                )}
                                                {insight && typeof insight.daysRemaining === 'number' && insight.daysRemaining < 30 && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        {insight.daysRemaining} days left
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                {item.sku && <span>SKU: {item.sku}</span>}
                                                <span>{formatCurrency(item.unit_price)}</span>
                                                {item.category === 'product' && (
                                                    <span className="font-medium text-gray-700">Stock: {item.current_stock}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-blue-600">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-gray-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-semibold">
                                {editingItem ? 'Edit Item' : 'New Item'}
                            </h3>
                            <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit Price</label>
                                    <input type="number" name="unit_price" value={formData.unit_price} onChange={handleInputChange} required step="0.01" className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tax Rate %</label>
                                    <input type="number" name="tax_rate" value={formData.tax_rate} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                                        <option value="product">Product</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">SKU</label>
                                    <input name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                                </div>
                            </div>

                            {formData.category === 'product' && (
                                <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-2 gap-4">
                                    <div className="col-span-2 text-xs font-bold text-gray-500 uppercase">Inventory</div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Stock</label>
                                        <input type="number" name="current_stock" value={formData.current_stock} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Reorder Point</label>
                                        <input type="number" name="reorder_point" value={formData.reorder_point} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
