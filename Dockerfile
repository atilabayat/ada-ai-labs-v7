FROM node:18-alpine

# Prisma requires OpenSSL on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (layer-cached separately from source)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run db:generate
RUN npm run build

EXPOSE 3000

# Run db:setup on first boot (idempotent — safe to re-run), then start
CMD ["sh", "-c", "npm run db:setup && npm start"]
