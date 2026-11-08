FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends clamav ca-certificates && rm -rf /var/lib/apt/lists/* \
  # Non-root runtime: log freshclam to stdout (Cloud Logging) instead of /var/log.
  && sed -i -e 's/^UpdateLogFile/#UpdateLogFile/' -e 's/^DatabaseOwner .*/DatabaseOwner node/' -e 's/^NotifyClamd/#NotifyClamd/' /etc/clamav/freshclam.conf
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /var/lib/clamav && chown -R node:node /var/lib/clamav /app
USER node
EXPOSE 8080
# API: update definitions before accepting traffic; failures prevent startup.
# Maintenance job overrides the command with `node maintenance.mjs` (no server, no freshclam).
CMD ["sh", "-c", "freshclam --stdout --datadir=/var/lib/clamav && exec node index.mjs"]
