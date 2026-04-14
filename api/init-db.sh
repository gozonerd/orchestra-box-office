#!/bin/bash
# Initialize local PostgreSQL database for development

set -e

# Configuration
DATABASE_NAME="orchestra_dev"
DATABASE_USER="orchestra"
DATABASE_PASSWORD="orchestra-dev-password"
DATABASE_PORT="5432"

echo "🗄️ Orchestra Box Office Database Setup"
echo "======================================"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Install PostgreSQL and try again."
    exit 1
fi

# Create database and user
echo "Creating database and user..."
psql -U postgres -p $DATABASE_PORT <<EOF
CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';
CREATE DATABASE $DATABASE_NAME OWNER $DATABASE_USER;
ALTER DATABASE $DATABASE_NAME SET timezone = 'UTC';
EOF

# Run migrations
echo "Running migrations..."
PGPASSWORD=$DATABASE_PASSWORD psql -U $DATABASE_USER -d $DATABASE_NAME -p $DATABASE_PORT -f migrations/20260413_init.sql

# Verify
echo "Verifying schema..."
PGPASSWORD=$DATABASE_PASSWORD psql -U $DATABASE_USER -d $DATABASE_NAME -p $DATABASE_PORT <<EOF
\dt
\di
EOF

echo "✅ Database initialized successfully!"
echo ""
echo "Connection string:"
echo "postgresql://$DATABASE_USER:$DATABASE_PASSWORD@localhost:$DATABASE_PORT/$DATABASE_NAME"
echo ""
echo "To connect:"
echo "  psql -U $DATABASE_USER -d $DATABASE_NAME -p $DATABASE_PORT"
