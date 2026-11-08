# REV431/REV433: frontend Railway'da Dockerfile bilan quriladi (railpack/mise'ni GitHub'dan yuklashga bog'liq emas).
# Bitta bosqich: ichida hammasi bor (node_modules, dist, server.mjs) — Railway sozlamalarida qanday start buyrug'i
# yozilgan bo'lsa ham («npm start», «npm run preview», «npm run build && npm start») ishlaydi.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["npm", "start"]
