import { Request, Response } from "express";
import { LoginRequestType } from "../interfaces/types";
import prisma from "../models/prisma";
import bcrypt from 'bcryptjs'
import { generateToken, handleServerError } from "../lib/utils";
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
    try{
        const user = await prisma.users.findUnique({
            where: {email: email},
            omit: {rol_id: true},
            include: {roles: true}
        })
        if(!user){  
            return res.status(400).json({message: "Usuario no registrado"})
        }
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({message: "La contraseña es incorrecta"})

        const token = generateToken(user.id)
        const { password , ...userData} = user
        res.json({user: userData, token})

    }catch(err){
        return handleServerError(err, "LoginController", res)
    }
}

export const verifyAuth = (req: AuthRequest, res: Response) => {
    res.status(200).json(req.user)
}