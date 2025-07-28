import { Request, Response } from "express"
import { handleServerError, hasAdminRole } from "../lib/utils"
import { TypeEvaluationRequestType } from "../interfaces/types"
import prisma from "../models/prisma"
import { success } from "zod"
import { AuthRequest } from "../middlewares/auth.middleware"

export const createTypeEvaluation = async (req: Request, res: Response) => {
    const { nombre, icono } = req.body
    try {
        const existing = await prisma.types_evaluation.findFirst({ where: { nombre } })
        if (existing) {
            return res.status(400).json({ message: "El tipo de evaluación ya existe" })
        }
        const newType = await prisma.types_evaluation.create({
            data: {
                nombre,
                icono,
            }
        })
        res.json({success: true, message: "Tipo de evaluacion creado exitosamente" })
    } catch (err) {
        return handleServerError(err, "createTypeEvaluation", res)
    }
}

export const getTypes = async (req: AuthRequest, res: Response) => {
    const { user } = req
    try {
        let types;
        if (hasAdminRole(user)) {
            types = await prisma.types_evaluation.findMany()
        } else {
            types = await prisma.types_evaluation.findMany({ where: { estado: true } })
        }
        res.json(types)
    } catch (err) {
        return handleServerError(err, "getTypes", res)
    }
}

export const getParameters = async (req: AuthRequest, res: Response) => {
    const params: any = req.params
    const id = parseInt(params.id)
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID no es válido" })
    }
    const { user } = req
    try {
        let type;
        if ( hasAdminRole(user)) {
            type = await prisma.types_evaluation.findUnique({
                where: { id },
                include: {
                    parameters_evaluation: {
                        omit: { type_id: true }
                    }
                }
            })
        } else {
            type = await prisma.types_evaluation.findFirst({
                where: { id: id },
                include: {
                    parameters_evaluation: {
                        omit: { type_id: true },
                        where: {estado: true}
                    }
                }
            })
        }
        if (!type) {
            return res.status(400).json({ message: "El tipo de evaluación no existe" })
        }
        res.json(type.parameters_evaluation)

    } catch (err) {
        return handleServerError(err, "getParameters", res)
    }
}


export const getOneType = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID no es válido" })
    }
    try {
        const type = await prisma.types_evaluation.findUnique({
            where: { id },
            include: {
                parameters_evaluation: {
                    omit: { type_id: true }
                }
            }
        })
        if (!type) {
            return res.status(400).json({ message: "Tipo de evaluación no encontrado" })
        }
        res.json(type)

    } catch (err) {
        return handleServerError(err, "getOneType", res)
    }
}

export const createParameter = async (req: Request, res: Response) => {
    const { nombre, descripcion, type_id } = req.body
    try {
        const type = await prisma.types_evaluation.findUnique({ where: { id: parseInt(type_id) } })
        if (!type) {
            return res.status(400).json({ message: "El tipo de evaluación no se ha encontrado" })
        }
        const existing = await prisma.parameters_evaluation.findFirst({
            where: {
                nombre: { equals: nombre },
            }
        })
        if (existing) {
            return res.status(400).json({ message: "El parametro ya existe" })
        }
        const newParameter = await prisma.parameters_evaluation.create({
            data: { nombre, descripcion, type_id: type.id }
        })

        res.json(newParameter)

    } catch (err) {
        return handleServerError(err, "createParameter", res)
    }
}

export const deleteParameter = async (req: Request, res: Response) => {
    const parameterId = parseInt(req.params.id)
    if (isNaN(parameterId)) {
        return res.status(400).json({ message: "El ID no es válido" })
    }
    try {
        const parameter = await prisma.parameters_evaluation.findUnique({ where: { id: parameterId } })
        if (!parameter) return res.status(400).json({ message: "El parametro de evaluación no existe" })

        await prisma.parameters_evaluation.delete({ where: { id: parameterId } })
        res.json({success: true, message: "El parametro de evaluación ha sido eliminado correctamente" })

    } catch (err: any) {
        if (err.code == 'P2003') {
            return res.status(400).json({success: false, message: "No se ha podido eliminar el parametro, tienes registros asociados" })
        }
        return handleServerError(err, "deleteParameter", res)
    }
}


export const deleteType = async (req: Request, res: Response) => {
    const typeId = parseInt(req.params.id)
    if (isNaN(typeId)) return res.status(400).json({ success: false, message: "El ID no es válido" })
    try {
        const type = await prisma.types_evaluation.findUnique({ where: { id: typeId } })
        if (!type) return res.status(400).json({ success: false, message: "El tipo de evaluación no existe" })

        await prisma.types_evaluation.delete({ where: { id: typeId } })

        res.json({ success: true, message: "El tipo de evaluación ha sido eliminado correctamente" })

    } catch (err: any) {
        if (err.code == 'P2003') {
            return res.status(400).json({ success: false, message: "No se ha podido eliminar el tipo de evaluación, tienes registros asociados" })
        }
        return handleServerError(err, "deleteType", res)
    }
}

export const updateType = async (req: Request, res: Response) => {
    const { nombre, icono } = req.body
    const typeId = parseInt(req.params.id)
    if (isNaN(typeId)) return res.status(400).json({ success: false, message: "El ID no es válido" })
    try {

        const type = await prisma.types_evaluation.findUnique({ where: { id: typeId } })
        if (!type) return res.status(400).json({ success: false, message: "El tipo de evaluación no existe" })

        if (nombre) {
            const existing = await prisma.types_evaluation.findFirst({
                where: { nombre, NOT: { id: type.id } }
            })
            if (existing) {
                return res.status(400).json({ message: "Ya existe el tipo de evaluacion con ese nombre " })
            }
        }
        const updated = await prisma.types_evaluation.update({
            where: { id: typeId },
            data: req.body
        })

        res.json({success: true, message: "Tipo de evaluacion editado correctamente"})

    } catch (err) {
        return handleServerError(err, "updateType", res)
    }
}

export const setTypeEvaluationState = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "El ID no es válido" })
    }
    try {
        const type = await prisma.types_evaluation.findUnique({ where: { id } })
        if (!type) return res.status(400).json({ success: false, message: "El tipo de evaluación no existe" })

        const newStatus = type.estado ? false : true

        const updated = await prisma.types_evaluation.update({
            where: { id },
            data: { estado: newStatus }
        })
        res.json(updated)
    } catch (err) {
        return handleServerError(err, "setTypeEvaluationState", res)
    }
}

export const setParameterStatus = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: "El ID no es válido" })
    try {
        const parameter = await prisma.parameters_evaluation.findUnique({ where: { id } })
        if (!parameter) return res.status(400).json({ success: false, message: "El parametro no ha sido encontrado" })

        const newStatus = parameter.estado ? false : true

        const updated = await prisma.parameters_evaluation.update({
            where: { id },
            data: { estado: newStatus }
        })
        res.json(updated)
    } catch (err) {
        return handleServerError(err, "updateParameter", res)
    }
}

export const updateParameter = async (req: Request, res: Response) => {
    const { nombre, descripcion, type_id } = req.body
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: "El ID no es válido" })

    try {
        const parameter = await prisma.parameters_evaluation.findUnique({ where: { id } })
        if (!parameter) return res.status(400).json({ success: false, message: "El parametro no existe" })

        if (type_id) {
            const type = await prisma.types_evaluation.findUnique({ where: { id: type_id } })
            if (!type) return res.status(400).json({ success: false, mesage: "El tipo de evaluación no existe" })
        }

        if (nombre) {
            const existParameter = await prisma.parameters_evaluation.findFirst({
                where: { nombre, NOT: { id: parameter.id } }
            })
            if (existParameter) {
                return res.status(400).json({ success: false, message: "El nombre del parametro ya esta registrado" })
            }
        }

        const updated = await prisma.parameters_evaluation.update({
            where: { id },
            data: req.body
        })

        res.json(updated)

    } catch (err) {
        return handleServerError(err, "updateParameter", res)
    }
}


export const getOneParameter = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: "El ID no es válido" })
    try{
        const parameter = await prisma.parameters_evaluation.findUnique({ where: { id }, omit: {type_id: true}, include: {types_evaluation: true} })
        if (!parameter) return res.status(400).json({ success: false, message: "El parametro no existe" })
        res.json(parameter)

    }catch(err){
        return handleServerError(err, "getOneParamter", res)
    }
}