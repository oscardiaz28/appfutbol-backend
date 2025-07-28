import express from 'express';
import { changePassword, createUser, deleteUser, getAllUsers, getOneUser, getSearchUsers, updateProfileUser, updateUser, userProfile } from '../controllers/user.controller';
import { checkAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { AdminUpdateUserSchema, ChangePasswordRequestSchema, ProfileUpdateUserSchema, UserRequestSchema } from '../lib/validations';
import { requireRole } from '../middlewares/requireRole';

export const userRoutes = express.Router();


//actualizar perfil de usuario
/**
 * @swagger
 * /api/users/profile/update/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar perfil del usuario autenticado
 *     description: Permite al usuario autenticado actualizar su propio nombre de usuario y datos personales.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario que realiza la actualización
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - nombre
 *               - apellido
 *             properties:
 *               username:
 *                 type: string
 *                 example: "oscar28"
 *               nombre:
 *                 type: string
 *                 example: "Oscar"
 *               apellido:
 *                 type: string
 *                 example: "Diaz"
 *     responses:
 *       200:
 *         description: Datos actualizados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Datos actualizados correctamente"
 *       400:
 *         description: Datos inválidos o incompletos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
userRoutes.put("/profile/update/:id", checkAuth, validate(ProfileUpdateUserSchema), updateProfileUser)


//actualizar perfil de usuario, hecho por el admin
/**
 * @swagger
 * /api/users/admin/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar usuario (por administrador)
 *     description: Permite a un administrador actualizar los datos de un usuario específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - nombre
 *               - apellido
 *               - rol_id
 *             properties:
 *               username:
 *                 type: string
 *                 example: "oscar5863"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "diazvargasod@gmail.com"
 *               nombre:
 *                 type: string
 *                 example: "Oscar"
 *               apellido:
 *                 type: string
 *                 example: "Diaz"
 *               rol_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado correctamente"
 *       400:
 *         description: Datos inválidos o incompletos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
userRoutes.put("/admin/:id", checkAuth, requireRole('ADMIN'), validate(AdminUpdateUserSchema), updateUser )


// obtener perfil del usuario autenticado
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna la información del perfil del usuario actualmente autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin"
 *                 email:
 *                   type: string
 *                   example: "john@gmail.com"
 *                 foto:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 fecha_registro:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-21T14:05:46.000Z"
 *                 nombre:
 *                   type: string
 *                   example: "John"
 *                 apellido:
 *                   type: string
 *                   example: "Doe"
 *                 rol:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "admin"
 *       401:
 *         description: No autorizado - el usuario no está autenticado
 */
userRoutes.get("/profile", checkAuth, userProfile)


// cambiar password
/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Cambiar contraseña del usuario
 *     description: Permite al usuario cambiar su contraseña actual.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: "12345"
 *               new_password:
 *                 type: string
 *                 example: "1234"
 *               repeat_new_password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada correctamente"
 *       400:
 *         description: Datos inválidos o error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "La contraseña actual es incorrecta"
 */
userRoutes.put("/change-password", checkAuth, validate(ChangePasswordRequestSchema), changePassword )

// buscar usuarios por nombre, apellido o email
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Buscar usuarios
 *     description: Busca usuarios por nombre, apellido o email.
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Texto de búsqueda
 *         schema:
 *           type: string
 *           example: john
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: admin
 *                   email:
 *                     type: string
 *                     example: john@gmail.com
 *                   foto:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   rol_id:
 *                     type: integer
 *                     example: 1
 *                   fecha_registro:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-21T14:05:46.000Z
 *                   nombre:
 *                     type: string
 *                     example: John
 *                   apellido:
 *                     type: string
 *                     example: Doe
 *                   estado:
 *                     type: boolean
 *                     example: true
 *                   roles:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: admin
 */
userRoutes.get("/search", checkAuth, getSearchUsers)


// obtener un usuario por su id
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener un usuario
 *     description: Obtiene los detalles de un usuario específico por su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a obtener
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: admin
 *                 email:
 *                   type: string
 *                   example: john@gmail.com
 *                 foto:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 fecha_registro:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-21T14:05:46.000Z
 *                 nombre:
 *                   type: string
 *                   example: John
 *                 apellido:
 *                   type: string
 *                   example: Doe
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 roles:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: admin
 */
userRoutes.get("/:id", checkAuth, requireRole('ADMIN'), getOneUser)


// eliminar un usuario
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar un usuario
 *     description: Elimina un usuario por su ID. Puede fallar si el usuario tiene registros asociados.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: integer
 *           example: 7
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: El usuario ha sido eliminado exitosamente
 *       400:
 *         description: No se pudo eliminar el usuario debido a registros asociados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No se ha podido eliminar el usuario, tienes registros asociados
 */
userRoutes.delete("/:id", checkAuth, requireRole('ADMIN'), deleteUser)


// crear un usuario
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: "Crear Usuario"
 *     description: "Permite crear un usuario asignando un rol"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john123"
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               nombre:
 *                 type: string
 *                 example: "John"
 *               apellido:
 *                 type: string
 *                 example: "Doe"
 *               rol_id:
 *                 type: number
 *                 example: 1
 *               password:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - username
 *               - email
 *               - nombre
 *               - apellido
 *               - rol_id
 *               - password
 *     responses: 
 *       200:
 *         content: 
 *           application/json:
 *            schema: 
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message: 
 *                   type: string
 *                   example: "Usuario creado correctamente"
 */
userRoutes.post("/", checkAuth, requireRole('ADMIN'), validate(UserRequestSchema), createUser);


// obtener todos los usuarios
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista paginada de usuarios registrados en el sistema.
 *     parameters:
 *       - name: size
 *         in: query
 *         required: false
 *         description: Cantidad de elementos por página
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página a obtener
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 2
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 size:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       username:
 *                         type: string
 *                         example: oscar28
 *                       email:
 *                         type: string
 *                         example: diazvargasod@gmail.com
 *                       foto:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       fecha_registro:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-07-23T18:41:49.000Z
 *                       nombre:
 *                         type: string
 *                         example: Oscar
 *                       apellido:
 *                         type: string
 *                         example: Diaz
 *                       estado:
 *                         type: boolean
 *                         example: true
 *                       roles:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           nombre:
 *                             type: string
 *                             example: entrenador
 */
userRoutes.get("/", checkAuth, requireRole('ADMIN'), getAllUsers)

