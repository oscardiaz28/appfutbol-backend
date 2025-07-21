import { Request, Response } from "express";
import { handleServerError } from "../lib/utils";
import { PlayerRequestType, UpdatePlayerType } from "../interfaces/types";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../models/prisma";
import { players } from "@prisma/client";

export const addPlayer = async (req: AuthRequest<PlayerRequestType>, res: Response) => {
    const { user } = req
    const { nombre, apellido, fecha_nacimiento, fecha_registro, identificacion, pais, 
        talla, peso, pie_habil, posicion
     } = req.body
    try {
        const isPlayerExist = await prisma.players.findFirst({where: {identificacion}})
        if(isPlayerExist){
            return res.status(400).json({message: "La identificación ya ha sido registrada"})
        }
        const newPlayer = await prisma.players.create({
            data: {
                nombre,
                apellido,
                fecha_nacimiento: new Date(fecha_nacimiento),
                fecha_registro: new Date(fecha_registro),
                identificacion,
                pais,
                talla,
                peso,
                pie_habil,
                posicion,
                user_id: user?.id
            }
        })
        res.json(newPlayer)

    } catch (err) {
        return handleServerError(err, "addPlayerController", res)
    }
}

export const getPlayers = async (req: Request, res: Response) => {
   
    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if(isNaN(page) || page < 1) page = 1
    if(isNaN(size) || size < 1) size = 5

    try {
        const skip = (page - 1) * size;

        const [data, totalItems] = await Promise.all([
            prisma.players.findMany({
                skip,
                take: size,
                orderBy: {fecha_registro: "desc"}
            }),
            prisma.players.count()
        ])
        const totalPages = Math.ceil(totalItems / size);

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data
        })

    } catch (err) {
        return handleServerError(err, "getPlayers", res)
    }
}


export const getPlayer = async (req: Request, res: Response) => {
    const {id} = req.params
    if(isNaN(parseInt(id))){
        return res.status(400).json({message: "El ID es inválido"})
    }
    try{
        const player = await prisma.players.findUnique({where: {id: Number(id) }})
        if(!player){
            return res.status(400).json({message: "Jugador no encontrado"})
        }
        res.json(player)
    }catch(err){
        return handleServerError(err, "getPlayer", res)
    }
}

export const searchPlayer = async (req: Request, res: Response) => {
    const rawQuery = req.query.query
    const query = typeof rawQuery === "string" ? rawQuery.trim() : ""
    
    try{
        let players: players[];
        if(query === ""){
            players = []
        }else{
            players = await prisma.players.findMany({
                where: {
                    OR: [
                        { nombre: { contains: query } },
                        { apellido: { contains: query } }
                    ]
                }
            })
        }
        res.json(players)
        
    }catch(err){
        return handleServerError(err, "searchPlayer", res)
    }
}


export const editPlayer = async (req: Request<{}, {}, UpdatePlayerType>, res: Response) => {
    const { id }= req.params as {id: string}
    
    if(isNaN(parseInt(id))){
        return res.status(400).json({message: "El ID es inválido"})
    }
    try{
        const player = await prisma.players.findUnique({where: { id: parseInt(id) }})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})

        const isIdentificacionUsed = await prisma.players.findFirst({
                where: {identificacion: req.body.identificacion, id: {not: player.id}}
            })
        if( isIdentificacionUsed ){
            return res.status(400).json({message: "No puede usar esa identificacion, ya esta registrada"})
        }

        const updated = await prisma.players.update({
            where: {id: Number(id)},
            data: req.body
        })

        res.json(updated)

    }catch(err){
        return handleServerError(err, "editPlayer", res)
    }
}


export const deletePlayer = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{    
        const player = await prisma.players.findUnique({where: {id: id}})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})

        await prisma.players.delete({
            where: {id}
        })
        res.json({message: "Jugador eliminado correctamente"})
    }catch(err){
        return handleServerError(err, "deletePlayer", res)
    }
}


export const setPlayerStatus = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const player = await prisma.players.findUnique({where: {id}})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})
        
        const newStatus = player.activo ? false : true

        const updated = await prisma.players.update({
            where: {id},
            data: {activo: newStatus}
        })
        res.json(updated)

    }catch(err){
        return handleServerError(err, "setPlayerStatus", res)
    }
}

export const setPlayerAsProspecto = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const player = await prisma.players.findUnique({where: {id}})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})

        const newProspecto = player.prospecto ? false : true

        const updated = await prisma.players.update({
            where: {id},
            data: {prospecto: newProspecto}
        })
        res.json(updated)
        
    }catch(err){
        return handleServerError(err, "setPlayerStatus", res)
    }
}

export const getPlayerEvaluations = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const player = await prisma.players.findUnique({where: {id}})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})
        
        const evaluations = await prisma.evaluations.findMany({
            where: {
                player_id: id
            },
            omit: {type_evaluation_id: true},
            include: {
                types_evaluation: true,
                details_evaluation: {
                    include: {parameters_evaluation: true},
                    omit: {evaluation_id: true, parameter_id: true}
                }
            }
        })
        res.json(evaluations)
    }catch(err){
        return handleServerError(err, "setPlayerStatus", res)
    }
}