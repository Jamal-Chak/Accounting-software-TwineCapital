'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createTimesheet, updateTimesheet, getProjects, type Timesheet, type Project } from '@/lib/database'

interface TimesheetFormProps {
    timesheet?: Timesheet
    onClose: () => void
    onSuccess: () => void
}

export function TimesheetForm({ timesheet, onClose, onSuccess }: TimesheetFormProps) {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [formData, setFormData] = useState({
        project_id: timesheet?.project_id || '',
        date: timesheet?.date || new Date().toISOString().split('T')[0],
        duration: timesheet?.duration || 0,
        description: timesheet?.description || '',
        billable: timesheet?.billable ?? true,
        status: timesheet?.status || 'draft' as const
    })

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        const data = await getProjects()
        setProjects(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const timesheetData = {
                project_id: formData.project_id || null,
                user_id: null, // TODO: Get from auth context
                date: formData.date,
                duration: Number(formData.duration),
                description: formData.description,
                billable: formData.billable,
                status: formData.status
            }

            const result = timesheet
                ? await updateTimesheet(timesheet.id, timesheetData)
                : await createTimesheet(timesheetData)

            if (result.success) {
                onSuccess()
                onClose()
            } else {
                alert(`Error: ${result.error}`)
            }
        } catch (error) {
            console.error('Error saving timesheet:', error)
            alert('Failed to save timesheet')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {timesheet ? 'Edit Time Entry' : 'Log Time'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project
                        </label>
                        <select
                            value={formData.project_id}
                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (Hours)
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.25"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="What did you work on?"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="billable"
                            checked={formData.billable}
                            onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="billable" className="text-sm text-gray-700">
                            Billable
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
