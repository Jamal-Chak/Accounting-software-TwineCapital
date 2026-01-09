# TwineCapital - Complete Deployment Guide

## 🚀 Quick Deploy (Vercel - Recommended)

### Prerequisites
- GitHub account
- Supabase account
- Vercel account (free tier works)

### Step 1: Push to GitHub (if not done)
```bash
cd c:\Users\Tessl\Documents\TwineCapital\web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/twinecapital.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Vercel will auto-detect Next.js
5. **Don't deploy yet** - add environment variables first

### Step 3: Add Environment Variables
In Vercel project settings → Environment Variables, add:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ENCRYPTION_KEY=generate-with-command-below
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Optional (add later):**
```
RESEND_API_KEY=your-resend-key
STITCH_CLIENT_ID=your-stitch-id
STITCH_CLIENT_SECRET=your-stitch-secret
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
```

### Step 4: Deploy!
Click "Deploy" - takes ~2 minutes

### Step 5: Set up Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project (or use existing)
3. Go to SQL Editor
4. Copy/paste contents of `migrations/setup_auth.sql`
5. Click "Run"
6. Go to Authentication → Providers → Email
7. **Turn OFF** "Confirm email"
8. Save

### Step 6: Test Your Deployment
1. Visit your-app.vercel.app
2. Click "Get Started"
3. Create account
4. Login
5. You're live! 🎉

---

## 🚂 Alternative: Railway Deploy

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repo
5. Railway auto-detects Next.js

### Step 3: Add Environment Variables
Same as Vercel (Step 3 above)

### Step 4: Custom Domain (Optional)
Railway provides: `your-app.up.railway.app`
Or add custom domain in settings

### Step 5: Supabase Setup
Same as Vercel (Step 5 above)

---

## 📋 Complete Deployment Checklist

### Pre-Deployment
- [ ] Code committed to GitHub
- [ ] Supabase project created
- [ ] Environment variables ready
- [ ] Encryption key generated

### Deployment
- [ ] Platform chosen (Vercel/Railway)
- [ ] Repo connected
- [ ] Environment variables set
- [ ] First deployment successful

### Post-Deployment
- [ ] Health check passes: `your-app.com/api/health`
- [ ] Supabase SQL migration run
- [ ] Email confirmation disabled
- [ ] First user account created
- [ ] Login/signup tested
- [ ] Invoice creation tested
- [ ] All major features verified

### Optional Integrations
- [ ] Resend email configured
- [ ] Flutterwave payments configured
- [ ] Stitch banking configured
- [ ] Gemini AI configured

---

## 🔍 Verification Steps

### 1. Health Check
Visit: `https://your-app.com/api/health`

Should see:
```json
{
  "status": "healthy",
  "checks": {
    "supabase": { "status": "ok" },
    "encryption": { "status": "ok" }
  }
}
```

### 2. Test Authentication
1. Go to `/signup`
2. Create account
3. Should redirect to `/dashboard`
4. Logout and login again

### 3. Test Core Features
- [ ] Create a client
- [ ] Create an invoice
- [ ] View dashboard
- [ ] Check analytics

---

## 🐛 Troubleshooting

### "Supabase connection error"
- Check environment variables are set
- Verify Supabase URL and key are correct
- Check Supabase project is active

### "Email confirmation required"
- Go to Supabase → Authentication → Email
- Turn OFF "Confirm email"
- Try signup again

### "Cannot create company"
- Run SQL migration: `migrations/setup_auth.sql`
- Check RLS policies are created

### "Dev bypass not working in production"
**This is correct!** Dev bypass auto-disables in production.
Use real signup/login instead.

---

## 📊 Production Monitoring

### Check Application Health
```bash
curl https://your-app.com/api/health
```

### Monitor Logs
- **Vercel**: Dashboard → Deployments → View Logs
- **Railway**: Dashboard → Deployment → Logs

### Database Monitoring
- **Supabase**: Dashboard → Database → Statistics

---

## 🎯 Next Steps After Deployment

### Immediate
1. Create your admin account
2. Add company information
3. Create your first invoice
4. Invite team members

### Optional Enhancements
1. Add custom domain
2. Set up email service (Resend)
3. Enable payment processing
4. Connect bank accounts
5. Configure AI features

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Health check returns "healthy"
- ✅ You can signup/login
- ✅ Dashboard loads properly
- ✅ You can create invoices
- ✅ All navigation works
- ✅ No console errors

**Congratulations! You're live! 🎉**
