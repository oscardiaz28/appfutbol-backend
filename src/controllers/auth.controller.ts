import { Request, Response } from "express";
import { LoginRequestType } from "../interfaces/types";
import prisma from "../models/prisma";
import bcrypt from 'bcryptjs'
import { formatDate, generateToken, getMinutes, handleServerError, hashPassword, randomToken, sendMail } from "../lib/utils";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
    #swagger.tags = ['Autenticación'] 
    #swagger.summary = "Inicio de sesión"
    #swagger.description = 'Permite a un usuario autenticarse con correo y contraseña válidos.
    #swagger.parameters['obj'] = {
         in: 'body',
         required: true,
         schema: {
         email: 'john@gmail.com',
         password: '1234'
        }
     }
    #swagger.responses[201] = {
        description: "Inicio de Sesión exitoso",
        schema: {
            user: {},
            token: "jwt-token-generado"
        }
    }
    */
export const login = async (req: Request<{}, {}, LoginRequestType>, res: Response) => {
    const { email } = req.body
    try {
        const user = await prisma.users.findUnique({
            where: { email: email },
            omit: { rol_id: true },
            include: { roles: {
                include: {permissions: {
                    omit: {roleId: true, permissionId: true},
                    include: {permission: {
                        select: { name: true }
                    }}
                } }
            }}
        })
        const permissions = user?.roles.permissions?.map( item => item.permission.name  )

        if (!user) {
            return res.status(400).json({ success: false, message: "Usuario no registrado" })
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
        if (!isPasswordCorrect) return res.status(400).json({success: false, message: "La contraseña es incorrecta" })

        if(user.estado !== true) return res.status(403).json({success: false, message: "Cuenta desabilitada, comunicate con el administrador"})

        const token = generateToken(user.id)

        const response = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            foto: user.foto,
            fecha_registro: formatDate(user.fecha_registro),
            estado: user.estado,
            rol: {
                id: user.roles.id,
                nombre: user.roles.nombre
            },
            permissions: permissions
        }
        
        res.json({ success: true, user: response, token })

    } catch (err) {
        return handleServerError(err, "LoginController", res)
    }
}

export const verifyAuth = (req: AuthRequest, res: Response) => {
    res.status(200).json(req.user)
}

function validateBody(body: any): string | null {
    const { email } = body || {};
    if (email === undefined) {
        return "El email es obligatorio";
    }
    if (typeof email !== 'string') {
        return "El email debe ser una cadena de texto";
    }
    if (email.trim() === "") {
        return "El email no puede estar vacío";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "El formato del email no es válido";
    }
    return null;
}

export const olvidePasword = async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length == 0) {
        return res.status(400).json({success: false, message: "El cuerpo de la solicitud es obligatorio" })
    }
    const error = validateBody(req.body);
    if (error) {
        return res.status(400).json({success: false, message: error })
    }
    const { email } = req.body

    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
        return res.status(400).json({ message: "El email no existe en el sistema" })
    }

    const token = randomToken();
    const expires = getMinutes();

    await prisma.token.create({
        data: {
            value: token,
            type: "password_reset",
            user_id: user.id,
            expiresAt: expires
        }
    })

    const frontendUrl = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_DEV;

    await sendMail(user.email, "password_reset", {
        name: user.nombre,
        token,
        subject: "Recuperación de contraseña"
    })

    try {
        res.status(200).json({ success: true, message: "Las instrucciones para reestablecer su password se han enviado a su correo" });

    } catch (err) {
        return handleServerError(err, "olvidePassword", res);
    }
}


const validateToken = async (token: string, expectedType: string) => {
    const found = await prisma.token.findFirst({
        where: { value: token }
    })
    if (!found || found.type !== expectedType || found.expiresAt < new Date()) {
        return null;
    }
    return found;
}


export const verifyOtp = async (req: Request, res: Response) => {
    if(!req.body){
        return res.status(400).json({message: "El cuerpo de la solicitud es obligatorio"})
    }
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, message: "Token no enviado" })
    }
    try {
        const validToken = await validateToken(token, "password_reset")
        if (!validToken) {
            return res.status(400).json({ success: false, message: "El token de recuperación no es válido" });
        }
        res.json({ success: true, message: "El token de recuperación es válido" })

    } catch (err) {
        return handleServerError(err, "getResetPassword", res);
    }
}

export const postResetPassword = async (req: Request, res: Response) => {
    if(!req.body) return res.status(400).json({success: false, message: "El cuerpo de la solicitud es obligatoria"});

    const {token, password} = req.body || {};

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, message: "Token no enviado" })
    }

    if( !password || password.trim() === "" || typeof password !== "string" ){
        return res.status(400).json({success: false, message: "La nueva contraseña es obligatoria"})
    }

    try {
        const validToken = await validateToken(token, "password_reset");
        if(!validToken){
            return res.status(400).json({ success: false, message: "El token de recuperación no es válido" });
        }

        const hashedPass = await hashPassword(password);

        await prisma.users.update({
            where: {id: validToken.user_id},
            data: { password: hashedPass }
        })

        await prisma.token.delete({where: {id: validToken.id}})

        res.json({success: true, message: "Contraseña actualizada correctamente"})

    } catch (err) {
        return handleServerError(err, "postResetPassword", res)
    }
}