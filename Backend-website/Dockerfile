###############
# Builder stage
###############
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all deps (including dev) to build
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

################
# Runtime stage
################
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only package files and install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# If you have any runtime assets outside dist, copy them here
# (Not needed if assets are emitted into dist by Nest CLI)

# Environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]