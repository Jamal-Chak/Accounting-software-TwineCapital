
'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, ExternalLink } from 'lucide-react'
import { generateWhatsAppLink } from '@/lib/whatsapp'

interface WhatsAppModalProps {
    isOpen: boolean
    onClose: () => void
    phoneNumber: string
    message: string
    clientName: string
}

export function WhatsAppModal({ isOpen, onClose, phoneNumber, message, clientName }: WhatsAppModalProps) {
    const [editedMessage, setEditedMessage] = useState(message)
    const [editedPhone, setEditedPhone] = useState(phoneNumber)

    useEffect(() => {
        setEditedMessage(message)
        setEditedPhone(phoneNumber)
    }, [message, phoneNumber])

    if (!isOpen) return null

    const handleSend = () => {
        if (!editedPhone) {
            alert('Please enter a phone number')
            return
        }
        const link = generateWhatsAppLink({ phone: editedPhone, message: editedMessage });
        window.open(link, '_blank');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                <div className="p-4 border-b flex justify-between items-center bg-green-50 rounded-t-lg border-green-100">
                    <div className="flex items-center gap-2 text-green-700">
                        <MessageCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Send via WhatsApp</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Phone Number
                        </label>
                        <input
                            type="text"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            placeholder="e.g. 082 123 4567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            We'll automatically format this for WhatsApp (International format preferred).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-sans text-sm"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-500 flex gap-2">
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <p>
                            Clicking "Send" will open WhatsApp Web or the WhatsApp App on your device with this pre-filled message.
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium rounded-md flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    )
}
