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

Crea un archivo .env con la configuración de producción:

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

#### 5. Insertar datos iniciales
``` 
npm run seed
```


#### 6. Levantar el servidor

``` 
npm run dev
``` 

<br>


## 🚀 Despliegue

Sigue estos pasos para preparar y ejecutar el proyecto en un entorno de producción.

### 1. Instalar dependencias

```
npm install
```

### 2. Configurar las variables de entorno

Crea un archivo .env con la configuración de producción:

```
DATABASE_URL=
JWT_SECRET=
GMAIL_USER=
GMAIL_PASS=
NODE_ENV=
FRONTEND_URL_DEV=
FRONTEND_URL_PROD=
INITIAL_PASS=
```

#### 3. Aplicar las migraciones en la base de datos
``` 
npx prisma migrate deploy
```

#### 4. Generar el Prisma Client

``` 
npx prisma generate
``` 

#### 5. Insertar datos iniciales
``` 
npm run seed
```

#### 6. Compilar el proyecto TypeScript a JavaScript

``` 
npm run build
``` 


#### 7. Iniciar la aplicación

``` 
npm start
``` 
