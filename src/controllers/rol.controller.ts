import { Request, Response } from "express"
import { handleServerError } from "../lib/utils"
import prisma from "../models/prisma"

export const getRoles = async (req: Request, res: Response) => {
    try{    
        const roles = await prisma.roles.findMany()
        res.json(roles)
    }catch(err){
        return handleServerError(err, "getRoles", res)
    }
}