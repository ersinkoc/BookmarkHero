#!/bin/bash

echo "🚀 Setting up BookmarkHero..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create environment file for API
echo "⚙️ Setting up environment..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created API environment file (apps/api/.env)"
    echo "📝 Please edit apps/api/.env with your configurations"
else
    echo "✅ API environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development environment:"
echo "1. Edit apps/api/.env with your database and Redis configurations"
echo "2. Run: npm run docker:dev"
echo ""
echo "Or start services manually:"
echo "1. Start PostgreSQL and Redis"
echo "2. Run: cd apps/api && npx prisma db push"
echo "3. Run: npm run dev"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- API: http://localhost:3001"
echo "- Database: localhost:5432"
echo "- Redis: localhost:6379"