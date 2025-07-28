import express from 'express'
import { checkAuth } from '../middlewares/auth.middleware';
import { createParameter, createTypeEvaluation, deleteParameter, deleteType, getOneParameter, getOneType, getParameters, getTypes, setParameterStatus, setTypeEvaluationState, updateParameter, updateType } from '../controllers/type-evaluation.controller';
import { validate } from '../middlewares/validate.middleware';
import { ParameterRequestSchema, typeEvaluationRequestSchema, UpdateParameterSchema, UpdateTypeEvaluationSchema } from '../lib/validations';
import { requireRole } from '../middlewares/requireRole';

export const typeEvaluationRoutes = express.Router();


// actualizar estado de un parametro de evaluacion
/**
 * @swagger
 * /api/type-evaluation/parameters/{id}/status:
 *   patch:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Actualizar el estado de un parámetro de evaluación
 *     description: Cambia el estado (activo/inactivo) de un parámetro de evaluación por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del parámetro de evaluación
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estado del parámetro actualizado correctamente
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
 *                   example: "Estado del parámetro actualizado correctamente"
 */
typeEvaluationRoutes.patch("/parameters/:id/status", checkAuth, requireRole('ADMIN'), setParameterStatus )

// eliminar un parametro de evaluacion
/**
 * @swagger
 * /api/type-evaluation/parameters/{id}:
 *   delete:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Eliminar un parámetro de evaluación
 *     description: Elimina un parámetro de evaluación específico por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del parámetro de evaluación a eliminar
 *         schema:
 *           type: integer
 *           example: 17
 *     responses:
 *       200:
 *         description: Parámetro de evaluación eliminado correctamente
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
 *                   example: "El parametro de evaluación ha sido eliminado correctamente"
 *       404:
 *         description: Parámetro no encontrado
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
 *                   example: "Parámetro de evaluación no encontrado"
 *       400:
 *         description: No se pudo eliminar el parámetro por estar asociado a registros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se ha podido eliminar el parámetro, tiene registros asociados"
 */
typeEvaluationRoutes.delete("/parameters/:id", checkAuth, requireRole('ADMIN'), deleteParameter);

// actualizar parametro de evaluacion
/**
 * @swagger
 * /api/type-evaluation/parameters/{id}:
 *   put:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Editar un parámetro de evaluación
 *     description: Actualiza los datos de un parámetro de evaluación específico por su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del parámetro de evaluación a editar
 *         schema:
 *           type: integer
 *           example: 18
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: velocidad
 *               descripcion:
 *                 type: string
 *                 example: Velocidad alcanza por un jugador
 *               type_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Parámetro de evaluación actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 18
 *                 nombre:
 *                   type: string
 *                   example: manejo del estrés
 *                 descripcion:
 *                   type: string
 *                   example: descripcion del parametro de evaluacion
 *                 type_id:
 *                   type: integer
 *                   example: 1
 *                 estado:
 *                   type: boolean
 *                   example: true
 */
typeEvaluationRoutes.put("/parameters/:id", checkAuth, requireRole('ADMIN'), validate(UpdateParameterSchema),updateParameter )


//obtener parametro de evaluacion por su id
/**
 * @swagger
 * /api/type-evaluation/parameters/{id}:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Obtener un parámetro de evaluación por ID
 *     description: Retorna los detalles de un parámetro de evaluación específico junto con su tipo de evaluación asociado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del parámetro de evaluación
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Detalle del parámetro de evaluación obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 nombre:
 *                   type: string
 *                   example: "control de balón"
 *                 descripcion:
 *                   type: string
 *                   example: "capacidad de controlar el balón bajo presión"
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 types_evaluation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     nombre:
 *                       type: string
 *                       example: "tecnico"
 *                     icono:
 *                       type: string
 *                       example: "⚽"
 *                     estado:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Parámetro no encontrado
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
 *                   example: "Parámetro de evaluación no encontrado"
 */
typeEvaluationRoutes.get("/parameters/:id", checkAuth, getOneParameter)


// actualizar estado de un tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation/{id}/status:
 *   patch:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Actualizar estado de un tipo de evaluación
 *     description: Cambia el estado (activo/inactivo) de un tipo de evaluación por su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de evaluación
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Estado del tipo de evaluación actualizado correctamente
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
 *                   example: Estado actualizado correctamente
 */
typeEvaluationRoutes.patch("/:id/status", checkAuth, requireRole('ADMIN'), setTypeEvaluationState )


// obtener parametros de un tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation/{id}/parameters:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Obtener parámetros de un tipo de evaluación
 *     description: Devuelve todos los parámetros asociados a un tipo de evaluación dado su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de evaluación
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Lista de parámetros del tipo de evaluación
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 15
 *                   nombre:
 *                     type: string
 *                     example: concentración
 *                   descripcion:
 *                     type: string
 *                     example: capacidad de mantener el foco durante el juego
 *                   estado:
 *                     type: boolean
 *                     example: true
 *       404:
 *         description: Tipo de evaluación no encontrado o sin parámetros
 */
typeEvaluationRoutes.get("/:id/parameters", checkAuth, getParameters)


// Crear un tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation:
 *   post:
 *     tags:
 *       - Tipo de Evaluaciones 
 *     summary: Crear un nuevo tipo de evaluación
 *     description: Crea un nuevo tipo de evaluación con nombre e ícono.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Psicologico
 *               icono:
 *                 type: string
 *                 example: 💪
 *     responses:
 *       201:
 *         description: Tipo de evaluación creado exitosamente
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
 *                   example: Tipo de evaluacion creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
typeEvaluationRoutes.post("/", checkAuth, requireRole('ADMIN'), validate(typeEvaluationRequestSchema), createTypeEvaluation)


// obtener los tipos de evaluaciones registrados
/**
 * @swagger
 * /api/type-evaluation:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones 
 *     summary: Listar los tipos de evaluaciones
 *     description: Retorna un listado de todos los tipos de evaluación registrados.
 *     responses:
 *       200:
 *         description: Lista de tipos de evaluación obtenida correctamente
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
 *                     example: fisico
 *                   icono:
 *                     type: string
 *                     example: 💪
 *                   estado:
 *                     type: boolean
 *                     example: true
 */
typeEvaluationRoutes.get("/", checkAuth, getTypes)


// obtener un tipo de evaluacion y sus parametros
/**
 * @swagger
 * /api/type-evaluation/{id}:
 *   get:
 *     tags:
 *       - Tipo de Evaluaciones 
 *     summary: Obtener un tipo de evaluación y sus parámetros
 *     description: Retorna el tipo de evaluación especificado y la lista de parámetros asociados a ese tipo.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de evaluación a obtener
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tipo de evaluación obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nombre:
 *                   type: string
 *                   example: fisico
 *                 icono:
 *                   type: string
 *                   example: 💪
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 parameters_evaluation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: velocidad
 *                       descripcion:
 *                         type: string
 *                         example: velocidad alcanza por un jugador
 *                       estado:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Tipo de evaluación no encontrado
 */
typeEvaluationRoutes.get("/:id", checkAuth, getOneType)


//eliminar tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation/{id}:
 *   delete:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Eliminar un tipo de evaluación
 *     description: Elimina un tipo de evaluación por su ID. Si existen registros asociados, no se podrá eliminar.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de evaluación a eliminar
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Tipo de evaluación eliminado correctamente
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
 *                   example: El tipo de evaluación ha sido eliminado correctamente
 *       400:
 *         description: No se puede eliminar el tipo de evaluación porque tiene registros asociados
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
 *                   example: No se ha podido eliminar el tipo de evaluación, tienes registros asociados
 *       404:
 *         description: Tipo de evaluación no encontrado
 */
typeEvaluationRoutes.delete("/:id", checkAuth, requireRole('ADMIN'), deleteType)


// editar tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation/{id}:
 *   put:
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Editar un tipo de evaluación
 *     description: Actualiza el nombre e icono de un tipo de evaluación existente.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de evaluación a editar
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - icono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "tecnico"
 *               icono:
 *                 type: string
 *                 example: "⚽"
 *     responses:
 *       200:
 *         description: Tipo de evaluación editado correctamente
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
 *                   example: Tipo de evaluacion editado correctamente
 *       400:
 *         description: Error de validación o datos incorrectos
 *       404:
 *         description: Tipo de evaluación no encontrado
 */
typeEvaluationRoutes.put("/:id", checkAuth, requireRole('ADMIN'), validate(UpdateTypeEvaluationSchema), updateType)


// Crear un parametro de evaluacion asociado a un tipo de evaluacion
/**
 * @swagger
 * /api/type-evaluation/parameters:
 *   post: 
 *     tags:
 *       - Tipo de Evaluaciones
 *     summary: Crear un parámetro de evaluación y asocia a un tipo de evaluacion
 *     description: Crea un nuevo parámetro de evaluación asociado a un tipo de evaluación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - type_id
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "definición"
 *               descripcion:
 *                 type: string
 *                 example: "Habilidad para definir y marcar gol"
 *               type_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Parámetro creado exitosamente
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
 *                   example: Parámetro creado exitosamente
 *       400:
 *         description: Error de validación en la solicitud
 */
typeEvaluationRoutes.post("/parameters", checkAuth, requireRole('ADMIN'), validate(ParameterRequestSchema), createParameter)

