import express from 'express'
import { getResetPassword, login, olvidePasword, postResetPassword, verifyAuth } from '../controllers/auth.controller'
import { validate } from '../middlewares/validate.middleware'
import { loginRequestSchema } from '../lib/validations'
import { checkAuth } from '../middlewares/auth.middleware'

export const authRoutes = express.Router()

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: "Inicio de sesión"
 *     description: "Permite a un usuario autenticarse con correo y contraseña válidos."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               password:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - email
 *               - password
 *     responses: 
 *       201:
 *         description: "Inicio de Sesión exitoso"
 *         content: 
 *           application/json:
 *            schema: 
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   example: {}
 *                 token: 
 *                   type: string
 *                   example: "token-generado"
 *               
 *         
 */
authRoutes.post("/login", validate(loginRequestSchema), login)

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: "Verificacion de usuario autenticado"
 *     responses: 
 *       200:
 *         description: "OK"
 */
authRoutes.get("/verify", checkAuth, verifyAuth)

authRoutes.post("/olvide-password", olvidePasword)

authRoutes.get("/reset-password", getResetPassword)

authRoutes.post("/reset-password", postResetPassword)   