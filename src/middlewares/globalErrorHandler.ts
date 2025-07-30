import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export const globalErrorHandler = ( err: any, req: Request, res: Response, next: NextFunction  ) => {
    if(err instanceof MulterError ){
        let message
        if( err.message == "Unexpected field" ){
            message = ", campo no valido para subir la foto"
        }
        return res.status(400).json({success: false, message: `Erro al subir el archivo ${message}` })
    }
    console.log(err)
    res.status(500).json({success: false, message: `Error interno del servidor ${err.message}`})
}