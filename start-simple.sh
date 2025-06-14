#!/bin/bash

echo "🚀 Starting BookmarkHero Development Servers..."

# Check if databases are available
echo "🔍 Checking database connections..."

# Test PostgreSQL connection
if timeout 5 bash -c "</dev/tcp/localhost/5432" 2>/dev/null; then
    echo "✅ PostgreSQL is available on localhost:5432"
else
    echo "❌ PostgreSQL not available on localhost:5432"
    echo "Please start PostgreSQL or run: npm run docker:simple"
    exit 1
fi

# Test Redis connection
if timeout 5 bash -c "</dev/tcp/localhost/6379" 2>/dev/null; then
    echo "✅ Redis is available on localhost:6379"
else
    echo "❌ Redis not available on localhost:6379"
    echo "Please start Redis or run: npm run docker:simple"
    exit 1
fi

# Set up database schema if needed
echo "🗄️  Setting up database schema..."
if [ -d "apps/api" ]; then
    cd apps/api
    
    if npx prisma db push 2>/dev/null; then
        echo "✅ Database schema is ready"
    else
        echo "⚠️  Database schema already exists or connection issue"
    fi
    
    cd ../..
else
    echo "⚠️  Could not find apps/api directory"
fi

# Start development servers
echo "🎯 Starting development servers..."
echo ""
echo "📱 Web app will be available at: http://localhost:3000"
echo "🔧 API will be available at: http://localhost:3001"
echo "📊 Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "🚀 Starting servers..."
echo ""

# Start both services
npm run dev