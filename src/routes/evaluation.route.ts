import express from 'express'
import { createEvaluation, deleteEvaluation, editEvaluation, getOneEvaluation } from '../controllers/evaluation.controller'
import { checkAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { EvaluationRequestSchema } from '../lib/validations'
import { requirePermission } from '../middlewares/requirePermission'

export const evaluationRoutes = express.Router()


/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     tags:
 *       - Evaluaciones
 *     summary: Obtener una evaluación realizada a un jugador, con su detalle 
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la evaluación
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Evaluación obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 6
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-27T17:21:58.000Z"
 *                 players:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 4
 *                     nombre:
 *                       type: string
 *                       example: Diego
 *                     apellido:
 *                       type: string
 *                       example: Perez
 *                     posicion:
 *                       type: string
 *                       example: delantero
 *                 types_evaluation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: fisico
 *                     icono:
 *                       type: string
 *                       example: "💪"
 *                     estado:
 *                       type: boolean
 *                       example: true
 *                 details_evaluation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 7
 *                       value:
 *                         type: integer
 *                         example: 9
 *                       parameters_evaluation:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             example: velocidad
 *                           descripcion:
 *                             type: string
 *                             example: velocidad alcanza por un jugador
 *                           type_id:
 *                             type: integer
 *                             example: 1
 *                           estado:
 *                             type: boolean
 *                             example: true
 */
evaluationRoutes.get("/:id", checkAuth, getOneEvaluation)

/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     tags:
 *       - Evaluaciones
 *     summary: Editar evaluación de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la evaluación a editar
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
 *               parametros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parametroId:
 *                       type: integer
 *                       example: 2
 *                     valor:
 *                       type: integer
 *                       example: 5
 *                 example:
 *                   - parametroId: 2
 *                     valor: 5
 *                   - parametroId: 3
 *                     valor: 4
 *     responses:
 *       200:
 *         description: Evaluación actualizada correctamente
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
 *                   example: Parametros actualizados correctamente
 */
evaluationRoutes.put("/:id", checkAuth, requirePermission('mantener_evaluacion'), editEvaluation)

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     tags:
 *       - Evaluaciones
 *     summary: Eliminar evaluacion de un jugador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la evaluacion a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Evaluación eliminada correctamente
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
 *                   example: Evaluación eliminada correctamente
 */
evaluationRoutes.delete("/:id", checkAuth, requirePermission('mantener_evaluacion'), deleteEvaluation)

/**
 * @swagger
 * /api/evaluations:
 *   post: 
 *     tags:
 *       - Evaluaciones
 *     summary: "Crear evaluacion para un jugador"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 example: 8
 *               tipoId:
 *                 example: 1
 *               parametros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parametroId:
 *                       type: integer
 *                       example: 2
 *                     valor:
 *                       type: integer
 *                       example: 5
 *     responses:
 *       200:
 *         description: Evaluación realizada correctamente
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
 *                   example: Evaluación realizada correctamente
 */
evaluationRoutes.post("/", checkAuth, requirePermission('mantener_evaluacion'), validate(EvaluationRequestSchema), createEvaluation)


