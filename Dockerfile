FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
# Cloud Run sets PORT=8080 at runtime
EXPOSE 8080
USER node
CMD ["node", "index.js"]
