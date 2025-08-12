-- Production database initialization script
-- This script runs automatically in Docker environments

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE lms_production' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lms_production');

-- Connect to the database
\c lms_production;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application user (if needed for specific deployments)
-- This is optional and typically handled by the connection string
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lms_app') THEN
        CREATE ROLE lms_app WITH LOGIN PASSWORD 'secure_app_password';
        GRANT CONNECT ON DATABASE lms_production TO lms_app;
        GRANT USAGE ON SCHEMA public TO lms_app;
        GRANT CREATE ON SCHEMA public TO lms_app;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lms_app;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lms_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lms_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lms_app;
    END IF;
END $$;