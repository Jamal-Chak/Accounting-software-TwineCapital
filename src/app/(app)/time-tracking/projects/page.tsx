'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Plus, Search, Filter, Edit2, Trash2, Calendar, DollarSign, Upload } from 'lucide-react'
import { getProjects, deleteProject, type Project } from '@/lib/database'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | undefined>()
    const [searchTerm, setSearchTerm] = useState('')
    const [showUpload, setShowUpload] = useState(false)

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        const result = await deleteProject(id)
        if (result.success) {
            loadProjects()
        } else {
            alert(`Error: ${result.error}`)
        }
    }

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'on_hold': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    return (
        <div>
            <PageHeader
                title="Projects"
                description="Manage your projects and tasks"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Time Tracking' },
                    { label: 'Projects' }
                ]}
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Document</span>
                        </button>
                        <button
                            onClick={() => {
                                setEditingProject(undefined)
                                setShowForm(true)
                            }}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Project</span>
                        </button>
                    </div>
                }
            />

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Upload Project Document</h3>
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <DocumentUpload
                            folder="Projects"
                            onUploadComplete={() => {
                                setShowUpload(false)
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
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
                ) : filteredProjects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-2 text-lg">No projects yet</p>
                        <p className="text-gray-400 mb-6">Create a project to track time and expenses</p>
                        <button
                            onClick={() => {
                                setEditingProject(undefined)
                                setShowForm(true)
                            }}
                            className="px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 inline-flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create New Project</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {project.description && (
                                            <p className="text-gray-600 mb-3">{project.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            {project.budget && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{formatCurrency(project.budget)}</span>
                                                </div>
                                            )}
                                            {project.start_date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                                                    {project.end_date && (
                                                        <span> - {new Date(project.end_date).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setEditingProject(project)
                                                setShowForm(true)
                                            }}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
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
                <ProjectForm
                    project={editingProject}
                    onClose={() => {
                        setShowForm(false)
                        setEditingProject(undefined)
                    }}
                    onSuccess={loadProjects}
                />
            )}
        </div>
    )
}
