import express from 'express'
import { createEvaluation, editEvaluation } from '../controllers/evaluation.controller'
import { checkAuth } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { EvaluationRequestSchema } from '../lib/validations'

export const evaluationRoutes = express.Router()

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
 */
evaluationRoutes.post("/", checkAuth, validate(EvaluationRequestSchema), createEvaluation)


/**
 * @swagger
 * /api/evaluations/{id}:
 *   put:
 *     tags:
 *       - Evaluaciones
 *     summary: Editar evaluacion de un jugador
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
 */
evaluationRoutes.put("/:id", checkAuth, editEvaluation)