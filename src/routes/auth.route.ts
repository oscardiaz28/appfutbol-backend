import express from 'express'
import { login, olvidePasword, postResetPassword, verifyAuth, verifyOtp } from '../controllers/auth.controller'
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
 *             schema: 
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     username:
 *                       type: string
 *                       example: oscar28
 *                     email:
 *                       type: string
 *                       example: diazvargasod@gmail.com
 *                     foto:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     fecha_registro:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-23T18:41:49.000Z"
 *                     nombre:
 *                       type: string
 *                       example: Oscar
 *                     apellido:
 *                       type: string
 *                       example: Diaz
 *                     rol:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         nombre:
 *                           type: string
 *                           example: entrenador
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example:
 *                         - manage_players
 *                         - evaluate_player
 *                         - manage_expenses
 *                         - view_player_reports
 *                 token: 
 *                   type: string
 *                   example: "token-generado"
 */
authRoutes.post("/login", validate(loginRequestSchema), login)

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Autenticación
 *     summary: Verificación de usuario autenticado
 *     responses: 
 *       200:
 *         description: Usuario autenticado
 *         content: 
 *           application/json:
 *             schema: 
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 username:
 *                   type: string
 *                   example: oscar28
 *                 email:
 *                   type: string
 *                   example: diazvargasod@gmail.com
 *                 foto:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 fecha_registro:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-23T18:41:49.000Z"
 *                 nombre:
 *                   type: string
 *                   example: Oscar
 *                 apellido:
 *                   type: string
 *                   example: Diaz
 *                 rol:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     nombre:
 *                       type: string
 *                       example: entrenador
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - manage_players
 *                     - evaluate_player
 *                     - manage_expenses
 *                     - view_player_reports
 *       401:
 *         description: Usuario no autenticado
 */
authRoutes.get("/verify", checkAuth, verifyAuth)

/**
 * @swagger
 * /api/auth/olvide-password:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: "Generación de codigo de verificación para restablecer contrañaseña"
 *     description: "Permite a un usuario obtener un codigo de restablecimiento de contraseña"
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
 *             required:
 *               - email
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
 *                   example: "Las instrucciones para reestablecer su password se han enviado a su correo"
 *               
 *         
 */
authRoutes.post("/olvide-password", olvidePasword)

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: "Verificar codigo de restablecimiento"
 *     description: "Permite verficar si el codigo de restablecimiento de contraseña es valida"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "11555"
 *             required:
 *               - token
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
 *                   example: "El token de recuperación es válido"
 *               
 *         
 */
authRoutes.post("/verify-otp", verifyOtp)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: "Cambiar contraseña"
 *     description: "Una vez que se valido el codigo de restablecimiento, se permite cambiar la contraseña"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "11555"
 *               password:
 *                 type: string
 *                 example: "1234"
 *             required:
 *               - email
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
 *                   example: "Contraseña actualizada correctamente"
 *               
 *         
 */
authRoutes.post("/reset-password", postResetPassword)   