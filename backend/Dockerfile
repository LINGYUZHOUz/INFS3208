# Lingyu Zhou - Dockerfile for Node.js backend API
FROM node:20-alpine

# ---- App working directory ----
WORKDIR /app

COPY package*.json ./

RUN npm install --only=production --no-audit --no-fund

# ---- Copy application source ----
COPY . .
COPY .env.example .env

ENV NODE_ENV=production \
    PORT=5001

USER node

# ---- Expose HTTP port ----
EXPOSE 5001

# ---- Start the API ----
CMD ["node", "server.js"]
