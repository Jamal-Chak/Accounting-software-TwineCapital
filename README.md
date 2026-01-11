# TwineCapital

Intelligent accounting platform with AI-powered insights for small businesses.

## 🚀 Features

- **Invoice Management** - Create, send, and track professional invoices
- **PDF Generation** - Download beautiful PDF invoices
- **Email Integration** - Send invoices directly to clients
- **Expense Tracking** - Track and categorize business expenses
- **Client Management** - Manage customer database
- **AI Assistant** - Gemini-powered invoice generation
- **Multi-tenant** - Secure data isolation with RLS
- **Subscription Billing** - Integrated payment processing

## 🛠️ Tech Stack

- **Framework:** Next.js 16
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **Email:** Resend + React Email
- **PDF:** @react-pdf/renderer
- **AI:** Google Gemini
- **Payments:** Flutterwave

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account (for emails)
- Gemini API key
- Flutterwave account (for payments)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jamal-Chak/Accounting-software-TwineCapital.git
   cd Accounting-software-TwineCapital/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys and configuration

4. **Run database migrations**
   - Go to your Supabase project
   - Run SQL scripts in `migrations/` folder

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre/post-deployment checklist
- [Environment Variables](./.env.example) - Required configuration

## 🔐 Security

- Row-Level Security (RLS) enabled on all tables
- Server-side authentication on all operations
- Encrypted sensitive data
- Secure API key management

## 🧪 Testing

```bash
# Run build
npm run build

# Check for errors
npm run lint
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

For issues and questions:
- GitHub Issues
- Email: support@twinecapital.com

## 🎯 Roadmap

- [x] Invoice management
- [x] PDF generation
- [x] Email notifications
- [ ] Banking integration
- [ ] Advanced reporting
- [ ] Mobile app

---

**Built with ❤️ for small businesses**
