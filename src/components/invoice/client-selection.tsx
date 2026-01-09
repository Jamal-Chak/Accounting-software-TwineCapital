import { useState, useEffect } from 'react'
import { getClients, Client } from '@/lib/database'
import { cn } from '@/lib/utils/cn'

interface ClientSelectionProps {
  selectedClientId: string
  onClientSelect: (clientId: string) => void
  onNewClientToggle: (isNewClient: boolean) => void
  error?: string
}

export function ClientSelection({
  selectedClientId,
  onClientSelect,
  onNewClientToggle,
  error
}: ClientSelectionProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = (Array.isArray(clients) ? clients : []).filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedClient = clients.find(c => c.id === selectedClientId)

  const handleClientSelect = (clientId: string) => {
    onClientSelect(clientId)
    onNewClientToggle(false)
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleNewClientClick = () => {
    onClientSelect('new')
    onNewClientToggle(true)
    setSearchTerm('')
    setShowDropdown(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Client <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          value={
            selectedClientId === 'new'
              ? 'New Client'
              : selectedClient?.name || searchTerm
          }
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowDropdown(true)
            if (selectedClientId !== 'new') {
              onClientSelect('')
              onNewClientToggle(false)
            }
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Search clients or create new..."
          className={
            cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder:text-gray-400",
              error ? "border-red-300" : "border-gray-300"
            )
          }
        />

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Existing clients */}
            {filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleClientSelect(client.id)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                <div className="font-medium text-gray-900">{client.name}</div>
                {client.email && (
                  <div className="text-sm text-gray-500">{client.email}</div>
                )}
              </button>
            ))}

            {/* New client option */}
            {searchTerm && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleNewClientClick}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-100"
              >
                <div className="font-medium text-blue-600">
                  + Create new client: &quot;{searchTerm}&quot;
                </div>
                <div className="text-sm text-gray-500">
                  Add &quot;{searchTerm}&quot; as a new client
                </div>
              </button>
            )}

            {/* Fallback for "New Client" when no search */}
            {!searchTerm && clients.length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleNewClientClick}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t border-gray-100"
              >
                <div className="font-medium text-blue-600">+ Create New Client</div>
                <div className="text-sm text-gray-500">
                  Add a completely new client to your contact list
                </div>
              </button>
            )}

            {filteredClients.length === 0 && !searchTerm && !loading && (
              <div className="px-3 py-4 text-center text-gray-500">
                <div className="text-sm">No clients found</div>
                <button
                  type="button"
                  onClick={handleNewClientClick}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create your first client
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
