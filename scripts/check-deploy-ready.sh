#!/bin/bash

echo "🚀 TwineCapital - Quick Deploy Check"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized"
    echo "   Run: git init"
    exit 1
fi

echo "✅ Git initialized"

# Check environment file
if [ ! -f .env.local ]; then
    echo "⚠️  No .env.local found"
else
    echo "✅ Environment file exists"
fi

# Check for required files
FILES=("package.json" "next.config.js" "vercel.json" ".env.production.example")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "⚠️  $file missing"
    fi
done

# Check node_modules
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
    exit 1
fi

# Try to build
echo ""
echo "🔨 Testing production build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check errors with: npm run build"
    exit 1
fi

echo ""
echo "✨ Deploy readiness: READY"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy to Vercel: https://vercel.com/new"
echo "3. Or Railway: https://railway.app/new"
echo ""
