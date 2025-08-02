import { Request, Response } from "express";
import { deleteImageIfExists, formatDate, handleServerError, hashPassword, toUserDto } from "../lib/utils";
import prisma from "../models/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from "node:path";

export const createUser = async ( req: Request, res: Response ) => {
    const {email, nombre, apellido, rol_id, password } = req.body;
    try{
        const existRol = await prisma.roles.findUnique({where: {id: rol_id}})
        if(!existRol) return res.status(400).json({success: false, message: "El rol no existe"});

        const existUser = await prisma.users.findUnique({where: {email: email}})
        if(existUser) return res.status(400).json({success: false, message: "El usuario ya existe"});

        const hashedPass = await hashPassword(req.body.password);

        const newUser = await prisma.users.create({
            data: {
                email,
                nombre,
                apellido,
                rol_id,
                password: hashedPass
            }
        })
        // const { password, ...userData } = newUser
        res.json({success: true, message: "Usuario creado correctamente"});

    }catch(err){
        return handleServerError(err, "createUser", res);
    }
}


export const getAllUsers = async (req: Request, res: Response) => {
    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if( isNaN(page) || page < 1 ) page = 1
    if( isNaN(size) || size < 1 ) size = 5
    if( size < page ) size = 5
    
    try{
        const skip = (page - 1) * size;
        
        const [data, totalItems] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: size,
                omit: {password: true, rol_id: true},
                include: {roles: true},
                orderBy: {fecha_registro: "desc"}
            }),
            prisma.users.count()
        ])
        const totalPages = Math.ceil(totalItems / size);

        const resp = data.map( user => {
            return toUserDto(user)
        } )

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data: resp
        })

    }catch(err){
        return handleServerError(err, "getAllUsers", res)
    }
}

export const getOneUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const user = await prisma.users.findUnique({
            where: {id},
            omit: {password: true, rol_id: true},
            include: {roles: true}
        })
        if(!user) return res.status(400).json({success: false, message: "El usuario no existe"})
        // res.json(user)
        res.json(toUserDto(user))

    }catch(err){
        return handleServerError(err, "getOneUser", res)
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const user = await prisma.users.findUnique({where: {id: id}})
        if(!user) return res.status(400).json({success: false, message: "El usuario no existe"})

        await prisma.users.delete({where: {id}})

        res.json({success: true, message: "El usuario ha sido eliminado exitosamente"})

    }catch(err: any){
        if (err.code == 'P2003') {
            return res.status(400).json({success: false, message: "No se ha podido eliminar el usuario, tienes registros asociados" })
        }
        return handleServerError(err, "deleteUser", res)
    }
}

export const userProfile = async (req: AuthRequest, res: Response) => {
    try{
        const { permissions, ...data } = req.user!
        res.json(data)

    }catch(err){
        return handleServerError(err, "userProfile", res)
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    const {email, rol_id} = req.body
    try{
        const user = await prisma.users.findUnique({where: {id}})
        if(!user) return res.status(400).json({success: false, message: "El usuario no existe"})

        const rol = await prisma.roles.findUnique({where: {id: rol_id}})
        if(!rol) return res.status(400).json({success: false, message: "El rol no existe"})

        if(email){
            const existEmail = await prisma.users.findUnique({
                where: {email, NOT: {id} }
            })
            if(existEmail){
                return res.status(400).json({success: false, message: "El email ya esta en uso"})
            }
        }

        const updatedUser = await prisma.users.update({
            where: {id},
            data: req.body,
            include: {roles: true},
            omit: {password: true}
        })
        // res.json(updatedUser)        
        res.json({success: false, message: "Usuario actualizado correctamente"})        

    }catch(err){
        return handleServerError(err, "updateUser", res)
    }
}

export const updateProfileUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const user = await prisma.users.findUnique({where: {id}})
        if(!user) return res.status(400).json({success: false, message: "El usuario no existe"})

        const updated = await prisma.users.update({
            where: {id},
            data: req.body
        })
        // res.json(updated)
        res.json({success: true, message: "Datos actualizados correctamente"})

    }catch(err){
        return handleServerError(err, "updateProfileUser", res)
    }
}

export const changePassword = async (req: AuthRequest, res: Response) => {
    const {user} = req
    const {current_password, new_password, repeat_new_password} = req.body
    try{
        const saved_password = await prisma.users.findUnique({where: {id: user?.id}, select: {password: true}})
        const isEqualPassword = await bcrypt.compare(current_password, saved_password!.password)

        if(!isEqualPassword) return res.status(400).json({success: false, message: "La contraseña actual es incorrecta"})

        if( new_password !== repeat_new_password ){
            return res.status(400).json({success: false, message: "Las contraseñas no son iguales"})
        }
        const hashPass = await hashPassword(new_password);
        await prisma.users.update({
            where: {id: user!.id},
            data: {password: hashPass}
        })
        res.json({success: true, message: "Contraseña actualizada correctamente"})

    }catch(err){
        return handleServerError(err, "changePassword", res)
    }
}


export const getSearchUsers = async (req: Request, res: Response) => {
    const rawQuery = req.query.query
    const query = typeof rawQuery === "string" ? rawQuery.trim() : ""

    try{    
        const users = await prisma.users.findMany({
            where: {
                OR: [
                    { nombre: {contains: query } },
                    { apellido: {contains: query} },
                    { email: {contains: query} },
                ]
            },
            omit: {password: true},
            include: {roles: true}
        })
        const resp = users.map( user => {
            return toUserDto(user) 
        })
        res.json(resp);

    }catch(err){
        return handleServerError(err, "getSearchUsers", res)
    }
}


export const uploadFoto = async (req: AuthRequest, res: Response) => {
    const {user} = req
    const file = req.file

    try{
        let foto: string | null = null;

        if(file){
            const { mimetype, filename } = file

            if(!mimetype.startsWith("image/")){
                deleteImageIfExists(filename)
                return res.status(400).json({success: false, message: "Formato no permitido"})
            }
            foto= filename;
            deleteImageIfExists(user?.foto)

        }else{
            deleteImageIfExists(user?.foto)
            foto = null
        }

        await prisma.users.update({
            where: {id: user!.id},
            data: {foto}
        })
        
        res.json({success: true, message: "Foto actualizada correctamente"})

    }catch(err){
        return handleServerError(err, "uploadFoto", res)
    }
}

export const showFoto = async (req: Request, res: Response) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', '..', 'uploads', filename)
    if(fs.existsSync(filePath)){
        res.sendFile(filePath)
    }else{
        res.status(404).json({success: false, message: "Archivo no encontrado"})
    }
}