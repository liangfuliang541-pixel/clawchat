# ============================================
# 🦞 ClawChat Backend - Production Dockerfile
# ============================================

FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

# Install all dependencies (workspaces)
RUN npm ci

# Copy source and build
COPY shared ./shared
COPY backend ./backend
RUN npm run build -w shared
RUN npm run build -w backend

# ============================================
# Production stage
# ============================================
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Copy workspace manifests for production install
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist

EXPOSE 3001
CMD ["node", "backend/dist/server.js"]
