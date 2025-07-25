import { Request, Response } from "express";
import { handleServerError, hashPassword } from "../lib/utils";
import prisma from "../models/prisma";

export const createUser = async ( req: Request, res: Response ) => {
    const {username, email, nombre, apellido, rol_id, password } = req.body;
    try{
        const existRol = await prisma.roles.findUnique({where: {id: rol_id}})
        if(!existRol) return res.status(400).json({success: false, message: "El rol no existe"});

        const existUser = await prisma.users.findUnique({where: {email: email}})
        if(existUser) return res.status(400).json({success: false, message: "El usuario ya existe"});

        const hashedPass = await hashPassword(req.body.password);

        const newUser = await prisma.users.create({
            data: {
                username,
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