#!/bin/bash

echo "🚀 Starting BookmarkHero Development Environment..."

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detected - checking database services..."
    
    # Check if containers are already running
    if docker ps | grep -q "postgres:15-alpine" && docker ps | grep -q "redis:7-alpine"; then
        echo "✅ Database services are already running"
        echo "📊 PostgreSQL: localhost:5432"
        echo "🔴 Redis: localhost:6379"
    else
        echo "🔧 Starting database services..."
        
        # Clean up any existing containers and networks
        docker-compose -f docker/docker-compose.simple.yml down --remove-orphans 2>/dev/null
        docker network prune -f 2>/dev/null
        
        # Start database services
        docker-compose -f docker/docker-compose.simple.yml up -d
        
        if [ $? -eq 0 ]; then
            echo "✅ Database services started successfully"
            echo "📊 PostgreSQL: localhost:5432"
            echo "🔴 Redis: localhost:6379"
        else
            echo "❌ Failed to start database services"
            echo "⚠️  Using existing services or install PostgreSQL and Redis manually"
        fi
    fi
else
    echo "⚠️  Docker not available - please ensure PostgreSQL and Redis are running"
    echo "📊 PostgreSQL should be on localhost:5432"
    echo "🔴 Redis should be on localhost:6379"
fi

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Set up database schema
echo "🗄️  Setting up database schema..."
cd apps/api

if npx prisma db push; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Failed to create database schema"
    echo "Please check your DATABASE_URL in apps/api/.env"
    exit 1
fi

cd ../..

# Start development servers
echo "🎯 Starting development servers..."
echo "📱 Web app will be available at: http://localhost:3000"
echo "🔧 API will be available at: http://localhost:3001"
echo ""
echo "Starting servers..."

# Start both services
npm run dev