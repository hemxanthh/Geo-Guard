# Use official Node.js runtime as base image
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY project/package*.json ./project/

# Install dependencies
RUN npm install
RUN cd server && npm install && npm rebuild sqlite3
RUN cd project && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd project && npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S geoguard -u 1001

# Change ownership of app directory
RUN chown -R geoguard:nodejs /app
USER geoguard

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "server/index.js"]
