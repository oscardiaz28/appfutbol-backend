import { Request, Response } from "express";
import { getUserAndPlayerInfo, handleServerError, toPlayerDto } from "../lib/utils";
import { PlayerRequestType, UpdatePlayerType } from "../interfaces/types";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../models/prisma";
import { players, Prisma } from "@prisma/client";

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
        // res.json(newPlayer)
        res.json({success: true, message: "Jugador registrado exitosamente"})

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

        const players = data.map( player => {
            return toPlayerDto(player)
        })

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data: players
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
        res.json(toPlayerDto(player))

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
        const resp = players.map( player => {
            return toPlayerDto(player)
        } )
        res.json(resp)
        
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

        // res.json(updated)
        res.json({success: true, message: "Jugador editado correctamente"})

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
    }catch(err: any){
        if (err.code == 'P2003') {
            return res.status(400).json({ message: "No se ha podido eliminar el jugador, tienes registros asociados" })
        }
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

        res.json(toPlayerDto(player))

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
        
        res.json(toPlayerDto(updated))
        
    }catch(err){
        return handleServerError(err, "setPlayerStatus", res)
    }
}

export const getPlayerEvaluations = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if(isNaN(page) || page < 1) page = 1
    if(isNaN(size) || size < 1) size = 5

    try{
        const player = await prisma.players.findUnique({where: {id}})
        if(!player) return res.status(400).json({message: "Jugador no encontrado"})

        const skip = (page - 1) * size
        
        const [data, totalItems] = await Promise.all([
            prisma.evaluations.findMany({
                skip,
                take: size,
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
                },
                orderBy: {fecha: 'desc'}
            }),
            prisma.evaluations.count()
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
        return handleServerError(err, "setPlayerStatus", res)
    }
}

const getTopByParameter = async (parametro: string, page: number, size: number) => {
    const offset = (page -1 ) * size;

    const totalItemsResult = await prisma.$queryRaw<{ total_items: number }[]>(Prisma.sql`
        SELECT COUNT(DISTINCT p.id) AS total_items
        FROM players p
        JOIN evaluations e ON e.player_id = p.id
        JOIN details_evaluation d ON d.evaluation_id = e.id
        JOIN parameters_evaluation pe ON pe.id = d.parameter_id
        WHERE pe.nombre = ${parametro}
    `);

    const totalItems = Number(totalItemsResult[0]?.total_items) || 0;
    const totalPages = Math.ceil(totalItems / size);

    const results = await prisma.$queryRaw(Prisma.sql`
        SELECT
        p.id AS player_id,
        p.nombre AS nombre,
        p.apellido as apellido,
        p.posicion as posicion,
        pe.nombre as parametro,
        avg(d.value) as value
        FROM players p
        INNER JOIN evaluations e ON e.player_id = p.id
        INNER JOIN details_evaluation d ON d.evaluation_id = e.id
        INNER JOIN parameters_evaluation pe ON pe.id = d.parameter_id
        WHERE pe.nombre = ${parametro}
        GROUP BY p.id, p.nombre, p.apellido, p.posicion, pe.nombre
        ORDER BY value DESC
        LIMIT ${Prisma.raw(String(size))} OFFSET ${Prisma.raw(String(offset))}
        `)

    return {
        currentPage: page,
        pageSize: size,
        totalItems,
        totalPages,
        results
    };
}

// CORREGIR - OBTENER EL TOP DE LA TABLA EVALUATIONS
export const topPlayers = async (req: Request, res: Response) =>{

    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5
    const orderBy = req.query.orderBy as string || "velocidad"

    if( isNaN(page) || page < 1 ) page = 1
    if( isNaN(size) || size < 1 ) size = 5

    try{
        const data = await getTopByParameter(orderBy, page, size)
        res.json(data)

    }catch(err){
        return handleServerError(err, "topPlayers", res)
    }
}

export const getPlayerGastos = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const player = await prisma.players.findUnique({where: {id}})
        if(!player) return res.status(400).json({success: false, message: "El jugador no existe"})

        const gastos = await prisma.gasto.findMany({
            where: {player_id: player.id},
            orderBy: {fecha: 'desc'},
            omit: {user_id: true, player_id: true},
            include: getUserAndPlayerInfo
        })
        
        res.json(gastos)

    }catch(err){
        return handleServerError(err, "getPlayerGastos", res)
    }
}