import express from 'express'
import { createRol, deleteRol, editRol, getOneRolWithPermissions, getRoles, setPermissions } from '../controllers/rol.controller'
import { checkAuth } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/requireRole'

export const rolRoutes = express.Router()

//set permissions ( update by checkbox )
/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Asignar permisos a un rol
 *     description: Asigna un arreglo de IDs de permisos a un rol específico.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del rol al que se le asignarán los permisos
 *         schema:
 *           type: integer
 *           example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permisos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [15, 13]
 *     responses:
 *       200:
 *         description: Permisos asignados correctamente al rol
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
 *                   example: Roles asignados correctamente
 *       400:
 *         description: Error al asignar los permisos
 *       404:
 *         description: Rol no encontrado
 */
rolRoutes.put("/:id/permissions", checkAuth, requireRole('ADMIN'), setPermissions)

//obtener un rol con todos sus permisos y los permisos seleccionados
/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Obtener un rol con todos los permisos y los permisos seleccionados
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del rol a obtener
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Detalle del rol con sus permisos disponibles y los seleccionados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 nombre:
 *                   type: string
 *                   example: medico
 *                 permisos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       name:
 *                         type: string
 *                         example: view_all_reports
 *                       description:
 *                         type: string
 *                         example: Da acceso a la visualización de informes y estadísticas
 *                 seleccionados:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     example: 13
 *       404:
 *         description: Rol no encontrado
 */
rolRoutes.get("/:id", checkAuth, getOneRolWithPermissions)

//delete rol
/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Eliminar un rol por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del rol a eliminar
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Rol eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rol eliminado correctamente
 *       400:
 *         description: El rol tiene registros asociados y no se puede eliminar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se ha podido eliminar el rol, tienes registros asociados
 *       404:
 *         description: Rol no encontrado
 */
rolRoutes.delete("/:id", checkAuth, requireRole('ADMIN'), deleteRol)

//edit rol
/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Editar un rol
 *     description: Edita el nombre de un rol existente.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del rol que se desea editar
 *         schema:
 *           type: integer
 *           example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Medico
 *     responses:
 *       200:
 *         description: Rol editado correctamente
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
 *                   example: Permiso editado correctamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Rol no encontrado
 */
rolRoutes.put("/:id", checkAuth, requireRole('ADMIN'), editRol)

//obtener todos los roles
/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Obtener todos los roles
 *     description: Retorna la lista de roles junto con los permisos asignados a cada uno.
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
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
 *                   nombre:
 *                     type: string
 *                     example: admin
 */
rolRoutes.get("/", checkAuth, getRoles)

//create rol
/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Crear un nuevo rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: medico
 *     responses:
 *       201:
 *         description: El rol ha sido creado correctamente
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
 *                   example: El rol ha sido creado correctamente
 *       400:
 *         description: Datos inválidos o rol ya existente
 */
rolRoutes.post("/", checkAuth, requireRole('ADMIN'), createRol)
