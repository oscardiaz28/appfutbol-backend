# 📦 Proyecto Node.js + TypeScript + Prisma

Este es un proyecto backend desarrollado con Node.js, TypeScript y Prisma ORM, siguiendo una estructura MVC.

## 🚀 Requisitos

- Node.js (v18 o superior)
- MySQL (en ejecución)
- npm o yarn

## ⚙️ Instalación y configuración

#### 1. Instalar dependencias
``` 
npm install
```
#### 2. Configura tus variables de entorno en un archivo .env

- DATABASE_URL=
- JWT_SECRET=

#### 3. Aplicar las migraciones en la base de datos
``` 
npx prisma migrate deploy
```

#### 4. Generar el Prisma Client

``` 
npx prisma generate
``` 

#### 5. Levantar el servidor

``` 
npm run dev
``` 

