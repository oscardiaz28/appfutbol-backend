import { Request, Response } from "express";
import { getUserAndPlayerInfo, handleServerError, hasAdminRole } from "../lib/utils";
import prisma from "../models/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Prisma } from "@prisma/client";

export const createGasto = async (req: AuthRequest, res: Response) => {
    const {user} = req
    const {player_id, monto, descripcion, fecha} = req.body
    try{
        const existPlayer = await prisma.players.findUnique({where: {id: player_id}})
        if(!existPlayer) return res.status(400).json({success: false, message: "El jugador no existe"})

        const newGasto = await prisma.gasto.create({
            data: {
                player_id,
                user_id: user!.id,
                monto: monto,
                descripcion,
                fecha: new Date(fecha)
            }
        })
        await prisma.players.update({
            where: {id: player_id},
            data: { monto: { increment: monto } } // propiedad para agregar el monto al jugador.
        })
        res.json(newGasto)

    }catch(err){
        return handleServerError(err, "createGasto", res)
    }
}

export const editGasto = async (req: Request, res: Response) => {
    const {monto, descripcion} = req.body
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const gasto = await prisma.gasto.findUnique({where: {id}})
        if(!gasto) return res.status(400).json({success: false, message: "El gasto no existe"})

        const diff = new Prisma.Decimal(monto).minus(gasto.monto)

        await prisma.$transaction([
            prisma.gasto.update({
                where: {id},
                data: req.body
            }),
            prisma.players.update({
                where: {id: gasto.player_id},
                data: { monto: { increment: diff } }
            })
        ])

        res.json({success: true, message: "Gasto editado correctamente"})

    }catch(err){
        return handleServerError(err, "editGasto", res)
    }
}

export const getOneGasto = async (req: AuthRequest, res: Response) => {
    const {user} = req
    const params: any = req.params
    const id = parseInt(params.id)

    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        /*
        let gasto;
        if( hasAdminRole(user) ){
            gasto = await prisma.gasto.findUnique({ where: {id}, include: getUserWhoCreateGasto })
        }else{
            gasto = await prisma.gasto.findUnique({ where: {id}, omit: {user_id: true} })
        }
        */
        const gasto = await prisma.gasto.findUnique({
            where: {id}, 
            omit: {user_id: true, player_id: true}, 
            include: getUserAndPlayerInfo
        })
        if(!gasto) return res.status(400).json({success: false, message: "El gasto no existe"})
            
        res.json(gasto)

    }catch(err){
        return handleServerError(err, "getOneGasto", res)
    }
}

export const deleteGasto = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const gasto = await prisma.gasto.findUnique({where: {id}})
        if(!gasto) return res.status(400).json({success: false, message: "El gasto no existe"})

        const playerId = gasto.player_id;

        await prisma.players.update({
            where: {id: playerId},
            data: {monto: {decrement: gasto.monto }}
        })

        await prisma.gasto.delete({where: {id}})

        res.json({success: true, message: "Gasto eliminado correctamente"})
        
    }catch(err: any){
        return handleServerError(err, "deleteGasto", res)
    }
}

export const getAllGastos = async (req: Request, res: Response) => {
    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if( isNaN(page) || page < 1 ) page = 1
    if ( isNaN(size) || size < 1 ) size = 5

    try{
        const skip = (page - 1) * size

        const [data, totalItems] = await Promise.all([
            prisma.gasto.findMany({
                skip,
                take: size,
                orderBy: {fecha: 'desc'},
                include: getUserAndPlayerInfo,
                omit: {user_id: true, player_id: true}

            }),
            prisma.gasto.count()
        ])
        const totalPages = Math.ceil( totalItems / size )

         res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data
        })

    }catch(err){
        return handleServerError(err, "getAllGastos", res)
    }
}