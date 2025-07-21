import express from 'express'
import { checkAuth } from '../middlewares/auth.middleware';
import { createParameter, createTypeEvaluation, deleteParameter, getOneType, getParameters, getTypes } from '../controllers/type-evaluation.controller';
import { validate } from '../middlewares/validate.middleware';
import { ParameterRequestSchema, typeEvaluationRequestSchema } from '../lib/validations';

export const typeEvaluationRoutes = express.Router();

typeEvaluationRoutes.delete("/parameters/:id", checkAuth, deleteParameter);

/**
 * @swagger
 * /api/type-evaluation/{id}/parameters:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Obtener los parametros de un tipo de evaluacion
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 */
typeEvaluationRoutes.get("/:id/parameters", checkAuth, getParameters)

/**
 * @swagger
 * /api/type-evaluation:
 *   post: 
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Crear un tipo de evaluacion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 example: "Fisica"
 *               icono:
 *                 example: "⚽"
 */
typeEvaluationRoutes.post("/", checkAuth, validate(typeEvaluationRequestSchema), createTypeEvaluation)

/**
 * @swagger
 * /api/type-evaluation:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones 
 *     summary: Listar los tipos de evaluaciones
 */
typeEvaluationRoutes.get("/", checkAuth, getTypes)
/**
 * @swagger
 * /api/type-evaluation/{id}:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones 
 *     summary: Obtener un tipo de evaluacion y sus parametros
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del jugador a obtener
 *         schema:
 *           type: integer
 *           example: 1
 */
typeEvaluationRoutes.get("/:id", checkAuth, getOneType)

/**
 * @swagger
 * /api/type-evaluation/parameters:
 *   post: 
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Crear un parametro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 example: "definición"
 *               descripcion:
 *                 example: "Habilidad para definir y marcar gol"
 *               typeId:
 *                 example: 4
 */
typeEvaluationRoutes.post("/parameters", checkAuth, validate(ParameterRequestSchema), createParameter)