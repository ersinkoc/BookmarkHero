#!/bin/bash

echo "🧪 Testing application startup..."

# Check if we can build both apps
echo "📦 Building API..."
if npm run build --workspace=apps/api; then
    echo "✅ API builds successfully"
else
    echo "❌ API build failed"
    exit 1
fi

echo "📦 Building Web app..."
if timeout 60 npm run build --workspace=apps/web; then
    echo "✅ Web app builds successfully"
else
    echo "❌ Web app build failed or timed out"
    exit 1
fi

echo "🎉 All builds successful!"

# Test if dependencies are properly installed
echo "🔍 Checking dependencies..."

# Check API dependencies
echo "Checking API dependencies..."
if npm list --workspace=apps/api > /dev/null 2>&1; then
    echo "✅ API dependencies OK"
else
    echo "❌ API dependencies missing"
fi

# Check Web dependencies  
echo "Checking Web dependencies..."
if npm list --workspace=apps/web > /dev/null 2>&1; then
    echo "✅ Web dependencies OK"
else
    echo "❌ Web dependencies missing"
fi

echo "🎯 Ready for development!"
echo ""
echo "To start development:"
echo "1. Set up your database (PostgreSQL) and Redis"
echo "2. Edit apps/api/.env with your database URL"
echo "3. Run: cd apps/api && npx prisma db push"
echo "4. Run: npm run dev"
echo ""
echo "Or use Docker:"
echo "1. Run: npm run docker:dev"