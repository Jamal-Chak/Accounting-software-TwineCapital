
import { LucideIcon, Calculator, Brain, Receipt, Globe, MessageSquare, Users, BarChart3, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';

export type AppCategory = 'Finance' | 'AI' | 'Operations' | 'Integrations';

export type AppStatus = 'installed' | 'available' | 'coming_soon';

export interface MarketplaceApp {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    category: AppCategory;
    status: AppStatus;
    price: string;
    link?: string;
}

export const MARKETPLACE_APPS: MarketplaceApp[] = [
    {
        id: 'ai_accountant',
        title: 'AI Accountant',
        description: 'Your personal 24/7 financial advisor. Ask questions about your business health, tax, and more.',
        icon: Brain,
        category: 'AI',
        status: 'installed',
        price: 'Free',
        link: '/chat' // In reality this opens the chatbot
    },
    {
        id: 'smart_invoicing',
        title: 'Smart Invoicing',
        description: 'Create professional invoices with AI suggestions, automated follow-ups, and multi-currency support.',
        icon: Receipt,
        category: 'Finance',
        status: 'installed',
        price: 'Free',
        link: '/invoices'
    },
    {
        id: 'cashflow_engine',
        title: 'Cashflow Engine',
        description: 'Predictive 13-week cashflow forecasting to keep your business solvent.',
        icon: Calculator,
        category: 'Finance',
        status: 'installed',
        price: 'Premium',
        link: '/analytics/cashflow'
    },
    {
        id: 'multi_currency',
        title: 'Multi-Currency',
        description: 'Trade globally. Support for USD, EUR, GBP, and more with automatic exchange rate updates.',
        icon: Globe,
        category: 'Finance',
        status: 'installed',
        price: 'Free',
        link: '/invoices/create'
    },
    {
        id: 'whatsapp_connect',
        title: 'WhatsApp Connect',
        description: 'Send invoices and payment reminders directly to your clients via WhatsApp.',
        icon: MessageSquare,
        category: 'Integrations',
        status: 'available',
        price: 'R99/mo',
        link: '/apps/whatsapp'
    },
    {
        id: 'payroll_pro',
        title: 'Payroll Pro',
        description: 'Automated payroll processing with tax slip generation and leave management.',
        icon: Users,
        category: 'Operations',
        status: 'available',
        price: 'R199/mo',
        link: '/apps/payroll'
    },
    {
        id: 'customer_analytics',
        title: 'Customer Analytics',
        description: 'Deep dive into customer behavior. Identify churn risk and best customers.',
        icon: BarChart3,
        category: 'AI',
        status: 'available',
        price: 'R299/mo',
        link: '/analytics/customers'
    },
    {
        id: 'fraud_guard',
        title: 'Fraud Guard',
        description: 'AI-powered anomaly detection to prevent unauthorized transactions.',
        icon: ShieldCheck,
        category: 'AI',
        status: 'available',
        price: 'R399/mo',
        link: '/analytics/fraud'
    },
    {
        id: 'ecommerce_sync',
        title: 'E-commerce Sync',
        description: 'Sync orders and inventory from Shopify, WooCommerce, and Magento.',
        icon: ShoppingCart,
        category: 'Integrations',
        status: 'available',
        price: 'R199/mo',
        link: '/apps/ecommerce'
    },
    {
        id: 'inventory_master',
        title: 'Inventory Master',
        description: 'Track stock levels, manage warehouses, and automate reordering.',
        icon: Truck,
        category: 'Operations',
        status: 'available',
        price: 'Premium',
        link: '/items'
    }
];
