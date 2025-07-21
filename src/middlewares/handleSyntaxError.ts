import { NextFunction, Request, Response } from "express";

export const handleSyntaxError = ( err: any, req: Request, res: Response, next: NextFunction ) => {
    if(err instanceof SyntaxError && "body" in err ){
        return res.status(400).json({
            message: "El cuerpo no la solicitud no es un JSON valido"
        })
    }
    next(err)
}