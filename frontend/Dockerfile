# --- Stage 1: Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first (Docker cache optimization)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# --- Stage 2: Production Stage (Lightweight) ---
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only the necessary files from builder to keep it slim
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Next.js standard start command
CMD ["npm", "start"]