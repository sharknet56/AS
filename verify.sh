#!/bin/bash

# Installation Verification Script
# This script checks if all necessary components are installed

echo "🔍 Checking Installation Requirements..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Found Python $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo "  Please install Python 3.8 or higher"
fi

# Check pip
echo -n "Checking pip... "
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Found pip $PIP_VERSION${NC}"
else
    echo -e "${RED}✗ pip not found${NC}"
    echo "  Please install pip3"
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Found Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Please install Node.js 16 or higher"
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Found npm $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    echo "  Please install npm"
fi

echo ""
echo "📁 Checking Project Structure..."
echo ""

# Check backend directory
if [ -d "backend" ]; then
    echo -e "${GREEN}✓ backend/ directory exists${NC}"
    
    # Check backend files
    if [ -f "backend/requirements.txt" ]; then
        echo -e "  ${GREEN}✓ requirements.txt exists${NC}"
    else
        echo -e "  ${RED}✗ requirements.txt missing${NC}"
    fi
    
    if [ -f "backend/.env" ]; then
        echo -e "  ${GREEN}✓ .env exists${NC}"
    else
        echo -e "  ${YELLOW}⚠ .env missing (will be created)${NC}"
    fi
    
    if [ -d "backend/app" ]; then
        echo -e "  ${GREEN}✓ app/ directory exists${NC}"
    else
        echo -e "  ${RED}✗ app/ directory missing${NC}"
    fi
else
    echo -e "${RED}✗ backend/ directory missing${NC}"
fi

# Check frontend directory
if [ -d "frontend" ]; then
    echo -e "${GREEN}✓ frontend/ directory exists${NC}"
    
    # Check frontend files
    if [ -f "frontend/package.json" ]; then
        echo -e "  ${GREEN}✓ package.json exists${NC}"
    else
        echo -e "  ${RED}✗ package.json missing${NC}"
    fi
    
    if [ -d "frontend/src" ]; then
        echo -e "  ${GREEN}✓ src/ directory exists${NC}"
    else
        echo -e "  ${RED}✗ src/ directory missing${NC}"
    fi
else
    echo -e "${RED}✗ frontend/ directory missing${NC}"
fi

# Check scripts
echo ""
echo "🔧 Checking Scripts..."
echo ""

if [ -f "start.sh" ]; then
    echo -e "${GREEN}✓ start.sh exists${NC}"
    if [ -x "start.sh" ]; then
        echo -e "  ${GREEN}✓ start.sh is executable${NC}"
    else
        echo -e "  ${YELLOW}⚠ start.sh not executable (run: chmod +x start.sh)${NC}"
    fi
else
    echo -e "${RED}✗ start.sh missing${NC}"
fi

if [ -f "stop.sh" ]; then
    echo -e "${GREEN}✓ stop.sh exists${NC}"
    if [ -x "stop.sh" ]; then
        echo -e "  ${GREEN}✓ stop.sh is executable${NC}"
    else
        echo -e "  ${YELLOW}⚠ stop.sh not executable (run: chmod +x stop.sh)${NC}"
    fi
else
    echo -e "${RED}✗ stop.sh missing${NC}"
fi

echo ""
echo "📚 Checking Documentation..."
echo ""

DOCS=("README.md" "SETUP.md" "ARCHITECTURE.md" "TESTING.md" "QUICK_REFERENCE.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc${NC}"
    else
        echo -e "${RED}✗ $doc missing${NC}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if backend virtual environment exists
if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✓ Backend virtual environment exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend virtual environment not set up yet${NC}"
    echo "  Run: cd backend && python3 -m venv venv"
fi

# Check if frontend node_modules exists
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies not installed yet${NC}"
    echo "  Run: cd frontend && npm install"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "If all checks passed, you can start the application with:"
echo "  ${GREEN}./start.sh${NC}"
echo ""
echo "If you see any errors or warnings above, please:"
echo "  1. Install missing requirements"
echo "  2. Run the installation commands shown"
echo "  3. Run this script again to verify"
echo ""
echo "For detailed setup instructions, see: ${GREEN}SETUP.md${NC}"
echo ""
