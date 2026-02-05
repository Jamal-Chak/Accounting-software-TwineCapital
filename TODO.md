# TwineCapital - V1.0 Release

## ✅ Completed Tasks
- [x] **Item/Inventory Logic**: Refactored to use direct database columns (`current_stock`, `reorder_point`).
- [x] **Company Context Fix**: Applied RLS policies to ensure companies are correctly identified and accessible.
- [x] **Accounting Loop**: Automated journal entry generation for Invoices and Expenses.
- [x] **Production Readiness**: verified build, cleaned test data, and removed demo features.
- [x] **Repository**: Code pushed to [GitHub](https://github.com/Jamal-Chak/Accounting-software-TwineCapital.git).

## 🚀 Deployment Instructions
1. **Environment Variables**: Set the following in Vercel/Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (for AI features)
   - `RESEND_API_KEY` (for emails)
2. **Database**: If deploying to a fresh Supabase instance, ensure all migrations in `/migrations` and scripts for RLS (`scripts/apply-fix-company.js`) have been executed.

## 📝 Roadmap (Planned for V2)
- [ ] Real-time bank sync (Stitch Integration).
- [ ] Multi-user permission management UI.
- [ ] Mobile App packaging (Capacitor/PWA).