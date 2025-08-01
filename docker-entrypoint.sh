#!/bin/sh
echo "Esperando a la base de datos..."

sleep 5

echo "Ejecutando migraciones..."
npx prisma migrate deploy

echo "Generando cliente Prisma..."
npx prisma generate

echo "Ejecutando seed..."
npm run seed

echo "Iniciando aplicación..."
npm start
