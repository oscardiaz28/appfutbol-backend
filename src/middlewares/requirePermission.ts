import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { success } from "zod";

export const requirePermission = (permission: string) => 
    async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {user} = req
    if(!user) return res.status(400).json({success: false, message: "El usuario no ha sido encontrado"})
    const permisos = user?.permissions
    if( permisos.includes(permission) === false ){
        console.log("No cuenta con el permiso")
        return res.status(403).json({success: false, message: "No autorizado: no cuentas con los permisos necesarios"})
    }
    next()
}