FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build shared library
RUN npm run build:shared

# Build frontend
RUN npm run build:frontend

FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]