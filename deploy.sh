#!/bin/bash

# PWA Chatbot Deployment Script
# This script handles production deployment with Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

print_error() {
    print_message "$1" "$RED"
}

print_success() {
    print_message "$1" "$GREEN"
}

print_warning() {
    print_message "$1" "$YELLOW"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Do not run this script as root"
    exit 1
fi

# Check dependencies
print_message "Checking dependencies..." "$GREEN"

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "✓ Dependencies OK"

# Check for .env.production
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_message "Please create it from .env.production.example and configure your API keys." "$YELLOW"
    exit 1
fi

# Validate critical environment variables
print_message "Validating environment configuration..." "$GREEN"

source .env.production

if [ "$SECRET_KEY" == "CHANGE-ME-GENERATE-RANDOM-SECRET-KEY" ] || [ -z "$SECRET_KEY" ]; then
    print_error "SECRET_KEY not configured in .env.production"
    print_message "Generate one with: python3 -c \"import secrets; print(secrets.token_hex(32))\"" "$YELLOW"
    exit 1
fi

if [ "$OPENAI_API_KEY" == "YOUR-OPENAI-API-KEY-HERE" ] || [ -z "$OPENAI_API_KEY" ]; then
    print_error "OPENAI_API_KEY not configured in .env.production"
    print_message "Get one from: https://platform.openai.com/api-keys" "$YELLOW"
    exit 1
fi

print_success "✓ Environment configuration OK"

# Build images
print_message "Building Docker images..." "$GREEN"

if docker compose build; then
    print_success "✓ Images built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Stop existing containers
print_message "Stopping existing containers..." "$GREEN"
docker compose down || true

# Start services
print_message "Starting services..." "$GREEN"

if docker compose --env-file .env.production up -d; then
    print_success "✓ Services started"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be healthy
print_message "Waiting for services to be healthy..." "$GREEN"
sleep 10

# Check health
print_message "Checking application health..." "$GREEN"

HEALTH_CHECK=$(curl -s http://localhost:5001/api/health || echo "failed")

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    print_success "✓ Application is healthy!"
    echo "$HEALTH_CHECK" | python3 -m json.tool
else
    print_error "Health check failed!"
    print_message "Check logs with: docker compose logs" "$YELLOW"
    exit 1
fi

# Show running containers
print_message "\nRunning containers:" "$GREEN"
docker compose ps

print_success "\n🎉 Deployment successful!"
print_message "\nNext steps:" "$GREEN"
print_message "1. Configure your reverse proxy (nginx/caddy) with SSL"
print_message "2. Point your domain to this server"
print_message "3. Test at: http://localhost:5001"
print_message "\nView logs: docker compose logs -f"
print_message "Stop services: docker compose down"
