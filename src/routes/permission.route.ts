import express from 'express'
import { createPermission, deletePermission, editPermission, getAllPermissions, getOnePermission } from '../controllers/permission.controller';
import { checkAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';
import { validate } from '../middlewares/validate.middleware';
import { PermissionRequestSchema, UpdatePermissionRequestSchema } from '../lib/validations';

export const permissionRoutes = express.Router();

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     tags:
 *       - Permisos
 *     summary: Eliminar permiso registrado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del permiso
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Permiso eliminado correctamente
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
 *                   example: Permiso eliminado correctamente
 */
permissionRoutes.delete("/:id", checkAuth, requireRole('ADMIN'), deletePermission)

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     tags:
 *       - Permisos
 *     summary: Editar permiso registrado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del permiso
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Permiso actualizado correctamente
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
 *                   example: Permiso actualizado correctamente
 */
permissionRoutes.put("/:id", checkAuth, requireRole('ADMIN'), validate(UpdatePermissionRequestSchema), editPermission)

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     tags:
 *       - Permisos
 *     summary: Obtener un permiso registrado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del permiso
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Permiso obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 name:
 *                   type: string
 *                   example: "view_all_reports"
 *                 descripcion:
 *                   type: string
 *                   example: Da acceso a la visualización de informes y estadísticas
 */
permissionRoutes.get("/:id", checkAuth, getOnePermission)

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     tags:
 *       - Permisos
 *     summary: Obtener todos los permisos registrados
 *     responses:
 *       200:
 *         description: Lista de permisos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   name:
 *                     type: string
 *                     example: view_all_reports
 *                   description:
 *                     type: string
 *                     example: Da acceso a la visualización de informes y estadísticas
 */
permissionRoutes.get("/", checkAuth, getAllPermissions)

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     tags:
 *       - Permisos
 *     summary: Crear un nuevo permiso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: new_permission
 *               description:
 *                 type: string
 *                 example: Description about permission
 *             required:
 *               - name
 *               - description
 *     responses:
 *       201:
 *         description: Permiso creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 20
 *                 name:
 *                   type: string
 *                   example: new_permission
 *                 description:
 *                   type: string
 *                   example: Description about permission
 */
permissionRoutes.post("/", checkAuth, requireRole('ADMIN'),  validate(PermissionRequestSchema), createPermission)