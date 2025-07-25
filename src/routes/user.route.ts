import express from 'express';
import { createUser } from '../controllers/user.controller';
import { checkAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UserRequestSchema } from '../lib/validations';

export const userRoutes = express.Router();

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
 *               
 *         
 */
userRoutes.post("/", checkAuth, validate(UserRequestSchema), createUser);