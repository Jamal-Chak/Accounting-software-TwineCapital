'use client'

import { useState } from 'react'
import { Client } from '@/lib/database'
import {
    Search,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Edit2,
    Trash2
} from 'lucide-react'
import Link from 'next/link'

interface ClientListProps {
    clients: Client[]
    onEdit: (client: Client) => void
    onDelete: (id: string) => void
}

export function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.tax_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header / Search */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clients by name, email, or tax ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Showing {filteredClients.length} of {clients.length} clients
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                        <tr>
                            <th className="px-6 py-3 text-left">Client Name</th>
                            <th className="px-6 py-3 text-left">Contact Info</th>
                            <th className="px-6 py-3 text-left">Tax Number</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                    No clients found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                                            >
                                                {client.name}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">{client.address || 'No address provided'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {client.phone}
                                                </div>
                                            )}
                                            {!client.email && !client.phone && (
                                                <span className="text-xs text-gray-400 italic">No contact info</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                            {client.tax_number || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(client)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                                title="Edit Client"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                                                        onDelete(client.id)
                                                    }
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                title="Delete Client"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
