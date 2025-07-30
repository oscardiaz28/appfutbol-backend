import { Request, Response } from "express"
import { handleServerError, rolWithPermissionInclude } from "../lib/utils"
import prisma from "../models/prisma"



export const getRoles = async (req: Request, res: Response) => {
    try{    
        // const roles = await prisma.roles.findMany({
        //     include: rolWithPermissionInclude
        // })
        const roles = await prisma.roles.findMany()
        /*
        const resp = roles.map(rol => {
            const permissions = rol.permissions.map(p => ({
                id: p.permission.id,
                name: p.permission.name,
                description: p.permission.description
            }));
            return {
                id: rol.id,
                nombre: rol.nombre,
                permissions
            };
        });*/
        res.json(roles)
    }catch(err){
        return handleServerError(err, "getRoles", res)
    }
}


export const setPermissions = async (req: Request, res: Response) => {  
    const rolId = parseInt(req.params.id)
    if(isNaN(rolId)) return res.status(400).json({success: false, message: "El id no es válido"})

    const {permisos} : {permisos: number[]} = req.body || {}
    if(!permisos) return res.status(400).json({message: "Los permisos son necesarios"})

    try{
        const rol = await prisma.roles.findUnique({where: {id: rolId}})
        if(!rol) return res.status(400).json({success: false, message: "El rol no existe"})

        //validando si algun permiso no existe
        for (const p of permisos) {
            const exist = await prisma.permission.findUnique({ where: { id: p } })
            if (!exist) {
                return res.status(400).json({ success: false, message: `El permiso ${p} no existe` })
            }
        }
        await prisma.rolePermission.deleteMany({
            where: { roleId: rolId }
        });
        const inserts = permisos.map( p => ({
            roleId: rolId,
            permissionId: p
        }) )
        await prisma.rolePermission.createMany({
            data: inserts,
            skipDuplicates: true
        })
        res.json({success: true, message: "Roles asignados correctamente"})

    }catch(err){
        return handleServerError(err, "setPermissions", res)
    }
}

export const getOneRolWithPermissions = async (req: Request, res: Response) => {
     const rolId = parseInt(req.params.id)
        if(isNaN(rolId)) return res.status(400).json({success: false, message: "El id no es válido"})

    try{
        const allpermissions = await prisma.permission.findMany()

        const rol = await prisma.roles.findUnique({
            where: {id: rolId},
            include: rolWithPermissionInclude
        })

        if(!rol) return res.status(400).json({success: false, message: "El rol no existe"})

        const seleccionados = rol?.permissions.map( p => (p.permission.id))

        const resp = {
            id: rol.id,
            nombre: rol.nombre,
            permisos: allpermissions,
            seleccionados
        }
        res.json(resp)

    }catch(err){
        return handleServerError(err, "getPermissionsByRol", res)
    }
}

export const createRol = async (req: Request, res: Response) => {
    if(!req.body) return res.status(400).json({success: false, message: "El cuerpo de la solicitud es requerido"})
    const {nombre} = req.body || {}

    if( !nombre ) return res.status(400).json({success: false, message: "El nombre es requerido"})
    if( typeof nombre !== 'string' ) return res.status(400).json({success: false, message: "Valor no válido para el nombre"})

    try{
        const exist = await prisma.roles.findUnique({where: {nombre}})
        if(exist) return res.status(400).json({success: false, message: "El rol ya ha sido registrado"})

        const newRol = await prisma.roles.create({
            data: {nombre}
        })
        res.json({success: true, message: "El rol ha sido creado correctamente"})

    }catch(err){
        return handleServerError(err, "createRol", res)
    }
}

export const deleteRol = async (req: Request, res: Response) => {
    const rolId = parseInt(req.params.id)
    if(isNaN(rolId)) return res.status(400).json({success: false, message: "El id no es válido"})
    try{

        const rol = await prisma.roles.findUnique({where: {id: rolId}})
        if(!rol) return res.status(400).json({success: false, message: "El rol no existe"})

        await prisma.roles.delete({where: {id: rolId}})

        res.json({success: true, message: "Rol eliminado correctamente"})

    }catch(err: any){
        if(err.code === "P2003"){
            return res.status(400).json({ message: "No se ha podido eliminar el rol, tienes registros asociados" })
        }

        return handleServerError(err, "deleteRol", res)
    }
}


export const editRol = async (req: Request, res: Response) => {
    const rolId = parseInt(req.params.id)
    const {nombre} : {nombre: string} = req.body || {}
    if(isNaN(rolId)) return res.status(400).json({success: false, message: "El id no es válido"})

    try{
        const rol = await prisma.roles.findUnique({where: {id: rolId}})
        if(!rol) return res.status(400).json({success: false, message: "El rol no existe"})

        let updated;
        if( nombre && nombre.trim() !== "" ){
            const exist = await prisma.roles.findUnique({where: {nombre, NOT: {id: rolId} } })
            if(exist){
                return res.status(400).json({success: false, message: "El nombre ya esta registrado, intente otro"})
            }
            const formatedNombre = nombre.toLowerCase()
            updated = await prisma.roles.update({
                where: {id: rolId},
                data: {nombre: formatedNombre }
            })
        }
        res.json({success: true, message: "Permiso editado correctamente"})
        
    }catch(err){
        return handleServerError(err, "editRol", res)
    }
}