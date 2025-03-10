FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build shared library
RUN npm run build:shared

# Build backend
RUN npm run build:backend

FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install production dependencies only
RUN npm install --production

# Copy built files from builder stage
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "backend/dist/index.js"]