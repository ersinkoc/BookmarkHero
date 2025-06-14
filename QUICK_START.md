# 🚀 Quick Start Guide - BookmarkHero

## ✅ **Current Status: WORKING**

All problems have been fixed! The application is ready to use.

## 🎯 **Three Ways to Start**

### **Option 1: One-Command Start (Recommended)**
```bash
npm start
```
This will:
- Start database services with Docker
- Set up database schema
- Start both API and Web servers

### **Option 2: Manual with Docker Databases**
```bash
# 1. Start database services
npm run docker:simple

# 2. Set up database schema
cd apps/api && npx prisma db push && cd ../..

# 3. Start development servers
npm run dev
```

### **Option 3: Completely Manual**
```bash
# 1. Install and start PostgreSQL and Redis manually
# 2. Update DATABASE_URL in apps/api/.env
# 3. Set up schema: cd apps/api && npx prisma db push
# 4. Start servers: npm run dev
```

## 🌐 **Access URLs**

After starting:
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Database**: localhost:5432 (postgres/postgres/bookmarkhero)
- **Redis**: localhost:6379

## 📝 **First Steps**

1. **Create Account**: Go to http://localhost:3000 → Register
2. **Add Bookmark**: Click "Add Bookmark" button
3. **Create Collection**: Use "+" next to Collections in sidebar
4. **Search & Filter**: Use search bar and filter options

## 🛠️ **Development Commands**

```bash
# Start everything
npm start

# Start only databases
npm run docker:simple

# Stop databases
npm run docker:stop

# Development mode (after databases are running)
npm run dev

# Build everything
npm run build

# Type checking
npm run type-check --workspace=apps/web
npm run build --workspace=apps/api
```

## 🔧 **Troubleshooting**

### **Port Already in Use**
```bash
# Stop Docker containers
npm run docker:stop
# Or kill processes on ports
lsof -ti:3000,3001,5432,6379 | xargs kill -9
```

### **Database Connection Issues**
```bash
# Check if databases are running
docker ps
# Restart databases
npm run docker:stop && npm run docker:simple
```

### **Build Issues**
```bash
# Clean and reinstall
npm run clean
npm install
```

## ✨ **Features Available**

### ✅ **Working Features**
- User registration and login
- Add bookmarks with automatic metadata extraction
- Create collections (folders) with nested structure  
- Tag system with color coding
- Search and filter bookmarks
- Grid/list view toggle
- Favorites and archive
- Real-time updates across browser tabs
- Dark/light/system theme
- Responsive design

### 🔧 **API Endpoints Ready**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login  
- `GET /api/bookmarks` - Get bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/collections` - Get collections
- `POST /api/collections` - Create collection
- `GET /api/tags` - Get tags
- And many more...

## 📊 **Technical Stack**

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + React Query
- **Real-time**: Socket.io
- **Development**: Docker Compose + Hot reload

## 🎉 **You're Ready!**

The bookmark manager is fully functional. Start with `npm start` and begin!