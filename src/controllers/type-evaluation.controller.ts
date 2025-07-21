import { Request, Response } from "express"
import { handleServerError } from "../lib/utils"
import { TypeEvaluationRequestType } from "../interfaces/types"
import prisma from "../models/prisma"

export const createTypeEvaluation = async (req: Request, res: Response) => {
    const {nombre, icono} = req.body
    try{
        const existing = await prisma.types_evaluation.findFirst({where: {nombre}})
        if(existing){
            return res.status(400).json({message: "El tipo de evaluación ya existe"})
        }
        const newType = await prisma.types_evaluation.create({
            data: {
                nombre,
                icono,
            }
        })
        res.json(newType)
    }catch(err){
        return handleServerError(err, "createTypeEvaluation", res)
    }
}

export const getTypes = async (req: Request, res: Response) => {
    try{    
        const types = await prisma.types_evaluation.findMany()
        res.json(types)
    }catch(err){
        return handleServerError(err, "getTypes", res)
    }
}

export const getParameters = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const type = await prisma.types_evaluation.findUnique({
            where: {id},
            include: {parameters_evaluation: {
                omit: {type_id: true}
            }}
        })
        if(!type){
            return res.status(400).json({message: "El tipo de evaluación no existe"})
        }
        res.json(type.parameters_evaluation)

    }catch(err){
        return handleServerError(err, "getParameters", res)
    }
}


export const getOneType = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if(isNaN(id)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const type = await prisma.types_evaluation.findUnique({
            where: {id},
            include: {parameters_evaluation: {
                omit: {type_id: true}
            }}
        })
        if(!type){
            return res.status(400).json({message: "Tipo de evaluación no encontrado"})
        }
        res.json(type)
        
    }catch(err){
        return handleServerError(err, "getOneType", res)
    }
}

export const createParameter = async (req: Request, res: Response) => {
    const {nombre, descripcion, typeId} = req.body
    try{
        const type = await prisma.types_evaluation.findUnique({where: {id: parseInt(typeId)}})
        if(!type){
            return res.status(400).json({message: "El tipo de evaluación no se ha encontrado"})
        }
        const existing = await prisma.parameters_evaluation.findFirst({
            where: {
                AND: [
                    { nombre: {equals: nombre} },
                    { type_id: {equals: type.id} }
                ]
            }
        })
        if(existing){
            return res.status(400).json({message: "El parametro ya existe"})
        }
        const newParameter = await prisma.parameters_evaluation.create({
            data: {nombre, descripcion, type_id: type.id}
        })

        res.json(newParameter)

    }catch(err){
        return handleServerError(err, "createParameter", res)
    }
}

export const deleteParameter = async (req: Request, res: Response) => {
    const parameterId = parseInt(req.params.id)
    if(isNaN(parameterId)){
        return res.status(400).json({message: "El ID no es válido"})
    }
    try{
        const parameter = await prisma.parameters_evaluation.findUnique({where: {id: parameterId}})
        if(!parameter) return res.status(400).json({message: "El parametro de evaluación no existe"})

        await prisma.parameters_evaluation.delete({where: {id: parameterId}})
        res.json({message: "El parametro de evaluación ha sido eliminado correctamente"})

    }catch(err: any){
        if( err.code == 'P2003'){
            return res.status(400).json({message: "No se ha podido eliminar el parametro, tienes registros asociados"})
        }
        return handleServerError(err, "deleteParameter", res)
    }
}