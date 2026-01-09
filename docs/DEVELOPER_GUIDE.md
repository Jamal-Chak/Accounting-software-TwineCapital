# TwineCapital Developer Guide

Technical documentation for the TwineCapital web application.

## 🏗️ Architecture

The application is built on **Next.js 16** using the **App Router** architecture.

### Tech Stack
-   **Framework**: Next.js
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Database**: Supabase (PostgreSQL)
-   **Auth**: Supabase Auth

### Folder Structure
```
web/
├── public/                 # Static assets
├── slides/                 # Presentation assets (ignore)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # Backend API routes
│   │   ├── (auth)/         # Authentication related pages
│   │   └── dashboard/      # Main dashboard pages
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Generic design system components
│   │   ├── layout/         # Header, Sidebar, Wrapper
│   │   └── ...feature      # Feature-specific components
│   ├── lib/                # Utilities and database helpers
│   │   ├── database.ts     # Supabase client wrapper
│   │   └── utils.ts        # Helper functions
│   └── types/              # TypeScript definitions
├── .env.local              # Environment variables
└── package.json            # Dependencies
```

## 🔌 API & Database

### Database Schema
We use a **Double Entry Bookkeeping** schema.
Key tables:
-   `transactions`: The ledger entries.
-   `accounts`: Chart of accounts.
-   `invoices` & `invoice_items`: Sales records.
-   `expenses`: Purchase records.

### Environment Variables
Required variables in `.env.local`:
-   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key.
-   `STITCH_*`: Stitch Money credentials for banking.

## 🧪 Development Workflow

1.  **Branching**: Use feature branches `feature/component-name`.
2.  **Linting**: Run `npm run lint` before committing.
3.  **Testing**: Run verification scripts in `scripts/` or `test-*.js`.

## 🚢 Deployment

The app is designed to be deployed on **Vercel** or **Netlify**.
Ensure all environment variables are set in the deployment dashboard.
