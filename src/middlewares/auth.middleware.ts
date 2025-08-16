import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import prisma from "../models/prisma";
import { RoleType, UserType } from "../interfaces/types";
import { formatDate } from "../lib/utils";

type DecodedType = {
    userId: string
}

export interface AuthRequest<T = any> extends Request<{}, {}, T> {
    user?: UserType
}

export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization
    if(!authorization || !authorization.startsWith("Bearer") ){
        res.status(403).json({message: "Sin autorización: Token no proporcionado"})
        return
    }
    const token = authorization.split(" ")[1];
    try{
        const decoded = <DecodedType>jwt.verify(token, <string>process.env.JWT_SECRET)
        
        const user = await prisma.users.findUnique({
            where: { id: parseInt(decoded.userId) },
            omit: { rol_id: true, password: true },
            include: { roles: {
                include: {permissions: {
                    omit: {roleId: true, permissionId: true},
                    include: {permission: {
                        select: { name: true }
                    }}
                } }
            }}
        })
        const permissions = user?.roles.permissions?.map( item => item.permission.name  ) || []

        if(!user) return res.status(400).json({message: "El usuario no ha sido encontrado"})

        if(user.estado !== true) return res.status(403).json({success: false, message: "Cuenta desabilitada, comunicate con el administrador"})

        const rol: RoleType = {
            id: user.roles.id,
            nombre: user.roles.nombre
        }

        const resp: UserType = {
            id: user.id,
            email: user.email,
            foto: user.foto,
            fecha_registro: formatDate(user.fecha_registro),
            nombre: user.nombre,
            apellido: user.apellido,
            estado: user.estado,
            rol,
            permissions
        }
        req.user = resp

        next()
    }catch(err){
        res.status(400).json({message: "Token inválido"})
        return
    }
}