FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./

# Install ALL dependencies (not just production)
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npm run db:push && npm run start"]
