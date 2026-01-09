'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Users, DollarSign, Calendar, Download, Plus, Search } from 'lucide-react'
import { useState } from 'react'

export default function PayrollProPage() {
    const [employees] = useState([
        { id: 1, name: 'Sarah Connor', role: 'Software Engineer', salary: 'R65,000', status: 'Active', lastPaid: '25 Oct 2025' },
        { id: 2, name: 'John Doe', role: 'Product Manager', salary: 'R72,000', status: 'Active', lastPaid: '25 Oct 2025' },
        { id: 3, name: 'Jane Smith', role: 'Designer', salary: 'R55,000', status: 'Leave', lastPaid: '25 Oct 2025' },
    ])

    return (
        <div>
            <PageHeader
                title="Payroll Pro"
                description="Manage employee salaries, tax calculations, and payslips."
                breadcrumbs={[
                    { label: 'Marketplace', href: '/marketplace' },
                    { label: 'Payroll Pro' }
                ]}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Payroll Cost</p>
                            <p className="text-2xl font-bold text-gray-900">R192,000</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Employees</p>
                            <p className="text-2xl font-bold text-gray-900">3</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Next Payroll Run</p>
                            <p className="text-2xl font-bold text-gray-900">25 Nov</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm">
                        <DollarSign className="w-4 h-4" />
                        Run Payroll
                    </button>
                </div>
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Salary</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Paid</th>
                            <th className="text-right py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-900">{employee.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">{employee.role}</td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900">{employee.salary}</td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">{employee.lastPaid}</td>
                                <td className="py-4 px-6 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Payslip</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
