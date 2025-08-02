import express from 'express'
import { checkAuth } from '../middlewares/auth.middleware'
import { createGasto, deleteGasto, editGasto, getAllGastos, getOneGasto } from '../controllers/expense.controller'
import { validate } from '../middlewares/validate.middleware'
import { EditGastoRequestSchema, GastoRequestSchema } from '../lib/validations'
import { requirePermission } from '../middlewares/requirePermission'

export const expenseRoutes = express.Router()

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     tags:
 *       - Gastos
 *     summary: Eliminar gasto de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del gasto a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Gasto eliminado correctamente
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
 *                   example: Gasto eliminado correctamente
 */
expenseRoutes.delete("/:id", checkAuth, requirePermission('gastos'), deleteGasto)

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     tags:
 *       - Gastos
 *     summary: Obtener un gasto registrado
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del gasto
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Gasto obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 monto:
 *                   type: string
 *                   example: "315"
 *                 descripcion:
 *                   type: string
 *                   example: Gasto de mensualidad
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-02T00:00:00.000Z"
 *                 player_id:
 *                   type: integer
 *                   example: 2
 */
expenseRoutes.get("/:id", checkAuth, requirePermission('gastos'), getOneGasto)

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     tags:
 *       - Gastos
 *     summary: Editar un gasto
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del gasto
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
 *               monto:
 *                 type: number
 *                 example: 350.00
 *               descripcion:
 *                 type: string
 *                 example: Actualización del gasto
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-02"
 *               player_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Gasto editado correctamente
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
 *                   example: Gasto editado correctamente
 */
expenseRoutes.put("/:id", checkAuth, validate(EditGastoRequestSchema), requirePermission('gastos'), editGasto)

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     tags:
 *       - Gastos
 *     summary: Registrar un gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player_id:
 *                 type: integer
 *                 example: 2
 *               monto:
 *                 type: string
 *                 example: "320"
 *               descripcion:
 *                 type: string
 *                 example: Gasto de mensualidad 3
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *             required:
 *               - player_id
 *               - monto
 *               - descripcion
 *               - fecha
 *     responses:
 *       200:
 *         description: Gasto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 monto:
 *                   type: string
 *                   example: "315"
 *                 descripcion:
 *                   type: string
 *                   example: Gasto de mensualidad
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-02T00:00:00.000Z"
 *                 player_id:
 *                   type: integer
 *                   example: 2
 *                 user_id:
 *                   type: integer
 *                   example: 4
 */
expenseRoutes.post("/", checkAuth, validate(GastoRequestSchema), requirePermission('gastos'), createGasto)

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     tags:
 *       - Gastos
 *     summary: Obtener los gastos registrados
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página (opcional)
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: size
 *         in: query
 *         required: false
 *         description: Tamaño de página (opcional)
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Gastos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 3
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
 *                         example: 4
 *                       monto:
 *                         type: string
 *                         example: "320"
 *                       descripcion:
 *                         type: string
 *                         example: Gasto de mensualidad 3
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-15T00:00:00.000Z"
 *                       player_id:
 *                         type: integer
 *                         example: 2
 */
expenseRoutes.get("/", checkAuth, getAllGastos)