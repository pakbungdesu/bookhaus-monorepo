# Use Node.js base image
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy root package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire monorepo source code
COPY . .

# Build the specific app (Replace 'inventory-service' with the actual app name for each file)
# Example: for the gateway Dockerfile, change this to: RUN npx nest build gateway
RUN npx nest build customer-service

# --- PRODUCTION STAGE ---
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
RUN npm install --only=production

# Copy the build output and shared libs
COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/apps/customer-service/main"]