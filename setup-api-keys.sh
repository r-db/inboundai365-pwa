#!/bin/bash

# API Key Setup Script
# Interactive script to help configure API keys and secrets

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}PWA Chatbot API Key Setup${NC}"
echo -e "${GREEN}================================${NC}\n"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production from template...${NC}"
    cp .env.production.example .env.production
fi

# Function to generate secret key
generate_secret() {
    python3 -c "import secrets; print(secrets.token_hex(32))"
}

# Function to update env file
update_env() {
    local key=$1
    local value=$2
    local file=".env.production"

    if grep -q "^${key}=" "$file"; then
        # Update existing key
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    else
        # Add new key
        echo "${key}=${value}" >> "$file"
    fi
}

echo -e "${YELLOW}Step 1: Generate SECRET_KEY${NC}"
echo "A secure random key is required for session management."
echo -n "Generate a new SECRET_KEY? (Y/n): "
read -r generate_secret_input

if [ "$generate_secret_input" != "n" ] && [ "$generate_secret_input" != "N" ]; then
    SECRET_KEY=$(generate_secret)
    update_env "SECRET_KEY" "$SECRET_KEY"
    echo -e "${GREEN}✓ SECRET_KEY generated and saved${NC}\n"
else
    echo -e "${YELLOW}Skipping SECRET_KEY generation${NC}\n"
fi

echo -e "${YELLOW}Step 2: Configure OpenAI API Key${NC}"
echo "Get your API key from: https://platform.openai.com/api-keys"
echo -n "Enter your OpenAI API key (or press Enter to skip): "
read -r openai_key

if [ -n "$openai_key" ]; then
    update_env "OPENAI_API_KEY" "$openai_key"
    echo -e "${GREEN}✓ OpenAI API key saved${NC}\n"
else
    echo -e "${YELLOW}Skipping OpenAI API key${NC}\n"
fi

echo -e "${YELLOW}Step 3: Configure Anthropic API Key (Optional)${NC}"
echo "Get your API key from: https://console.anthropic.com/"
echo -n "Enter your Anthropic API key (or press Enter to skip): "
read -r anthropic_key

if [ -n "$anthropic_key" ]; then
    update_env "ANTHROPIC_API_KEY" "$anthropic_key"
    echo -e "${GREEN}✓ Anthropic API key saved${NC}\n"
else
    echo -e "${YELLOW}Skipping Anthropic API key${NC}\n"
fi

echo -e "${YELLOW}Step 4: Configure Domain${NC}"
echo -n "Enter your domain (e.g., yourdomain.com) or press Enter to skip: "
read -r domain

if [ -n "$domain" ]; then
    CORS_ORIGINS="https://${domain},https://www.${domain}"
    update_env "CORS_ORIGINS" "$CORS_ORIGINS"
    echo -e "${GREEN}✓ Domain configured${NC}\n"
else
    echo -e "${YELLOW}Skipping domain configuration${NC}\n"
fi

echo -e "${YELLOW}Step 5: HTTPS Configuration${NC}"
echo "Enable HTTPS settings (SESSION_COOKIE_SECURE and FORCE_HTTPS)?"
echo "Only say 'yes' if you have SSL/TLS configured with a reverse proxy"
echo -n "Enable HTTPS settings? (y/N): "
read -r enable_https

if [ "$enable_https" == "y" ] || [ "$enable_https" == "Y" ]; then
    update_env "SESSION_COOKIE_SECURE" "True"
    update_env "FORCE_HTTPS" "True"
    echo -e "${GREEN}✓ HTTPS settings enabled${NC}\n"
else
    update_env "SESSION_COOKIE_SECURE" "False"
    update_env "FORCE_HTTPS" "False"
    echo -e "${YELLOW}HTTPS settings disabled (for local testing)${NC}\n"
fi

# Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Configuration Summary${NC}"
echo -e "${GREEN}================================${NC}\n"

echo "Configuration saved to: .env.production"
echo ""

# Check what was configured
if grep -q "^SECRET_KEY=CHANGE-ME" ".env.production"; then
    echo -e "${RED}✗ SECRET_KEY: Not configured${NC}"
else
    echo -e "${GREEN}✓ SECRET_KEY: Configured${NC}"
fi

if grep -q "^OPENAI_API_KEY=YOUR-OPENAI-API-KEY-HERE" ".env.production" || grep -q "^OPENAI_API_KEY=$" ".env.production"; then
    echo -e "${RED}✗ OPENAI_API_KEY: Not configured${NC}"
else
    echo -e "${GREEN}✓ OPENAI_API_KEY: Configured${NC}"
fi

if grep -q "^ANTHROPIC_API_KEY=$" ".env.production" || grep -q "^ANTHROPIC_API_KEY=$" ".env.production"; then
    echo -e "${YELLOW}○ ANTHROPIC_API_KEY: Not configured (optional)${NC}"
else
    echo -e "${GREEN}✓ ANTHROPIC_API_KEY: Configured${NC}"
fi

if grep -q "^CORS_ORIGINS=https://yourdomain.com" ".env.production"; then
    echo -e "${YELLOW}○ CORS_ORIGINS: Using default (update for production)${NC}"
else
    echo -e "${GREEN}✓ CORS_ORIGINS: Configured${NC}"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review .env.production and make any additional changes"
echo "2. Run: ./deploy.sh"
echo "3. Configure your reverse proxy (nginx/caddy) with SSL"
echo ""
echo "For more information, see DEPLOYMENT.md"
