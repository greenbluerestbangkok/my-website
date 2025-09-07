#!/bin/bash

# Prompt Template Lab Deployment Script
# This script helps deploy the application to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_warning "Docker is not installed. Docker deployment will not be available."
    fi
    
    if ! command_exists docker-compose; then
        print_warning "Docker Compose is not installed. Docker deployment will not be available."
    fi
    
    print_success "Prerequisites check completed."
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully."
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f backend/.env ]; then
        print_status "Creating .env file from template..."
        cp backend/env.example backend/.env
        print_warning "Please edit backend/.env with your actual configuration values."
    else
        print_status ".env file already exists."
    fi
    
    print_success "Environment setup completed."
}

# Create admin user
create_admin() {
    print_status "Creating admin user..."
    
    cd backend
    node create-admin.js
    cd ..
    
    print_success "Admin user creation completed."
}

# Build application
build_application() {
    print_status "Building application..."
    
    # Copy frontend files to nginx directory
    mkdir -p frontend
    cp *.html frontend/
    
    print_success "Application built successfully."
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command_exists docker || ! command_exists docker-compose; then
        print_error "Docker and Docker Compose are required for this deployment method."
        exit 1
    fi
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose up -d --build
    
    print_success "Application deployed with Docker successfully!"
    print_status "Application is running at: http://localhost"
    print_status "API is running at: http://localhost/api"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command_exists heroku; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in to Heroku
    if ! heroku auth:whoami >/dev/null 2>&1; then
        print_error "Please login to Heroku first: heroku login"
        exit 1
    fi
    
    # Create Heroku app if it doesn't exist
    if ! heroku apps:info >/dev/null 2>&1; then
        print_status "Creating Heroku app..."
        heroku create
    fi
    
    # Set environment variables
    print_status "Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set MONGODB_URI=$(heroku config:get MONGODB_URI || echo "mongodb://localhost:27017/prompt-template-lab")
    heroku config:set JWT_SECRET=$(openssl rand -base64 32)
    
    # Deploy
    print_status "Deploying to Heroku..."
    git add .
    git commit -m "Deploy to Heroku" || true
    git push heroku main
    
    print_success "Application deployed to Heroku successfully!"
    print_status "Application URL: $(heroku apps:info --json | jq -r '.app.web_url')"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_error "Vercel CLI is not installed. Please install it first: npm i -g vercel"
        exit 1
    fi
    
    # Deploy frontend
    print_status "Deploying frontend to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel successfully!"
    print_warning "Remember to deploy backend separately (Heroku, Railway, etc.)"
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    
    # Start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
        print_status "Starting MongoDB..."
        mongod --fork --logpath /var/log/mongodb.log
    fi
    
    # Start backend server
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend server (simple HTTP server)
    python3 -m http.server 8080 &
    FRONTEND_PID=$!
    
    print_success "Development servers started!"
    print_status "Frontend: http://localhost:8080"
    print_status "Backend API: http://localhost:3000"
    print_status "Press Ctrl+C to stop servers"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Show help
show_help() {
    echo "Prompt Template Lab Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Install dependencies and setup environment"
    echo "  build       Build the application"
    echo "  dev         Start development servers"
    echo "  admin       Create admin user"
    echo "  docker      Deploy with Docker"
    echo "  heroku      Deploy to Heroku"
    echo "  vercel      Deploy frontend to Vercel"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install dependencies and setup"
    echo "  $0 dev        # Start development servers"
    echo "  $0 docker     # Deploy with Docker"
    echo "  $0 heroku     # Deploy to Heroku"
}

# Main script
main() {
    case "${1:-help}" in
        install)
            check_prerequisites
            install_dependencies
            setup_environment
            ;;
        build)
            build_application
            ;;
        dev)
            check_prerequisites
            install_dependencies
            setup_environment
            start_dev
            ;;
        admin)
            check_prerequisites
            install_dependencies
            setup_environment
            create_admin
            ;;
        docker)
            check_prerequisites
            install_dependencies
            setup_environment
            build_application
            deploy_docker
            ;;
        heroku)
            check_prerequisites
            install_dependencies
            setup_environment
            build_application
            deploy_heroku
            ;;
        vercel)
            check_prerequisites
            build_application
            deploy_vercel
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
