'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TimesheetForm } from '@/components/timesheets/TimesheetForm'
import { Plus, Search, Filter, Calendar, Clock, Edit2, Trash2 } from 'lucide-react'
import { getTimesheets, deleteTimesheet, type Timesheet } from '@/lib/database'

export default function TimesheetsPage() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | undefined>()
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadTimesheets()
    }, [])

    const loadTimesheets = async () => {
        setLoading(true)
        const data = await getTimesheets()
        setTimesheets(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this time entry?')) return

        const result = await deleteTimesheet(id)
        if (result.success) {
            loadTimesheets()
        } else {
            alert(`Error: ${result.error}`)
        }
    }

    const filteredTimesheets = timesheets.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'submitted': return 'bg-blue-100 text-blue-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            <PageHeader
                title="Timesheets"
                description="Track time for your projects"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Time Tracking' },
                    { label: 'Timesheets' }
                ]}
                action={
                    <button
                        onClick={() => {
                            setEditingTimesheet(undefined)
                            setShowForm(true)
                        }}
                        className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Log Time</span>
                    </button>
                }
            />

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search timesheets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>This Week</span>
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : filteredTimesheets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Clock className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No time entries yet</p>
                        <p className="text-gray-400 mb-6">Start logging time for your projects</p>
                        <button
                            onClick={() => {
                                setEditingTimesheet(undefined)
                                setShowForm(true)
                            }}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Log Time</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredTimesheets.map((entry) => (
                            <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {entry.project?.name || 'No Project'}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                                {entry.status.toUpperCase()}
                                            </span>
                                            {entry.billable && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    BILLABLE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mb-2">{entry.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{entry.duration} hours</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setEditingTimesheet(entry)
                                                setShowForm(true)
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
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
                <TimesheetForm
                    timesheet={editingTimesheet}
                    onClose={() => {
                        setShowForm(false)
                        setEditingTimesheet(undefined)
                    }}
                    onSuccess={loadTimesheets}
                />
            )}
        </div>
    )
}
