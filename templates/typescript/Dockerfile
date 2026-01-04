# Use Node.js LTS image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDeps for build
# Note: Using npm install for easier setup. For production, use npm ci with a committed package-lock.json
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Use the existing node user (UID 1000)
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Run the server
CMD ["node", "dist/index.js"]
