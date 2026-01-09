import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode
    breadcrumbs?: { label: string; href?: string }[]
}

export function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-8">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center text-sm text-gray-500 mb-4">
                    {breadcrumbs.map((item, index) => (
                        <div key={item.label} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                            {item.href ? (
                                <Link href={item.href} className="hover:text-blue-600 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-medium">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && <p className="text-gray-600 mt-1">{description}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    )
}
