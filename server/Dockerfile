FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends clamav ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /var/lib/clamav && chown -R node:node /var/lib/clamav /app
USER node
EXPOSE 8080
# Update definitions before accepting traffic; failures prevent startup.
CMD ["sh", "-c", "freshclam --user=node --datadir=/var/lib/clamav && node index.mjs"]
