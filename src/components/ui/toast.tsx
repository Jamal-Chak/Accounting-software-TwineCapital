'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (type: ToastType, title: string, message?: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(7)
        const newToast: Toast = { id, type, title, message, duration }

        setToasts((prev) => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const success = (title: string, message?: string) => showToast('success', title, message)
    const error = (title: string, message?: string) => showToast('error', title, message)
    const warning = (title: string, message?: string) => showToast('warning', title, message)
    const info = (title: string, message?: string) => showToast('info', title, message)

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false)

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 200)
    }

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    }

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    const iconStyles = {
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600'
    }

    return (
        <div
            className={`
        ${styles[toast.type]} 
        border rounded-lg p-4 shadow-lg
        transition-all duration-200 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
        >
            <div className="flex items-start gap-3">
                <div className={iconStyles[toast.type]}>
                    {icons[toast.type]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{toast.title}</p>
                    {toast.message && (
                        <p className="text-sm mt-1 opacity-90">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
