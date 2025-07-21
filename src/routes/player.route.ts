import express from 'express'
import { addPlayer, deletePlayer, editPlayer, getPlayer, getPlayerEvaluations, getPlayers, searchPlayer, setPlayerAsProspecto, setPlayerStatus } from '../controllers/player.controller'
import { validate } from '../middlewares/validate.middleware'
import { playerRequestSchema, updatePlayerSchema } from '../lib/validations'
import { checkAuth } from '../middlewares/auth.middleware'

export const playerRoutes = express.Router()

/**
 * @swagger
 * /api/players/{id}/evaluations:
 *   get:
 *     tags:
 *       - Evaluaciones
 *     summary: Obtener evaluaciones de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
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
playerRoutes.put("/:id/status", checkAuth, setPlayerStatus)
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
playerRoutes.put("/:id/prospecto", checkAuth, setPlayerAsProspecto)
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
 * /api/players:
 *   post: 
 *     tags:
 *       - Jugadores
 *     summary: "Registrar un jugador"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 example: "John"
 *               apellido:
 *                 example: "Doe"
 *               fecha_nacimiento:
 *                 example: "2001-12-12"
 *               fecha_registro:
 *                 example: "2025-06-08"
 *               identificacion:
 *                 type: string
 *                 example: "12345678"
 *               pais:
 *                 example: "Peru"
 *               talla:
 *                 type: string
 *                 example: "1.65"
 *               peso:
 *                 type: string
 *                 example: "55.50"
 *               pie_habil:
 *                 example: "derecho"
 *               posicion:
 *                 example: "delantero"
 */
playerRoutes.post("/", checkAuth, validate(playerRequestSchema), addPlayer)
/**
 * @swagger
 * /api/players:
 *   get:
 *     tags:
 *       - Jugadores
 *     summary: Obtener todos los jugadores registrados
 */
playerRoutes.get("/", checkAuth, getPlayers)

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
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
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
 *               monto:
 *                 type: string
 *                 example: "150.00"
 */
playerRoutes.put("/:id", checkAuth, validate(updatePlayerSchema), editPlayer)

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
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 */
playerRoutes.delete("/:id", checkAuth, deletePlayer)

