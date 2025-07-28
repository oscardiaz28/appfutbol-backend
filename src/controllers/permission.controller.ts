import { Request, Response } from "express";
import { handleServerError } from "../lib/utils";
import prisma from "../models/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAllPermissions = async (req: Request, res: Response) => {
    try{
        const permissions = await prisma.permission.findMany()
        res.json(permissions)
    }catch(err){
        return handleServerError(err, "getAllPermissions", res)
    }
}

export const createPermission = async (req: AuthRequest, res: Response) => {
    const {name, description} = req.body
    const { user } = req

    try{
        const existing = await prisma.permission.findUnique({where: {name }})
        if(existing) return res.status(400).json({success: false, message: "El permiso ya ha sido creado"})

        const permission = await prisma.permission.create({
            data: {name, description}
        })

        await prisma.rolePermission.create({
            data: {
                permissionId: permission?.id,
                roleId: user!.id
            }
        })
        
        res.json(permission)

    }catch(err){
        return handleServerError(err, "createPermission", res)
    }
}

export const getOnePermission = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const permission = await prisma.permission.findUnique({where: {id}})
        if(!permission) return res.status(400).json({success: false, message: "El permiso no existe"})

        res.json(permission)

    }catch(err){
        return handleServerError(err, "getOnePermission", res)
    }
}

export const editPermission = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    const {name, description} = req.body
    
    try{
        const exist = await prisma.permission.findUnique({where: {id}})
        if(!exist) return res.status(400).json({success: false, message: "El permiso no existe"})
            
        if(name){
            const existName = await prisma.permission.findUnique({
                where: {name, NOT: {id} }
            })
            if(existName){
                return res.status(400).json({success: false, message: "El nombre ya esta registrado"})
            }
        }
        const updated = await prisma.permission.update({
            where: {id},
            data: req.body
        })
        res.json({success: true, message: "Permiso actualizado correctamente"})

    }catch(err){
        return handleServerError(err, "editPermission", res)
    }
}

export const deletePermission = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const permission = await prisma.permission.findUnique({where: {id}})
        if(!permission) return res.status(400).json({success: false, message: "El permiso no existe"})

        await prisma.permission.delete({where: {id}})
        
        res.json({success: true, message: "Permiso eliminado correctamente"})

    }catch(err: any){
        if (err.code == 'P2003') {
            return res.status(400).json({ message: "No se ha podido eliminar el permiso, tienes registros asociados" })
        }
        return handleServerError(err, "deletePermission", res)
    }
}