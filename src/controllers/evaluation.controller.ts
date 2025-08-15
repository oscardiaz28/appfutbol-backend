import { Request, Response } from "express"
import { handleServerError } from "../lib/utils"
import prisma from "../models/prisma"
import { success } from "zod"

export const createEvaluation = async (req: Request, res: Response) => {
    const { playerId, tipoId, parametros } = req.body
    try{

        const player = await prisma.players.findUnique({where: {id: parseInt(playerId)}})
        if(!player) return res.status(400).json({message: "El jugador no existe"})
        const type = await prisma.types_evaluation.findUnique({where: {id: parseInt(tipoId)}})
        if(!type) return res.status(400).json({message: "El tipo de evaluación no existe"})

        const evaluacion = await prisma.evaluations.create({
            data: {
                player_id: parseInt(playerId),
                type_evaluation_id: parseInt(tipoId)
            }
        })
        const params = parametros.map( (p: any) => ({
            evaluation_id: evaluacion.id,
            parameter_id: p.parametroId,
            value: p.valor
        }))
        await prisma.details_evaluation.createMany({data: params})

        // res.json(evaluacion)
        res.json({success: true, message: "Evaluacion realizada correctamente"})

    }catch(err){
        return handleServerError(err, "createEvaluation", res)
    }
}


export const editEvaluation = async (req: Request, res: Response) => {
    // TODO - validar el req.body mediante el schema de zod (seguir ejm de schema anteriores)
    const evaluationId = parseInt(req.params.id)
    if(isNaN(evaluationId)){
        return res.status(400).json({success: false, message: "El ID no es válido"})
    }
    try{
        const evaluation = await prisma.evaluations.findUnique({where: {id: evaluationId} })
        if(!evaluation){
            return res.status(400).json({success: false,message: "La evaluación no existe"})
        }
        const {parametros} = req.body

        for( const { parametroId, valor } of parametros ){
            const detail = await prisma.details_evaluation.findFirst({where: {AND: [ 
                {evaluation_id: evaluationId },
                {parameter_id: parametroId }
            ]} })
            if(!detail){
                return res.status(400).json({
                    message: `El parámetro con ID ${parametroId} no existe en esta evaluación`
                });
            }
            const updated = await prisma.details_evaluation.update({
                where: {id: detail.id},
                data: {value: valor}
            })
        }
        res.json({success: true, message: "Parametros actualizados correctamente"})

    }catch(err){
        return handleServerError(err, "editEvaluation", res)
    }
}


export const deleteEvaluation = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: false, message: "El ID no es válido"})
    try{
        const evaluation = await prisma.evaluations.findUnique({where: {id}})
        if(!evaluation) return res.status(400).json({success: false, message: "La evaluación no existe"})

        await prisma.evaluations.delete({where: {id}})
        res.json({success: true, message: "Evaluación eliminada correctamente"})

    }catch(err){
        return handleServerError(err, "deleteEvaluation", res)
    }
}


export const getOneEvaluation = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)) return res.status(400).json({success: true, message: "El ID no es válido"})
    try{
        const evaluation = await prisma.evaluations.findUnique({
            where: {id},
            omit: {type_evaluation_id: true, player_id: true},
            include: {
                players: {select: {id: true, nombre: true, apellido: true, posicion: true}},
                types_evaluation: true,
                details_evaluation: {
                    omit: {evaluation_id: true, parameter_id: true},
                    include: {parameters_evaluation: true}
                }
            }
        })
        if(!evaluation) return res.status(400).json({success: false, message: "La evaluación no existe"})

        res.json(evaluation)

    }catch(err){
        return handleServerError(err, "getOneEvaluation", res)
    }
}