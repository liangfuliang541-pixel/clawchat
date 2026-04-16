# ============================================
# 🦞 ClawChat Frontend - Production Dockerfile
# ============================================

FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install all dependencies (workspaces)
RUN npm ci

# Copy source and build shared + frontend
COPY shared ./shared
COPY frontend ./frontend
RUN npm run build -w shared

# Build arg for API URL (defaults to same-origin via nginx proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build -w frontend

# ============================================
# Serve with nginx
# ============================================
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
