# 🌟 BookmarkHero - Modern Bookmark Manager

A full-stack bookmark manager, built with cutting-edge technologies and comprehensive security features.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Features

### 🔐 **Authentication & Security**
- ✅ User registration and login with JWT
- ✅ Email verification system with beautiful templates
- ✅ Password reset functionality
- ✅ Zod schema validation on all inputs
- ✅ Rate limiting (auth: 5/15min, API: 100/15min)
- ✅ CORS, helmet security headers, XSS protection
- ✅ SSRF protection for URL extraction
- ✅ Input sanitization with DOMPurify

### 📚 **Bookmark Management**
- ✅ Create, read, update, delete bookmarks
- ✅ Automatic metadata extraction from URLs
- ✅ Full-text search across titles, descriptions, URLs
- ✅ Bulk import with duplicate detection
- ✅ Favorites and archive functionality

### 📁 **Organization**
- ✅ Collections (folders) with color coding
- ✅ Tag system with regex validation
- ✅ Public/private collection sharing
- ✅ Hierarchical organization

### 🔗 **Sharing & Export**
- ✅ Share collections with secure tokens
- ✅ Export bookmarks (JSON, CSV, HTML, Netscape)
- ✅ Real-time updates with Socket.io
- ✅ Public collection viewing

### 🎨 **User Experience**
- ✅ Dark/light/system theme support
- ✅ Grid and list view modes
- ✅ Responsive mobile-first design
- ✅ Real-time notifications
- ✅ Optimistic UI updates

### 🔧 **Developer Features**
- ✅ Comprehensive test coverage (Jest + Supertest)
- ✅ TypeScript throughout with strict type checking
- ✅ Docker support with multi-stage builds
- ✅ Health checks for all services
- ✅ Database migrations and seeding
- ✅ Structured logging with Winston
- ✅ API documentation

## 🚀 Quick Start

### Demo Account
Try immediately with our demo account:
- **URL**: http://localhost:3000 (after setup)
- **Email**: `demo@bookmark-hero.com`
- **Password**: `Demo123!Pass`

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose

### 1. Clone and Install
```bash
git clone <repository-url>
cd bookmark-hero
npm install
```

### 2. Quick Setup (Recommended)
```bash
# Start databases
npm run docker:simple

# Setup database and seed data
npm run db:setup

# Start development servers
npm run dev
```

### 3. Access the Application
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and metadata
- **Real-time**: Socket.io
- **Validation**: Zod schemas
- **Testing**: Jest with Supertest
- **Deployment**: Docker with health checks

### Project Structure
```
bookmark-hero/
├── apps/
│   ├── api/                 # Express API server
│   │   ├── src/
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── middleware/  # Auth, validation, rate limiting
│   │   │   ├── routes/      # API routes with validation
│   │   │   ├── services/    # Business logic (email, export, metadata)
│   │   │   ├── utils/       # Errors, sanitization, logging
│   │   │   ├── validators/  # Zod validation schemas
│   │   │   └── __tests__/   # Comprehensive test suite
│   │   └── prisma/          # Database schema and migrations
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # App router pages
│           ├── components/  # React components
│           ├── contexts/    # Auth and Socket contexts
│           └── services/    # API clients
├── packages/
│   └── types/               # Shared TypeScript types
└── docker/                  # Production-ready Docker configs
```

## 🔌 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/register              // User registration
POST /api/auth/login                 // User login
POST /api/auth/logout                // User logout
POST /api/auth/refresh               // Refresh access token
GET  /api/auth/me                    // Get current user

// Email verification
POST /api/auth/verify-email/request  // Request verification email
POST /api/auth/verify-email          // Verify email with token
POST /api/auth/verify-email/resend   // Resend verification email

// Password reset
POST /api/auth/password-reset/request // Request password reset
POST /api/auth/password-reset         // Reset password with token
```

### Bookmark Endpoints
```typescript
GET    /api/bookmarks                   // Get user bookmarks (paginated)
POST   /api/bookmarks                   // Create bookmark
GET    /api/bookmarks/search            // Search bookmarks
POST   /api/bookmarks/bulk-import       // Bulk import bookmarks
POST   /api/bookmarks/extract-metadata  // Extract URL metadata (SSRF protected)
GET    /api/bookmarks/:id               // Get specific bookmark
PUT    /api/bookmarks/:id               // Update bookmark
DELETE /api/bookmarks/:id               // Delete bookmark
```

### Collection & Tag Endpoints
```typescript
GET    /api/collections                 // Get user collections
POST   /api/collections                 // Create collection
GET    /api/collections/:id             // Get specific collection
PUT    /api/collections/:id             // Update collection
DELETE /api/collections/:id             // Delete collection

GET    /api/tags                        // Get user tags
POST   /api/tags                        // Create tag
PUT    /api/tags/:id                    // Update tag
DELETE /api/tags/:id                    // Delete tag
```

### Export & Share Endpoints
```typescript
GET /api/export/formats                 // Get available export formats
GET /api/export/bookmarks               // Export bookmarks (JSON/CSV/HTML/Netscape)

GET    /api/shares                      // Get user shares
POST   /api/shares                      // Create share
GET    /api/shares/public/:token        // Get public collection
DELETE /api/shares/:id                  // Delete share
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm run test --workspace=apps/api

# Run with coverage
npm run test:coverage --workspace=apps/api

# Watch mode for development
npm run test:watch --workspace=apps/api

# Run specific test file
npm run test auth.test.ts --workspace=apps/api
```

### Test Coverage
- ✅ Authentication flows (register, login, refresh, logout)
- ✅ Bookmark CRUD operations with real database
- ✅ Input validation with Zod schemas
- ✅ Error handling and HTTP status codes
- ✅ Security features (rate limiting, validation)

## 🐳 Docker Deployment

### Development Environment
```bash
# Databases only (recommended for development)
npm run docker:simple

# Full development environment
npm run docker:dev
```

### Production Deployment
```bash
# Full production stack with nginx
docker-compose -f docker/docker-compose.full.yml up -d

# With environment variables
JWT_SECRET=your-32-char-secret \
JWT_REFRESH_SECRET=your-32-char-refresh-secret \
docker-compose -f docker/docker-compose.full.yml up -d
```

### Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key-32chars-minimum
JWT_REFRESH_SECRET=your-refresh-secret-32chars-minimum

# Optional
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
NODE_ENV=production

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔧 Database Management

### Setup and Migrations
```bash
cd apps/api

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Reset database (⚠️ destructive!)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 🚨 Security Features

### Input Validation & Sanitization
- Zod schema validation on all API endpoints
- HTML sanitization with DOMPurify
- URL validation to prevent SSRF attacks
- File upload restrictions and validation

### Rate Limiting (Express Rate Limit)
- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- Bulk operations: 10 requests per hour
- IP-based tracking with Redis storage

### Security Headers (Helmet.js)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- CORS with specific allowed origins

### Authentication Security
- JWT with secure random secrets (32+ characters)
- Refresh token rotation with unique token IDs
- Password hashing with bcrypt (12 rounds)
- Session invalidation on password reset
- Email verification before account activation

## 📊 Monitoring & Health Checks

### Health Endpoints
- **API Health**: `GET /health`
- **Database**: Connection and query testing
- **Redis**: Cache connectivity testing
- **Docker**: Built-in health checks for all services

### Logging & Monitoring
- Structured logging with Winston
- Request/response logging with Morgan
- Error tracking with stack traces
- Performance monitoring
- Docker health checks with retry logic

## 🔨 Development Scripts

```bash
# Development
npm run dev                  # Start both API and web
npm run dev:api             # Start API server only
npm run dev:web             # Start web app only

# Building
npm run build               # Build all applications
npm run build --workspace=apps/api  # Build specific workspace

# Testing
npm run test                # Run all tests
npm run test:coverage       # Run tests with coverage
npm run test:watch          # Watch mode for tests

# Database
npm run db:generate         # Generate Prisma client
npm run db:push            # Push schema to database
npm run db:migrate         # Create and run migrations
npm run db:seed            # Seed with demo data
npm run db:reset           # Reset database
npm run db:studio          # Open Prisma Studio

# Docker
npm run docker:simple      # Start databases only
npm run docker:dev         # Start development environment
npm run docker:full        # Start production environment
npm run docker:stop        # Stop all containers

# Code Quality
npm run lint               # Lint all code
npm run type-check         # TypeScript type checking
```

## 🚀 Performance Optimizations

### Caching Strategy
- Redis caching for extracted metadata (1 hour TTL)
- Database query optimization with proper indexing
- Static asset caching with nginx
- Gzip compression for API responses

### Database Optimizations
- Indexes on frequently queried fields (userId, email, URL)
- Pagination for large datasets
- Efficient join queries with Prisma
- Connection pooling

### Frontend Optimizations
- Next.js static generation where possible
- Image optimization and lazy loading
- Component-level code splitting
- Optimistic UI updates for better UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm run test`
5. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new functionality
- Use conventional commit messages
- Update documentation for API changes
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Comprehensive security implementation
- Production-ready architecture and deployment
- Community-driven development approach

---

**🔖 Happy bookmarking with a secure, modern, and feature-rich bookmark manager!**

For support, feature requests, or bug reports, please open an issue on GitHub.