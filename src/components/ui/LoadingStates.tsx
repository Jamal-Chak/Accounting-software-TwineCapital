'use client'

import { Loader2 } from 'lucide-react'

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
    )
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
                <Spinner size="lg" className="text-blue-600" />
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-100 h-12 rounded-t-lg mb-2"></div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-3">
                    {Array.from({ length: columns }).map((_, j) => (
                        <div key={j} className="flex-1 h-10 bg-gray-100 rounded"></div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <TableSkeleton />
        </div>
    )
}
