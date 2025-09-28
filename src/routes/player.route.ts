import express from 'express'
import { addPlayer, deletePlayer, editPlayer, exportPlayerData, getPlayer, getPlayerEvaluations, getPlayerGastos, getPlayers, searchPlayer, setPlayerAsProspecto, setPlayerStatus, topPlayers } from '../controllers/player.controller'
import { validate } from '../middlewares/validate.middleware'
import { playerRequestSchema, updatePlayerSchema } from '../lib/validations'
import { checkAuth } from '../middlewares/auth.middleware'
import { requirePermission } from '../middlewares/requirePermission'

export const playerRoutes = express.Router()

/**
 * @swagger
 * /api/players/{id}/gastos:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Obtener gastos de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Lista de gastos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 4
 *                   monto:
 *                     type: string
 *                     example: "320"
 *                   descripcion:
 *                     type: string
 *                     example: "Gasto de mensualidad 3"
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-15T00:00:00.000Z"
 *                   player_id:
 *                     type: integer
 *                     example: 2
 */
playerRoutes.get("/:id/gastos", checkAuth, getPlayerGastos)

// Obtener evaluaciones de un jugador
/**
 * @swagger
 * /api/players/{id}/evaluations:
 *   get:
 *     tags:
 *       - Evaluaciones
 *     summary: Obtener evaluaciones de un jugador
 *     description: Obtiene una lista paginada de evaluaciones asociadas a un jugador específico.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 4
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página (por defecto es 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: size
 *         in: query
 *         required: false
 *         description: Cantidad de evaluaciones por página (por defecto es 10)
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Lista de evaluaciones del jugador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 5
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 size:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 6
 *                       player_id:
 *                         type: integer
 *                         example: 4
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-27T17:21:58.000Z"
 *                       types_evaluation:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             example: "fisico"
 *                           icono:
 *                             type: string
 *                             example: "💪"
 *                           estado:
 *                             type: boolean
 *                             example: true
 *                       details_evaluation:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 7
 *                             value:
 *                               type: integer
 *                               example: 8
 *                             parameters_evaluation:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 6
 *                                 nombre:
 *                                   type: string
 *                                   example: "resistencia"
 *                                 descripcion:
 *                                   type: string
 *                                   example: "capacidad de mantener el esfuerzo físico prolongado"
 *                                 type_id:
 *                                   type: integer
 *                                   example: 1
 *                                 estado:
 *                                   type: boolean
 *                                   example: true
 *       404:
 *         description: Jugador no encontrado
 */
playerRoutes.get("/:id/evaluations", checkAuth, getPlayerEvaluations)

/**
 * @swagger
 * /api/players/{id}/status:
 *   put:
 *     tags:
 *       - Jugadores
 *     summary: Establece estado de un jugador (activo/desactivado)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 */
playerRoutes.put("/:id/status", checkAuth, requirePermission('mantener_jugadores'), setPlayerStatus)
/**
 * @swagger
 * /api/players/{id}/prospecto:
 *   put:
 *     tags:
 *       - Jugadores
 *     summary: Marcar jugador como prospecto (seguimiento)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 */
playerRoutes.put("/:id/prospecto", checkAuth, requirePermission('mantener_jugadores'), setPlayerAsProspecto)

/**
 * @swagger
 * /api/players/search?query=john:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Buscar jugador por nombre y/o apellido
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Nombre o apellido del jugador a buscar
 *         schema:
 *           type: string
 *           example: "john"
 */
playerRoutes.get("/search", checkAuth, searchPlayer)

/**
 * @swagger
 * /api/players/top:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Obtener top de jugadores por parámetro
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página (por defecto es 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: size
 *         in: query
 *         required: false
 *         description: Tamaño de página (cantidad de registros por página)
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: parametro
 *         in: query
 *         required: false
 *         description: Nombre del parámetro de evaluación (por ejemplo, velocidad, resistencia, etc.)
 *         schema:
 *           type: string
 *           example: velocidad
 *     responses:
 *       200:
 *         description: Lista paginada del top de jugadores por parámetro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 2
 *                 totalItems:
 *                   type: integer
 *                   example: 4
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       player_id:
 *                         type: integer
 *                         example: 2
 *                       nombre:
 *                         type: string
 *                         example: "Andrés"
 *                       apellido:
 *                         type: string
 *                         example: "Rojas"
 *                       posicion:
 *                         type: string
 *                         example: "portero"
 *                       parametro:
 *                         type: string
 *                         example: "velocidad"
 *                       value:
 *                         type: string
 *                         example: "8"
 */
playerRoutes.get("/top", checkAuth, topPlayers)

/**
 * @swagger
 * /api/players:
 *   post:
 *     tags:
 *       - Jugadores
 *     summary: Crear un nuevo jugador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - fecha_nacimiento
 *               - fecha_registro
 *               - identificacion
 *               - pais
 *               - talla
 *               - peso
 *               - pie_habil
 *               - posicion 
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Luis
 *               apellido:
 *                 type: string
 *                 example: Mendoza
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: 2010-11-03
 *               fecha_registro:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-20
 *               identificacion:
 *                 type: string
 *                 example: 79823412
 *               pais:
 *                 type: string
 *                 example: Peru
 *               talla:
 *                 type: string
 *                 example: "1.50"
 *               peso:
 *                 type: string
 *                 example: "43.00"
 *               pie_habil:
 *                 type: string
 *                 example: izquierdo
 *               posicion:
 *                 type: string
 *                 example: defensa | delantero | portero | mediocampista
 *     responses:
 *       201:
 *         description: Jugador creado exitosamente
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
 *                   example: Jugador creado correctamente
 */
playerRoutes.post("/", checkAuth, validate(playerRequestSchema), requirePermission('mantener_jugadores'), addPlayer)

//obtener datos de un jugador por id
/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Obtener a un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Jugador obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 4
 *                 nombre:
 *                   type: string
 *                   example: Diego
 *                 apellido:
 *                   type: string
 *                   example: Perez
 *                 fecha_nacimiento:
 *                   type: string
 *                   format: date-time
 *                   example: 2014-09-10T00:00:00.000Z
 *                 fecha_registro:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-07-01T00:00:00.000Z
 *                 identificacion:
 *                   type: string
 *                   example: 75630194
 *                 pais:
 *                   type: string
 *                   example: Peru
 *                 monto:
 *                   type: string
 *                   example: "0"
 *                 talla:
 *                   type: string
 *                   example: "1.3"
 *                 peso:
 *                   type: string
 *                   example: "32.8"
 *                 pie_habil:
 *                   type: string
 *                   example: derecho
 *                 posicion:
 *                   type: string
 *                   example: delantero
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 activo:
 *                   type: boolean
 *                   example: true
 *                 prospecto:
 *                   type: boolean
 *                   example: false
 */
playerRoutes.get("/:id", checkAuth, getPlayer)

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     tags:
 *       - Jugadores
 *     summary: Actualizar datos de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pais:
 *                 example: "Ecuador"
 *               estado:
 *                 type: boolean
 *                 example: true
 *               prospecto:
 *                 type: boolean
 *                 example: false
 */
playerRoutes.put("/:id", checkAuth, validate(updatePlayerSchema), requirePermission('mantener_jugadores'), editPlayer)

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     tags:
 *       - Jugadores
 *     summary: Eliminar a un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Jugador eliminado correctamente
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
 *                   example: Jugador eliminado correctamente
 */
playerRoutes.delete("/:id", checkAuth, requirePermission('mantener_jugadores'), deletePlayer)

/**
 * @swagger
 * /api/players:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Obtener todos los jugadores
 *     responses:
 *       200:
 *         description: Lista de jugadores obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 4
 *                   nombre:
 *                     type: string
 *                     example: "Diego"
 *                   apellido:
 *                     type: string
 *                     example: "Perez"
 *                   fecha_nacimiento:
 *                     type: string
 *                     format: date
 *                     example: "2014-09-10T00:00:00.000Z"
 *                   fecha_registro:
 *                     type: string
 *                     format: date
 *                     example: "2025-07-01T00:00:00.000Z"
 *                   identificacion:
 *                     type: string
 *                     example: "75630194"
 *                   pais:
 *                     type: string
 *                     example: "Peru"
 *                   monto:
 *                     type: string
 *                     example: "0"
 *                   talla:
 *                     type: string
 *                     example: "1.3"
 *                   peso:
 *                     type: string
 *                     example: "32.8"
 *                   pie_habil:
 *                     type: string
 *                     example: "derecho"
 *                   posicion:
 *                     type: string
 *                     example: "delantero"
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   activo:
 *                     type: boolean
 *                     example: true
 *                   prospecto:
 *                     type: boolean
 *                     example: false
 */
playerRoutes.get("/", checkAuth, getPlayers)


playerRoutes.get("/:id/export", exportPlayerData)