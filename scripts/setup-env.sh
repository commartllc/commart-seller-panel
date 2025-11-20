#!/bin/bash

# Environment Setup Helper Script
# This script helps set up environment variables for the project

echo "Commart Seller Panel - Environment Setup"
echo "========================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "Warning: .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Copy example file
cp .env.example .env.local

echo "Created .env.local from .env.example"
echo ""
echo "Please edit .env.local and fill in your credentials:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - N8N_WEBHOOK_PRODUCT_UPDATE (optional)"
echo "  - N8N_WEBHOOK_ORDER_UPDATE (optional)"
echo ""
echo "Then run: npm run dev"
