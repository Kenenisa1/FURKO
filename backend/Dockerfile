# =============================================================
# FURKO CivicTech Platform - Backend API Service
# Multi-stage production Dockerfile
# =============================================================

# Stage 1: Build & Compile TypeScript
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install native compilation dependencies for packages like bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to dist/
RUN npm run build

# Remove development dependencies to keep production light
RUN npm prune --production

# =============================================================
# Stage 2: Lightweight Production Runtime
# =============================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies required for native binaries if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged user for security
USER node

# Copy compiled files and production dependencies
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Create uploads storage directory with proper permissions
USER root
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
USER node

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
