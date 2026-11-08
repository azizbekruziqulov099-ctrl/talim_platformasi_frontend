# REV431: frontend Railway'da Dockerfile bilan quriladi — railpack/mise'ni GitHub'dan yuklashga bog'liq emas
# (GitHub 504 berganda «failed to ensure mise is installed» xatosi bilan deploy to'xtab qolardi).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs
COPY --from=build /app/package.json ./package.json
EXPOSE 8080
CMD ["node", "server.mjs", "--host", "0.0.0.0"]
