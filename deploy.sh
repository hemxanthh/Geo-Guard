#!/bin/bash

# Geo Guard Production Deployment Script
echo "🚀 Starting Geo Guard Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install backend dependencies
print_status "Installing backend dependencies..."
if npm install; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd project
if npm install; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Build frontend for production
print_status "Building frontend for production..."
if npm run build; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

cd ..

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Copy environment example
if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_warning "Please update .env file with your production values!"
else
    print_warning ".env file already exists. Please verify configuration."
fi

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed globally. Install with: npm install -g pm2"
else
    print_status "PM2 version: $(pm2 --version)"
fi

print_success "🎉 Deployment preparation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your production configuration"
echo "2. Set up your production database"
echo "3. Configure your domain and SSL certificates"
echo "4. Start the application with: pm2 start ecosystem.config.js --env production"
echo "5. Configure Nginx reverse proxy"
echo "6. Test all features in production environment"
echo ""
echo "📖 For detailed instructions, see PRODUCTION_DEPLOYMENT_GUIDE.md"
