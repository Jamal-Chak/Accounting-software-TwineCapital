'use client'

import { useState } from 'react'
import { Plus, User, Shield, Trash2, Mail } from 'lucide-react'

// Mock data based on TODO structure
const INITIAL_USERS = [
    { id: 1, name: 'You', email: 'owner@example.com', role: 'Owner', status: 'Active' },
    { id: 2, name: 'Sarah Accountant', email: 'sarah@firm.com', role: 'Accountant', status: 'Active' },
    { id: 3, name: 'John Doe', email: 'john@example.com', role: 'Viewer', status: 'Invited' },
]

export function UserManagementSettings() {
    const [users, setUsers] = useState(INITIAL_USERS)

    const handleInvite = () => {
        alert('Invite modal would open here (Simulation)')
    }

    const handleRemove = (id: number) => {
        if (confirm('Are you sure you want to remove this user?')) {
            setUsers(users.filter(u => u.id !== id))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Users & Permissions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage members and their access levels.
                    </p>
                </div>
                <button
                    onClick={handleInvite}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <li key={user.id}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-blue-600 truncate">{user.name}</p>
                                                {user.status === 'Invited' && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Invited
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <p>{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex items-center gap-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Shield className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            <p>{user.role}</p>
                                        </div>
                                        {user.role !== 'Owner' && (
                                            <button
                                                onClick={() => handleRemove(user.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                title="Remove User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
