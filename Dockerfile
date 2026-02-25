# Dockerfile untuk fullstack NeuralAI (frontend + backend)
FROM node:20 AS builder
WORKDIR /app
COPY . .

# Install dependencies frontend & backend
RUN cd backend && npm install && npm run build
RUN npm install && npm run build

# Production image
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app /app

# Jalankan backend
ENV NODE_ENV=production
WORKDIR /app/backend

# Jalankan backend dan frontend secara bersamaan (gunakan serve untuk frontend)
RUN npm install -g serve

# Expose port 4000 untuk backend dan 8080 untuk frontend
EXPOSE 4000 8080

CMD ["sh", "-c", "node dist/index.js & cd /app && serve -s dist -l 8080"]
