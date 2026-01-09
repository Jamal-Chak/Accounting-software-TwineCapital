'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ClientList } from '@/components/clients/ClientList'
import { ClientModal } from '@/components/clients/ClientModal'
import { getClients, addClient, updateClient, deleteClient, type Client } from '@/lib/database'
import { Plus, Users, UserCheck, AlertCircle, Loader2 } from 'lucide-react'

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        setLoading(true)
        try {
            const data = await getClients()
            setClients(data)
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveClient = async (clientData: any) => {
        if (selectedClient) {
            const result = await updateClient(selectedClient.id, clientData)
            if (result.success) {
                await loadClients()
            } else {
                throw new Error(result.error)
            }
        } else {
            const result = await addClient(clientData)
            if (result.success) {
                await loadClients()
            } else {
                throw new Error(result.error)
            }
        }
    }

    const handleDeleteClient = async (id: string) => {
        const result = await deleteClient(id)
        if (result.success) {
            await loadClients()
        } else {
            alert('Error deleting client: ' + result.error)
        }
    }

    const handleEditClient = (client: Client) => {
        setSelectedClient(client)
        setIsModalOpen(true)
    }

    const handleCreateClient = () => {
        setSelectedClient(null)
        setIsModalOpen(true)
    }

    // Stats Calculation
    const totalClients = clients.length
    const clientsWithEmail = clients.filter(c => c.email).length
    const clientsWithAddress = clients.filter(c => c.address).length

    if (loading && clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">Loading your client database...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Clients"
                description="Manage your customer database, contact details, and tax information."
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Clients' }
                ]}
                action={
                    <button
                        onClick={handleCreateClient}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Client</span>
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Clients</p>
                        <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">With Email</p>
                        <p className="text-2xl font-bold text-gray-900">{clientsWithEmail}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Missing Address</p>
                        <p className="text-2xl font-bold text-gray-900">{totalClients - clientsWithAddress}</p>
                    </div>
                </div>
            </div>

            {/* Client List */}
            <ClientList
                clients={clients}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
            />

            {/* Client Modal */}
            <ClientModal
                isOpen={isModalOpen}
                client={selectedClient}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveClient}
            />
        </div>
    )
}
