# etapa 1 : build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

# etapa 2 : runtime
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

CMD ["./docker-entrypoint.sh"]




