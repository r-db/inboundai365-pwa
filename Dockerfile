# Multi-stage Docker build for PWA + Backend

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files and lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY src/ ./src/
COPY webpack.config.js ./
COPY postcss.config.js ./
COPY .babelrc ./
RUN npm run build:clean && npm run build:webpack

# Stage 2: Python backend with built frontend
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./backend/static

# Create logs directory
RUN mkdir -p /app/backend/logs

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5001/api/health', timeout=5)"

# Run with gunicorn
WORKDIR /app/backend
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "run:app"]
