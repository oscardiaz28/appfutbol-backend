import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireRole = (role: string) => async (req: AuthRequest, res: Response, next: NextFunction) => {
    
    const {user} = req
    if(user?.rol.nombre !== role.toLowerCase() ){
        return res.status(403).json({success: false, message: "Acceso denegado: rol insuficiente"})
    }
    next()
}