# Kanban - production Docker image
# Multi-stage: install deps + build, then run a slim runtime.

# ---- Build stage ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Cache dependencies (this layer only re-runs when the lockfile changes)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# ---- Runtime stage -------------------------------------------------------
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Run as an unprivileged user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only what `next start` needs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/app ./app

USER nextjs
EXPOSE 3000

# Bind to all interfaces so it is reachable on the LAN (not just 127.0.0.1)
ENV HOSTNAME=0.0.0.0
CMD ["npx", "next", "start", "-p", "3000"]
