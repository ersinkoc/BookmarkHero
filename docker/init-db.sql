-- Initialize database with basic configuration
-- This file is automatically executed when the PostgreSQL container starts

-- Ensure the database exists
SELECT 'CREATE DATABASE bookmarkhero_clone'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookmarkhero_clone')\gexec

-- Create extensions if needed (add any PostgreSQL extensions here)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';