import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    if(!req.body || Object.keys(req.body).length == 0){
        return res.status(400).json({message: "El cuerpo de la solicitud es requerido"})
    }
    const result = schema.safeParse(req.body)
    if(!result.success){
        const format = result.error.issues.map( issue => {
            return {field: issue.path[0], message: issue.message}
        } )
        return res.status(400).json({
            message: "Error en los datos enviados",
            errors: format
        })
    }
    req.body = result.data
    next()
}