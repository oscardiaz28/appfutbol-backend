import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import prisma from "../models/prisma";
import { UserType } from "../interfaces/types";

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
            where: {id: parseInt(decoded.userId) },
            omit: {password: true},
            include: {roles: true}
        })
        if(!user) return res.status(400).json({message: "User not found"})
        req.user = user
        next()
    }catch(err){
        res.status(400).json({message: "Token inválido"})
        return
    }
}