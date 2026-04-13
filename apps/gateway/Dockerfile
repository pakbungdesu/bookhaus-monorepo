# --- BUILD STAGE ---
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy root package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the entire monorepo source code
COPY . .

# Build the gateway app specifically
RUN npx nest build gateway

# --- PRODUCTION STAGE ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY --from=build /usr/src/app/package*.json ./
RUN npm install --only=production

# 1. Copy the compiled JavaScript code
COPY --from=build /usr/src/app/dist ./dist

# 2. IMPORTANT: Copy your EJS views and Public assets
# These are not included in the "dist" folder by NestJS by default
COPY --from=build /usr/src/app/apps/gateway/views ./views
COPY --from=build /usr/src/app/apps/gateway/public ./public

# Start the gateway
CMD ["node", "dist/apps/gateway/main"]