#!/bin/bash

echo "🚀 AI Study Platform - Quick Start Setup"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi
echo "✅ Python 3 found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js found"

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "   Install with: brew install postgresql@14"
    exit 1
fi
echo "✅ PostgreSQL found"

echo ""
echo "Setting up Python backend..."
cd python

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -q -r requirements.txt
echo "✅ Python dependencies installed"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp ../.env.example .env
    echo "✅ .env file created (please configure it)"
fi

cd ..

echo ""
echo "Setting up Frontend..."
cd frontend

# Install Node dependencies
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
fi
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "Setting up Database..."

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw alnpj; then
    echo "✅ Database 'alnpj' already exists"
else
    psql -U postgres -c "CREATE DATABASE alnpj;"
    echo "✅ Database created"
fi

# Run schema
PGPASSWORD=123456 psql -U postgres -d alnpj < database/schema.sql 2>/dev/null
echo "✅ Database schema applied (knowledge schema)"

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure LM Studio is running at http://127.0.0.1:1234"
echo ""
echo "2. Start the Python backend:"
echo "   cd python"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   pnpm dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy studying! 📚"
